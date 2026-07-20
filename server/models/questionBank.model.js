import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Junior", "Mid", "Senior"],
      default: "Mid",
      required: true,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    suggestedAnswer: {
      type: String,
      required: true,
    },
    keyPoints: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ["Technical", "System Design", "Behavioral", "Problem Solving"],
      default: "Technical",
    },
    source: {
      type: String,
      default: "Curated Industry Standards",
    },
    lastRefreshedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound and text search indices for fast filtering and searching
questionBankSchema.index({ industry: 1, role: 1, difficulty: 1 });
questionBankSchema.index({ skills: 1 });
questionBankSchema.index({
  title: "text",
  question: "text",
  skills: "text",
  role: "text",
});

const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);

export default QuestionBank;
