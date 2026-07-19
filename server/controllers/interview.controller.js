import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  let filepath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

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

    const aiResponse = await askAi(messages);

    const parsed = JSON.parse(aiResponse);

    return res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    if (filepath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (unlinkErr) {
        console.error(`Failed to cleanup temp file ${filepath}:`, unlinkErr);
      }
    }
  }
};


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

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
      return res.status(400).json({
        message: "Prompt content is empty."
      });
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
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];


    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
           
      return res.status(500).json({
        message: "AI returned empty response."
      });

    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      
      return res.status(500).json({
        message: "AI failed to generate questions."
      });
    }

    user.credits -= 50;
    await user.save();

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
      }))
    })

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({message:`failed to create interview ${error}`})
  }
}


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback
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
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)


    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();


    return res.status(200).json({feedback :parsed.feedback})
  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})

  }
}


export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await Interview.findById(interviewId)
    if(!interview){
      return res.status(400).json({message:"failed to find Interview"})
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
       finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
  } catch (error) {
    return res.status(500).json({message:`failed to finish Interview ${error}`})
  }
}


export const getMyInterviews = async (req,res) => {
  try {
    const interviews = await Interview.find({userId:req.userId})
    .sort({ createdAt: -1 })
    .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews)

  } catch (error) {
     return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
  }
}

export const getInterviewReport = async (req,res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }


    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

       return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}

export const getCumulativeAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.userId,
      status: "completed"
    })
    .sort({ createdAt: 1 });

    if (interviews.length === 0) {
      return res.json({
        hasData: false,
        message: "No completed interviews found yet."
      });
    }

    let totalScoreSum = 0;
    let totalConfidenceSum = 0;
    let totalCommunicationSum = 0;
    let totalCorrectnessSum = 0;
    let totalQuestionsCount = 0;

    const trend = interviews.map((interview, index) => {
      let intConfidence = 0;
      let intCommunication = 0;
      let intCorrectness = 0;
      const qCount = interview.questions.length;

      interview.questions.forEach((q) => {
        intConfidence += q.confidence || 0;
        intCommunication += q.communication || 0;
        intCorrectness += q.correctness || 0;
      });

      const avgConf = qCount ? intConfidence / qCount : 0;
      const avgComm = qCount ? intCommunication / qCount : 0;
      const avgCorr = qCount ? intCorrectness / qCount : 0;

      totalScoreSum += interview.finalScore || 0;
      totalConfidenceSum += intConfidence;
      totalCommunicationSum += intCommunication;
      totalCorrectnessSum += intCorrectness;
      totalQuestionsCount += qCount;

      const dateStr = new Date(interview.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = new Date(interview.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

      return {
        date: `${dateStr} (${timeStr})`,
        role: interview.role,
        score: Number((interview.finalScore || 0).toFixed(1)),
        confidence: Number(avgConf.toFixed(1)),
        communication: Number(avgComm.toFixed(1)),
        correctness: Number(avgCorr.toFixed(1))
      };
    });

    const totalInterviews = interviews.length;
    const avgOverallScore = Number((totalScoreSum / totalInterviews).toFixed(1));
    const avgConfidence = totalQuestionsCount ? Number((totalConfidenceSum / totalQuestionsCount).toFixed(1)) : 0;
    const avgCommunication = totalQuestionsCount ? Number((totalCommunicationSum / totalQuestionsCount).toFixed(1)) : 0;
    const avgCorrectness = totalQuestionsCount ? Number((totalCorrectnessSum / totalQuestionsCount).toFixed(1)) : 0;

    const insights = [];
    if (totalInterviews >= 2) {
      const first = trend[0];
      const last = trend[trend.length - 1];

      const scoreDiff = last.score - first.score;
      const confDiff = last.confidence - first.confidence;
      const commDiff = last.communication - first.communication;
      const corrDiff = last.correctness - first.correctness;

      if (scoreDiff > 0 && first.score > 0) {
        const pct = Math.round((scoreDiff / first.score) * 100);
        insights.push(`Your overall interview score has improved by ${pct}% since your baseline try.`);
      } else if (scoreDiff < 0 && first.score > 0) {
        const pct = Math.round((Math.abs(scoreDiff) / first.score) * 100);
        insights.push(`Your overall score dropped by ${pct}%. Try reviewing AI prep playbooks before your next session.`);
      }

      if (confDiff > 0 && first.confidence > 0) {
        const pct = Math.round((confDiff / first.confidence) * 100);
        insights.push(`Great progress! Your speaking confidence rating has increased by ${pct}% over time.`);
      } else if (confDiff < 0 && first.confidence > 0) {
        const pct = Math.round((Math.abs(confDiff) / first.confidence) * 100);
        insights.push(`Your speaking confidence dropped by ${pct}%. Focus on steady pacing and taking deep breaths.`);
      }

      if (commDiff > 0 && first.communication > 0) {
        const pct = Math.round((commDiff / first.communication) * 100);
        insights.push(`Communication clarity improved by ${pct}%, reflecting clearer structure and word choice.`);
      } else if (commDiff < 0 && first.communication > 0) {
        const pct = Math.round((Math.abs(commDiff) / first.communication) * 100);
        insights.push(`Communication delivery score dipped by ${pct}%. Focus on organizing key points simply.`);
      }

      if (corrDiff > 0 && first.correctness > 0) {
        const pct = Math.round((corrDiff / first.correctness) * 100);
        insights.push(`Technical correctness is up by ${pct}%, meaning your answers are becoming more precise.`);
      } else if (corrDiff < 0 && first.correctness > 0) {
        const pct = Math.round((Math.abs(corrDiff) / first.correctness) * 100);
        insights.push(`Technical correctness dropped by ${pct}%. Spend some time reviewing key domain concepts.`);
      }
    } else {
      insights.push("Complete at least 2 interviews to generate comparison trends and performance insights.");
    }

    return res.json({
      hasData: true,
      stats: {
        totalInterviews,
        avgOverallScore,
        avgConfidence,
        avgCommunication,
        avgCorrectness
      },
      trend,
      insights
    });

  } catch (error) {
    return res.status(500).json({ message: `Failed to calculate analytics: ${error.message}` });
  }
};

