import mongoose from "mongoose";

const battleSchema = new mongoose.Schema(
  {
    battleCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    challengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opponentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: "Technical",
    },
    questions: [
      {
        question: String,
        difficulty: String,
        timeLimit: Number,
      },
    ],
    challengerInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
    opponentInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
    challengerCompleted: {
      type: Boolean,
      default: false,
    },
    opponentCompleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["waiting", "matched", "completed", "cancelled"],
      default: "waiting",
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verdict: {
      type: String,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Battle = mongoose.model("Battle", battleSchema);

export default Battle;
