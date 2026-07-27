import PersonalityStyle from "../models/personalityStyle.model.js";
import { askAi } from "../services/openRouter.service.js";

const PERSONA_PROFILES = [
  {
    id: "Casual",
    name: "Alex Vance",
    title: "Casual Startup Tech Lead",
    avatarColor: "from-emerald-500 to-teal-600",
    badge: "FRIENDLY & PRAGMATIC",
    description: "Relaxed atmosphere, practical problem solving, uses tech colloquialisms, and focuses on real-world engineering trade-offs.",
    tonePrompt: "Speak casually and pragmatically, like a senior tech lead grabbing coffee with a teammate. Use friendly phrasing like 'Hey!', 'Sounds cool', 'Let's dig in'.",
    sampleQuestion: "Hey! So I saw your resume—pretty cool projects. Walk me through a tricky bug you fixed recently and how you tracked it down?",
  },
  {
    id: "Formal",
    name: "Victoria Sterling",
    title: "Strict Corporate Director",
    avatarColor: "from-blue-600 to-indigo-700",
    badge: "FORMAL & STRUCTURED",
    description: "Strict adherence to STAR format (Situation, Task, Action, Result), precise terminology, and structured formal evaluation.",
    tonePrompt: "Speak in a formal, highly structured corporate tone. Require exact STAR framework answers and evaluate metrics strictly.",
    sampleQuestion: "Good morning. Please describe a specific instance where you led a high-stakes cross-functional architectural migration under tight deadlines.",
  },
  {
    id: "Aggressive",
    name: "Marcus Steele",
    title: "Aggressive Stress Tester",
    avatarColor: "from-red-600 to-orange-700",
    badge: "HIGH PRESSURE ⚡",
    description: "Rapid-fire questioning, probing edge cases, challenging assumptions, and testing how you handle stress under pressure.",
    tonePrompt: "Speak aggressively and critically. Challenge the candidate's assumptions directly with probing follow-ups like 'Are you sure about that?', 'Why did you pick such a slow algorithm?'.",
    sampleQuestion: "Your proposed DB indexing strategy causes massive write-amplification under high throughput! Convince me why I shouldn't reject this design immediately.",
  },
  {
    id: "Supportive",
    name: "Dr. Maya Lin",
    title: "Empathetic Mentor & Coach",
    avatarColor: "from-purple-500 to-violet-600",
    badge: "ENCOURAGING & GUIDING",
    description: "Reassuring, provides constructive hints, builds confidence, and guides candidates through complex technical roadblocks.",
    tonePrompt: "Speak with deep empathy, encouragement, and mentorship. Provide reassuring hints and praise positive engineering intuition.",
    sampleQuestion: "Don't worry if this feels complex! Take a moment to think. How would you break down the system components starting from the client request?",
  },
];

// GET /api/personality/profiles
export const getPersonalityProfiles = async (req, res) => {
  try {
    const userId = req.userId;

    let userStyle = await PersonalityStyle.findOne({ userId });
    if (!userStyle) {
      userStyle = await PersonalityStyle.create({
        userId,
        preferredPersonality: "Casual",
      });
    }

    const personaPerformance = Object.fromEntries(userStyle.personaPerformance || new Map());

    return res.status(200).json({
      success: true,
      currentPersonality: userStyle.preferredPersonality,
      personaPerformance,
      personas: PERSONA_PROFILES,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/personality/transform-style
export const transformStyleResponse = async (req, res) => {
  try {
    const { personalityId, question, candidateAnswer } = req.body;
    const userId = req.userId;

    const persona = PERSONA_PROFILES.find((p) => p.id === personalityId) || PERSONA_PROFILES[0];

    const systemPrompt = `
You are an AI Interviewer roleplaying as "${persona.title}" (${persona.name}).
Tone guidelines: ${persona.tonePrompt}

Given the candidate's response to an interview question:
Question: "${question || "Walk me through your technical experience."}"
Candidate Answer: "${candidateAnswer || "I built a web app using Node.js and MongoDB."}"

Respond strictly in JSON:
{
  "personaResponse": "Your in-character follow-up question or feedback in the voice of ${persona.name}.",
  "toneAnalysis": "Short summary of how candidate handled this persona style.",
  "score": 85
}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate in-character response and evaluation." },
    ];

    let personaResponseText = "";
    let score = 82;
    let toneAnalysis = `Handled the ${persona.id} persona effectively with clear communication.`;

    try {
      const aiRes = await askAi(messages);
      const parsed = JSON.parse(aiRes);
      personaResponseText = parsed.personaResponse;
      score = parsed.score || 85;
      toneAnalysis = parsed.toneAnalysis || toneAnalysis;
    } catch (aiErr) {
      // Fallback in-character responses if AI call fails
      if (persona.id === "Casual") {
        personaResponseText = "Nice! That sounds solid. How did you handle connection pooling when traffic spiked on MongoDB?";
      } else if (persona.id === "Formal") {
        personaResponseText = "Understood. Now, utilizing the STAR framework, detail the exact performance SLAs and latency metrics achieved.";
      } else if (persona.id === "Aggressive") {
        personaResponseText = "Node.js is single-threaded! How does your API prevent event-loop blocking under CPU-bound tasks? Explain now.";
      } else {
        personaResponseText = "Great effort! You've got the right intuition. What if we added Redis caching to speed up read queries?";
      }
    }

    // Update user style preferences
    await PersonalityStyle.findOneAndUpdate(
      { userId },
      { preferredPersonality: persona.id, $inc: { totalStyleSessions: 1 } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      personaId: persona.id,
      personaName: persona.name,
      personaTitle: persona.title,
      personaResponse: personaResponseText,
      score,
      toneAnalysis,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
