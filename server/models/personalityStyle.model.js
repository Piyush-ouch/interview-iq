import mongoose from "mongoose";

const personalityStyleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    preferredPersonality: {
      type: String,
      enum: ["Casual", "Formal", "Aggressive", "Supportive"],
      default: "Casual",
    },
    personaPerformance: {
      type: Map,
      of: Number,
      default: {
        Casual: 88,
        Formal: 82,
        Aggressive: 74,
        Supportive: 91,
      },
    },
    totalStyleSessions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PersonalityStyle = mongoose.model("PersonalityStyle", personalityStyleSchema);
export default PersonalityStyle;
