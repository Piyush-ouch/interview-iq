import Battle from "../models/battle.model.js";
import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import { askAi } from "../services/openRouter.service.js";
import crypto from "crypto";

/**
 * Generate 5 shared battle questions using OpenRouter AI
 */
const generateBattleQuestions = async (role, experience, mode) => {
  const messages = [
    {
      role: "system",
      content: `
You are a lead technical interviewer setting up a competitive 1v1 Interview Battle.
Generate exactly 5 interview questions for the role: ${role}, experience: ${experience}, mode: ${mode}.

Rules:
- Each question must be 15 to 25 words.
- Single sentence per question.
- No numbering or extra text. One question per line.
- Difficulty progression: 2 easy, 2 medium, 1 hard.
`,
    },
    {
      role: "user",
      content: `Role: ${role}, Experience: ${experience}, Mode: ${mode}`,
    },
  ];

  const aiResponse = await askAi(messages);
  const questionsArray = aiResponse
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0)
    .slice(0, 5);

  const defaultTimeLimits = [60, 60, 90, 90, 120];
  const difficulties = ["easy", "easy", "medium", "medium", "hard"];

  return questionsArray.map((q, idx) => ({
    question: q,
    difficulty: difficulties[idx] || "medium",
    timeLimit: defaultTimeLimits[idx] || 60,
  }));
};

/**
 * Create a new battle room or queue item
 */
