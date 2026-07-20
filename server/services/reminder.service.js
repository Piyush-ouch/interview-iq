import cron from "node-cron";
import Booking from "../models/booking.model.js";
import { sendInterviewReminder } from "./email.service.js";

/**
 * Checks database for scheduled interviews coming up in the next 30 minutes
 * and sends reminder emails to users.
 */
export const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

    // Find scheduled interviews starting within the next 30 minutes where reminder hasn't been sent
    const upcomingBookings = await Booking.find({
      status: "scheduled",
      reminderSent: false,
      scheduledAt: {
        $gte: now,
        $lte: thirtyMinutesLater,
      },
    }).populate("userId", "name email");

    if (upcomingBookings.length > 0) {
      console.log(`[Reminder Service] Found ${upcomingBookings.length} upcoming booking(s) needing reminders.`);
    }

    for (const booking of upcomingBookings) {
      if (booking.userId && booking.userId.email) {
        try {
          await sendInterviewReminder(booking.userId, booking);
          booking.reminderSent = true;
          await booking.save();
          console.log(`[Reminder Service] Reminder sent successfully for booking ID: ${booking._id}`);
        } catch (emailError) {
          console.error(`[Reminder Service] Error sending reminder for booking ID ${booking._id}:`, emailError);
        }
      }
    }
  } catch (error) {
    console.error("[Reminder Service] Error in reminder cron job execution:", error);
  }
};

/**
 * Initializes the cron scheduler service.
 * Runs every 5 minutes.
 */
export const initReminderScheduler = () => {
  // Cron schedule: every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    await checkAndSendReminders();
  });

  console.log("[Reminder Service] Scheduled interview reminder cron worker initialized (Runs every 5 mins).");
};
