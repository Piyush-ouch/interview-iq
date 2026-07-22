import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }


    resumeText = resumeText
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];


    const aiResponse = await askAi(messages)

    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath)


    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


export const generateQuestion = async (req, res) => {
  let creditDeducted = false;

  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." });
    }

    // Atomic Credit Reservation (Prevents Concurrent Request Race Conditions)
    const user = await User.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: 50 } },
      { $inc: { credits: -50 } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 credits required.",
      });
    }

    creditDeducted = true;

    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

    if (!userPrompt.trim()) {
      // Refund credits if prompt invalid
      await User.findByIdAndUpdate(req.userId, { $inc: { credits: 50 } });
      return res.status(400).json({ message: "Prompt content is empty." });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      // Refund credits if AI returns empty response
      await User.findByIdAndUpdate(req.userId, { $inc: { credits: 50 } });
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      // Refund credits if question array generation fails
      await User.findByIdAndUpdate(req.userId, { $inc: { credits: 50 } });
      return res.status(500).json({ message: "AI failed to generate questions." });
    }

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error) {
    // Atomic refund in case of unhandled error
    if (creditDeducted) {
      await User.findByIdAndUpdate(req.userId, { $inc: { credits: 50 } }).catch((err) =>
        console.error("Credit refund error:", err)
      );
    }
    return res.status(500).json({ message: `Failed to create interview: ${error.message}` });
  }
};


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken, speechAnalysis } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ message: "Invalid question index." });
    }

    // Save speech analysis data if provided
    if (speechAnalysis) {
      question.speechAnalysis = {
        wpm: speechAnalysis.wpm || 0,
        fillerWordsCount: speechAnalysis.fillerWordsCount || 0,
        fillerWordsList: speechAnalysis.fillerWordsList || [],
        pauseCount: speechAnalysis.pauseCount || 0,
        verbalConfidenceScore: speechAnalysis.verbalConfidenceScore || 0,
        speechFeedback: speechAnalysis.speechFeedback || [],
      };
    }

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`,
      },
    ];

    const aiResponse = await askAi(messages);
    let parsed;
    try {
      let cleanStr = aiResponse.trim().replace(/^```json\s*|\s*```$/gi, "").trim();
      parsed = JSON.parse(cleanStr);
    } catch {
      parsed = { confidence: 7, communication: 7, correctness: 7, finalScore: 7, feedback: "Good effort. Focus on technical clarity." };
    }

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback });
  } catch (error) {
    return res.status(500).json({ message: `failed to submit answer ${error}` });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "failed to find Interview" });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    let totalWpm = 0;
    let totalFillerWords = 0;
    let totalVerbalConfidence = 0;
    let validSpeechCount = 0;
    const allFillerWords = [];

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;

      if (q.speechAnalysis && q.speechAnalysis.wpm > 0) {
        totalWpm += q.speechAnalysis.wpm;
        totalFillerWords += q.speechAnalysis.fillerWordsCount || 0;
        totalVerbalConfidence += q.speechAnalysis.verbalConfidenceScore || 0;
        validSpeechCount++;
        if (Array.isArray(q.speechAnalysis.fillerWordsList)) {
          allFillerWords.push(...q.speechAnalysis.fillerWordsList);
        }
      }
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    const overallSpeechAnalytics = {
      avgWpm: validSpeechCount ? Math.round(totalWpm / validSpeechCount) : 0,
      totalFillerWords,
      avgVerbalConfidence: validSpeechCount ? Math.round(totalVerbalConfidence / validSpeechCount) : 0,
      topFillerWords: Array.from(new Set(allFillerWords)),
    };

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      overallSpeechAnalytics,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        speechAnalysis: q.speechAnalysis || null,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to finish Interview ${error}` });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview ${error}` });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid interview ID format." });
    }

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    // Ownership Verification (Prevents IDOR Vulnerability)
    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized: You do not have permission to view this report." });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    let totalWpm = 0;
    let totalFillerWords = 0;
    let totalVerbalConfidence = 0;
    let validSpeechCount = 0;
    const allFillerWords = [];

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;

      if (q.speechAnalysis && q.speechAnalysis.wpm > 0) {
        totalWpm += q.speechAnalysis.wpm;
        totalFillerWords += q.speechAnalysis.fillerWordsCount || 0;
        totalVerbalConfidence += q.speechAnalysis.verbalConfidenceScore || 0;
        validSpeechCount++;
        if (Array.isArray(q.speechAnalysis.fillerWordsList)) {
          allFillerWords.push(...q.speechAnalysis.fillerWordsList);
        }
      }
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    const overallSpeechAnalytics = {
      avgWpm: validSpeechCount ? Math.round(totalWpm / validSpeechCount) : 0,
      totalFillerWords,
      avgVerbalConfidence: validSpeechCount ? Math.round(totalVerbalConfidence / validSpeechCount) : 0,
      topFillerWords: Array.from(new Set(allFillerWords)),
    };

    return res.status(200).json({
      finalScore: interview.finalScore || 0,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      overallSpeechAnalytics,
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    console.error("Error fetching interview report:", error);
    return res.status(500).json({ message: `Failed to fetch interview report: ${error.message}` });
  }
};

export const generateFollowUp = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.body;

    if (!interviewId || questionIndex === undefined) {
      return res.status(400).json({ message: "interviewId and questionIndex are required." });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    // Verify ownership
    if (interview.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access to this interview." });
    }

    const targetQuestion = interview.questions[questionIndex];
    if (!targetQuestion) {
      return res.status(400).json({ message: "Invalid question index." });
    }

    // Don't generate follow-up if answer is empty or already a follow-up
    if (!targetQuestion.answer || !targetQuestion.answer.trim() || targetQuestion.isFollowUp) {
      return res.json({ skip: true, message: "No follow-up required." });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a live professional interview.

The candidate just answered a question. Generate ONE natural, adaptive follow-up question that directly probes deeper into a specific technical term, concept, project detail, or claim made in their answer.

Strict Rules:
- Generate exactly 1 follow-up question.
- Must be a single sentence between 12 and 22 words.
- Do NOT repeat the candidate's answer back to them in full.
- Ask directly and conversationally (e.g., "You mentioned X, how would you handle scenario Y?").
- Do NOT include quotes, numbering, or introductory chatter.
`
      },
      {
        role: "user",
        content: `
Role: ${interview.role}
Original Question: ${targetQuestion.question}
Candidate's Answer: ${targetQuestion.answer}
`
      }
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.json({ skip: true, message: "AI returned empty follow-up." });
    }

    const followUpQuestionText = aiResponse.trim().replace(/^["']|["']$/g, '');

    const newFollowUpObj = {
      question: followUpQuestionText,
      difficulty: targetQuestion.difficulty || "medium",
      timeLimit: 60,
      isFollowUp: true,
      parentQuestionIndex: questionIndex,
    };

    interview.questions.push(newFollowUpObj);
    await interview.save();

    const newQuestionIndex = interview.questions.length - 1;

    return res.status(200).json({
      skip: false,
      followUp: {
        question: followUpQuestionText,
        difficulty: newFollowUpObj.difficulty,
        timeLimit: newFollowUpObj.timeLimit,
        index: newQuestionIndex,
        isFollowUp: true,
      }
    });

  } catch (error) {
    console.error("Error generating follow-up question:", error);
    // Graceful degradation: allow candidate to proceed without blocking
    return res.status(200).json({ skip: true, message: error.message });
  }
};