export const createBattle = async (req, res) => {
  try {
    const { role, experience, mode = "Technical", isPrivate = false } = req.body;

    if (!role || !experience) {
      return res.status(400).json({ success: false, message: "Role and Experience are required." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check existing waiting battle to avoid duplicate waiting rooms
    const existingWaiting = await Battle.findOne({
      challengerId: req.userId,
      status: "waiting",
    });

    if (existingWaiting) {
      return res.status(200).json({
        success: true,
        message: "Existing waiting battle found.",
        battle: existingWaiting,
      });
    }

    const battleCode = "BAT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const questions = await generateBattleQuestions(role, experience, mode);

    const battle = await Battle.create({
      battleCode,
      challengerId: user._id,
      role: role.trim(),
      experience: experience.trim(),
      mode,
      questions,
      isPrivate,
      status: "waiting",
    });

    return res.status(201).json({
      success: true,
      message: "Interview Battle created successfully!",
      battle,
    });
  } catch (error) {
    console.error("Error creating battle:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Matchmake or Join Battle by Battle Code
 */
export const joinBattle = async (req, res) => {
  try {
    const { battleCode, role, experience } = req.body;

    let battle = null;

    if (battleCode && battleCode.trim()) {
      // Find by exact code
      battle = await Battle.findOne({
        battleCode: battleCode.trim().toUpperCase(),
        status: "waiting",
      });

      if (!battle) {
        return res.status(404).json({
          success: false,
          message: "Active battle room with this code was not found or is already full.",
        });
      }
    } else if (role && experience) {
      // Find open public match in queue
      battle = await Battle.findOne({
        role: new RegExp(`^${role.trim()}$`, "i"),
        experience: new RegExp(`^${experience.trim()}$`, "i"),
        status: "waiting",
        isPrivate: false,
        challengerId: { $ne: req.userId },
      }).sort({ createdAt: 1 });
    }

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "No matching opponent currently in queue. Try creating a new battle room!",
      });
    }

    if (battle.challengerId.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot join your own battle room.",
      });
    }

    battle.opponentId = req.userId;
    battle.status = "matched";
    await battle.save();

    const populatedBattle = await Battle.findById(battle._id)
      .populate("challengerId", "name email")
      .populate("opponentId", "name email");

    return res.status(200).json({
      success: true,
      message: "Matched successfully with opponent!",
      battle: populatedBattle,
    });
  } catch (error) {
    console.error("Error joining battle:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get details of a battle by ID or Code
 */
export const getBattle = async (req, res) => {
  try {
    const { id } = req.params;

    const battle = await Battle.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { battleCode: id.toUpperCase() }],
    })
      .populate("challengerId", "name email")
      .populate("opponentId", "name email")
      .populate("challengerInterviewId")
      .populate("opponentInterviewId")
      .populate("winnerId", "name email");

    if (!battle) {
      return res.status(404).json({ success: false, message: "Battle not found." });
    }

    return res.status(200).json({
      success: true,
      battle,
    });
  } catch (error) {
    console.error("Error fetching battle:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit candidate's completed interview for battle evaluation
 */
export const completeBattleInterview = async (req, res) => {
  try {
    const { battleId, interviewId } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({ success: false, message: "Battle not found." });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found." });
    }

    const isChallenger = battle.challengerId.toString() === req.userId;
    const isOpponent = battle.opponentId && battle.opponentId.toString() === req.userId;

    if (!isChallenger && !isOpponent) {
      return res.status(403).json({ success: false, message: "You are not a participant in this battle." });
    }

    if (isChallenger) {
      battle.challengerInterviewId = interview._id;
      battle.challengerCompleted = true;
    } else if (isOpponent) {
      battle.opponentInterviewId = interview._id;
      battle.opponentCompleted = true;
    }

    await battle.save();

    // Check if BOTH participants have completed
    if (battle.challengerCompleted && battle.opponentCompleted) {
      const [chalInterview, oppInterview, challengerUser, opponentUser] = await Promise.all([
        Interview.findById(battle.challengerInterviewId),
        Interview.findById(battle.opponentInterviewId),
        User.findById(battle.challengerId),
        User.findById(battle.opponentId),
      ]);

      const chalScore = chalInterview?.finalScore || 0;
      const oppScore = oppInterview?.finalScore || 0;

      let winnerId = null;
      if (chalScore > oppScore) {
        winnerId = battle.challengerId;
      } else if (oppScore > chalScore) {
        winnerId = battle.opponentId;
      } else {
        // Tie-breaker: challenger wins tie if equal score or null
        winnerId = battle.challengerId;
      }

      // Generate AI Verdict breakdown comparing both
      const messages = [
        {
          role: "system",
          content: `You are an executive interviewer judging a 1v1 Peer Interview Battle between Candidate A (${challengerUser.name}) and Candidate B (${opponentUser.name}).
Write a concise 2-sentence verdict declaring the winner and highlighting the key factor (e.g. higher technical correctness, better clarity, or structured thinking) that made them win.`,
        },
        {
          role: "user",
          content: `Candidate A (${challengerUser.name}): Score ${chalScore}/10. Candidate B (${opponentUser.name}): Score ${oppScore}/10.`,
        },
      ];

      let verdict = `${chalScore >= oppScore ? challengerUser.name : opponentUser.name} won with a higher overall interview score (${Math.max(chalScore, oppScore).toFixed(1)}/10 vs ${Math.min(chalScore, oppScore).toFixed(1)}/10)!`;

      try {
        const aiVerdict = await askAi(messages);
        if (aiVerdict && aiVerdict.trim()) {
          verdict = aiVerdict.trim();
        }
      } catch (err) {
        console.error("AI Verdict generation failed, using fallback verdict:", err);
      }

      battle.winnerId = winnerId;
      battle.verdict = verdict;
      battle.status = "completed";
      await battle.save();
    }

    const updatedBattle = await Battle.findById(battle._id)
      .populate("challengerId", "name email")
      .populate("opponentId", "name email")
      .populate("challengerInterviewId")
      .populate("opponentInterviewId")
      .populate("winnerId", "name email");

    return res.status(200).json({
      success: true,
      message: "Battle interview recorded successfully!",
      battle: updatedBattle,
    });
  } catch (error) {
    console.error("Error completing battle interview:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user's battle history
 */
export const getMyBattles = async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [{ challengerId: req.userId }, { opponentId: req.userId }],
    })
      .sort({ createdAt: -1 })
      .populate("challengerId", "name email")
      .populate("opponentId", "name email")
      .populate("winnerId", "name email");

    return res.status(200).json({
      success: true,
      battles,
    });
  } catch (error) {
    console.error("Error fetching user battles:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
