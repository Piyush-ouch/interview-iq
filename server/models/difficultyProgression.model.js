import mongoose from "mongoose";

const spacedRepetitionCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    sampleAnswer: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Expert"],
      default: "Medium",
    },
    lastScore: {
      type: Number,
      default: 65,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    easeFactor: {
      type: Number,
      default: 2.5, // Standard SuperMemo SM-2 starting EF
    },
    interval: {
      type: Number,
      default: 1, // days
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        rating: Number, // 0 to 5 SM-2 rating
        score: Number,
      },
    ],
  },
  { timestamps: true }
);

const candidateProgressionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    currentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "FAANG / Staff"],
      default: "Intermediate",
    },
    readinessScore: {
      type: Number,
      default: 84.5,
    },
    predictedChallengeLevel: {
      type: String,
      default: "Advanced System Design & Distributed Systems",
    },
    topicMastery: {
      type: Map,
      of: Number,
      default: {
        "Data Structures & Algorithms": 82,
        "System Architecture": 88,
        "Object Oriented Design": 79,
        "Database Indexing & Queries": 85,
        "Behavioral Leadership": 91,
      },
    },
    recentPerformanceHistory: [
      {
        score: Number,
        difficulty: String,
        topic: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SpacedRepetitionCard = mongoose.model("SpacedRepetitionCard", spacedRepetitionCardSchema);
export const CandidateProgression = mongoose.model("CandidateProgression", candidateProgressionSchema);
