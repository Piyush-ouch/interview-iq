import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["HR", "Technical", "Remedial", "Audio-Only"],
      default: "Technical",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for optimizing cron reminder queries
bookingSchema.index({ status: 1, reminderSent: 1, scheduledAt: 1 });
bookingSchema.index({ userId: 1, scheduledAt: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
