import { SpacedRepetitionCard, CandidateProgression } from "../models/difficultyProgression.model.js";
import User from "../models/user.model.js";

// Curated seed weak-topic flashcards for immediate SM-2 practice preview
const SEED_CARDS = [
  {
    topic: "System Design - Distributed Caching",
    questionText: "How do you handle Cache Stampede (Thundering Herd Problem) in a multi-region microservice architecture?",
    sampleAnswer: "Use Probabilistic Early Expiration (XFetch algorithm), Mutual Exclusion Locks (Mutex / Redis Redlock), or Request Collapsing at the API Gateway level to ensure single DB fetching under heavy concurrency.",
    difficulty: "Hard",
    lastScore: 58,
    easeFactor: 2.3,
    interval: 1,
  },
  {
    topic: "Algorithms - Dynamic Programming",
    questionText: "What is the difference between Top-Down Memoization and Bottom-Up Tabulation in 2D Grid DP?",
    sampleAnswer: "Top-Down uses recursion + hash table / 2D array caching call states (O(N) stack space), while Bottom-Up uses iterative loops building the DP matrix from base cases, allowing space optimization to O(cols).",
    difficulty: "Medium",
    lastScore: 62,
    easeFactor: 2.4,
    interval: 2,
  },
  {
    topic: "Database - Concurrency & Isolation Tiers",
    questionText: "Explain Phantom Reads vs Non-Repeatable Reads under Repeatable Read Isolation in PostgreSQL.",
    sampleAnswer: "Non-repeatable read occurs when re-reading a row gets modified data. Phantom read occurs when re-querying a range gets newly inserted rows by another committed transaction. PostgreSQL MVCC solves both at REPEATABLE READ.",
    difficulty: "Hard",
    lastScore: 52,
    easeFactor: 2.1,
    interval: 1,
  },
  {
    topic: "System Architecture - Kafka Message Ordering",
    questionText: "How do you guarantee strict total ordering of event logs across distributed Kafka consumers?",
    sampleAnswer: "Assign events belonging to the same entity to the exact same Partition Key (so they land in one partition), and set Max In-Flight Requests Per Connection to 1 with Idempotent Producer enabled.",
    difficulty: "Expert",
    lastScore: 68,
    easeFactor: 2.5,
    interval: 3,
  },
];

// Helper to get or create candidate progression profile
const getOrCreateProgression = async (userId) => {
  let profile = await CandidateProgression.findOne({ userId });
  if (!profile) {
    profile = await CandidateProgression.create({
      userId,
      currentLevel: "Intermediate",
      readinessScore: 84.5,
      predictedChallengeLevel: "Advanced System Design & High Concurrency",
    });
  }
  return profile;
};

// GET /api/progression/analytics
export const getProgressionAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await getOrCreateProgression(userId);

    // Calculate progression difficulty curve & recommendation
    const topicMasteryObj = Object.fromEntries(profile.topicMastery || new Map());

    return res.status(200).json({
      success: true,
      profile: {
        ...profile.toObject(),
        topicMastery: topicMasteryObj,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/progression/spaced-repetition
export const getSpacedRepetitionCards = async (req, res) => {
  try {
    const userId = req.userId;

    let dbCards = await SpacedRepetitionCard.find({ userId });

    // Seed initial cards if user has no cards stored
    if (dbCards.length === 0) {
      const createdCards = await Promise.all(
        SEED_CARDS.map((seed) =>
          SpacedRepetitionCard.create({
            userId,
            ...seed,
            dueDate: new Date(Date.now() - 3600000), // Due for review now
          })
        )
      );
      dbCards = createdCards;
    }

    return res.status(200).json({
      success: true,
      totalCards: dbCards.length,
      dueCards: dbCards,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/progression/spaced-repetition/review
export const submitCardReview = async (req, res) => {
  try {
    const { cardId, rating } = req.body; // rating: 0 to 5
    const userId = req.userId;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 0 and 5" });
    }

    const card = await SpacedRepetitionCard.findOne({ _id: cardId, userId });
    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    // SuperMemo SM-2 Algorithm Calculation
    let { repetitions, easeFactor, interval } = card;

    // 1. Calculate new Ease Factor (EF)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const q = rating;
    let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEF < 1.3) newEF = 1.3; // minimum EF threshold

    // 2. Calculate new Repetition count & Interval (in days)
    let newRepetitions = repetitions;
    let newInterval = 1;

    if (q >= 3) {
      // Successful recall
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEF);
      }
      newRepetitions += 1;
    } else {
      // Failed recall - reset repetitions
      newRepetitions = 0;
      newInterval = 1;
    }

    // Calculate new Due Date
    const nextDueDate = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

    card.repetitions = newRepetitions;
    card.easeFactor = Math.round(newEF * 100) / 100;
    card.interval = newInterval;
    card.dueDate = nextDueDate;
    card.lastScore = rating * 20; // 0-100 scale score
    card.history.push({ rating, score: rating * 20 });

    await card.save();

    return res.status(200).json({
      success: true,
      message: `Card updated! Next review scheduled in ${newInterval} day(s).`,
      card,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/progression/adaptive-next-question
export const getAdaptiveNextQuestion = async (req, res) => {
  try {
    const { currentDifficulty, recentScores = [], topic } = req.body;

    // Calculate rolling score average
    const avgScore =
      recentScores.length > 0
        ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
        : 75;

    let nextDifficulty = currentDifficulty || "Medium";
    let progressionReason = "Performance is stable. Maintaining challenge level.";

    if (avgScore >= 85) {
      if (currentDifficulty === "Easy") nextDifficulty = "Medium";
      else if (currentDifficulty === "Medium") nextDifficulty = "Hard";
      else if (currentDifficulty === "Hard") nextDifficulty = "Expert";

      progressionReason = `High performance detected (${Math.round(avgScore)}% avg). Auto-upgraded difficulty to ${nextDifficulty}! 🔥`;
    } else if (avgScore < 60) {
      if (currentDifficulty === "Expert") nextDifficulty = "Hard";
      else if (currentDifficulty === "Hard") nextDifficulty = "Medium";
      else if (currentDifficulty === "Medium") nextDifficulty = "Easy";

      progressionReason = `Target practice adjustment (${Math.round(avgScore)}% avg). Calibrating difficulty to ${nextDifficulty} for topic reinforcement. 💡`;
    }

    return res.status(200).json({
      success: true,
      currentDifficulty,
      nextDifficulty,
      avgScore: Math.round(avgScore),
      progressionReason,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