export const generateRemedialQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.credits < 30) {
      return res.status(400).json({ message: "Not enough credits for Remedial Practice. Minimum 30 credits required." });
    }

    // Retrieve user's completed interviews to discover weak areas
    const completedInterviews = await Interview.find({
      userId: req.userId,
      status: "completed"
    }).sort({ createdAt: -1 }).limit(10);

    if (!completedInterviews || completedInterviews.length === 0) {
      return res.status(400).json({ message: "No completed interviews found. Complete at least 1 interview to unlock Remedial Mode." });
    }

    // Collect questions where score or correctness < 7
    const weakItems = [];
    let primaryRole = completedInterviews[0].role || "Software Engineer";
    let primaryExperience = completedInterviews[0].experience || "Intermediate";

    completedInterviews.forEach((interview) => {
      interview.questions.forEach((q) => {
        if ((q.score !== undefined && q.score < 7) || (q.correctness !== undefined && q.correctness < 7)) {
          weakItems.push(`Question: ${q.question} | Score: ${q.score}/10 | Feedback: ${q.feedback || "Needs improvement"}`);
        }
      });
    });

    // Fallback: If no weak items < 7 exist, select lowest scoring items overall
    if (weakItems.length === 0) {
      completedInterviews.forEach((interview) => {
        interview.questions.forEach((q) => {
          weakItems.push(`Question: ${q.question} | Score: ${q.score || 7}/10 | Feedback: ${q.feedback || "Refine depth"}`);
        });
      });
    }

    const weakContext = weakItems.slice(0, 5).join("\n");

    const messages = [
      {
        role: "system",
        content: `
You are an expert technical interviewer creating a targeted Remedial Practice session.

Goal: Analyze the candidate's previous low-scoring questions and feedback, then generate EXACTLY 3 focused follow-up practice questions designed specifically to test and improve their weak spots.

Strict Rules:
- Generate exactly 3 interview questions.
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations or extra text.
- One question per line only.
- Focus directly on strengthening concepts where candidate scored low in past sessions.
`
      },
      {
        role: "user",
        content: `
Target Role: ${primaryRole}
Target Experience Level: ${primaryExperience}

Candidate's Previous Weak Questions & Feedback:
${weakContext}
`
      }
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response for remedial questions." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 3);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "Failed to generate remedial questions." });
    }

    user.credits -= 30;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role: primaryRole,
      experience: primaryExperience,
      mode: "Remedial",
      resumeText: "Remedial Weak Spot Focus Session",
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["medium", "medium", "hard"][index],
        timeLimit: [90, 90, 120][index],
      }))
    });

    return res.status(200).json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });

  } catch (error) {
    return res.status(500).json({ message: `Failed to generate remedial session: ${error.message}` });
  }
};





