import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    targetRole: {
      type: String,
      default: "Full Stack Engineer",
    },
    experienceLevel: {
      type: String,
      default: "Mid Level (2-4 yrs)",
    },
    difficultyTier: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Elite"],
      default: "Intermediate",
    },
    strengths: [String],
    skillGaps: [String],
    overallRating: {
      type: Number,
      default: 82.5,
    },
    codingScore: {
      type: Number,
      default: 80,
    },
    systemDesignScore: {
      type: Number,
      default: 85,
    },
    communicationScore: {
      type: Number,
      default: 82,
    },
    interviewsCompleted: {
      type: Number,
      default: 0,
    },
    battlesWon: {
      type: Number,
      default: 0,
    },
    badges: [String],
    isSearchingPartner: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const partnershipRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    difficultyTier: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Elite"],
      default: "Intermediate",
    },
    topic: {
      type: String,
      default: "General Technical & Behavioral Mock",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    scheduledTime: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model("CandidateProfile", candidateProfileSchema);
export const PartnershipRequest = mongoose.model("PartnershipRequest", partnershipRequestSchema);
