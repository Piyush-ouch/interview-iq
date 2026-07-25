import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    credentialId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    badgeTier: {
      type: String,
      enum: ["Master", "Expert", "Certified Professional"],
      required: true,
    },
    badgeIcon: {
      type: String,
      default: "🏆",
    },
    finalScore: {
      type: Number,
      required: true,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    communication: {
      type: Number,
      default: 0,
    },
    correctness: {
      type: Number,
      default: 0,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    verificationHash: {
      type: String,
      required: true,
    },
    skillsVerified: [String],
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
