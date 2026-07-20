import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import { sendBookingConfirmation } from "../services/email.service.js";

/**
 * Schedule a new mock interview session
 */
export const createBooking = async (req, res) => {
  try {
    const { role, experience, mode, scheduledAt, durationMinutes, notes } = req.body;
    const userId = req.userId;

    if (!role || !experience || !mode || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Role, experience level, mode, and scheduled date/time are required fields.",
      });
    }

    const bookingTime = new Date(scheduledAt);
    if (isNaN(bookingTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date and time format.",
      });
    }

    if (bookingTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date and time must be in the future.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const booking = new Booking({
      userId,
      role: role.trim(),
      experience: experience.trim(),
      mode,
      scheduledAt: bookingTime,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : 30,
      notes: notes ? notes.trim() : "",
      status: "scheduled",
      reminderSent: false,
    });

    await booking.save();

    // Async trigger email confirmation
    sendBookingConfirmation(user, booking).catch((err) =>
      console.error("Booking confirmation email trigger error:", err)
    );

    return res.status(201).json({
      success: true,
      message: "Mock interview scheduled successfully!",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to schedule interview: ${error.message}`,
    });
  }
};

/**
 * Get all scheduled bookings for the authenticated user
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const bookings = await Booking.find({ userId }).sort({ scheduledAt: 1 });

    const upcoming = [];
    const past = [];

    for (const booking of bookings) {
      // Auto-update past uncompleted bookings if necessary
      if (booking.status === "scheduled" && new Date(booking.scheduledAt) < now) {
        booking.status = "completed";
        await booking.save();
      }

      if (booking.status === "scheduled") {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    }

    return res.status(200).json({
      success: true,
      upcoming,
      past,
      allBookings: bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch bookings: ${error.message}`,
    });
  }
};

/**
 * Cancel a scheduled booking
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled.",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Interview booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to cancel booking: ${error.message}`,
    });
  }
};

/**
 * Reschedule an existing booking
 */
export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    const userId = req.userId;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "New scheduled date and time is required.",
      });
    }

    const newTime = new Date(scheduledAt);
    if (isNaN(newTime.getTime()) || newTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Rescheduled date and time must be a valid future time.",
      });
    }

    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized.",
      });
    }

    booking.scheduledAt = newTime;
    booking.status = "scheduled";
    booking.reminderSent = false;

    await booking.save();

    // Re-send confirmation for updated time
    const user = await User.findById(userId);
    if (user) {
      sendBookingConfirmation(user, booking).catch((err) =>
        console.error("Reschedule confirmation email error:", err)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Interview rescheduled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to reschedule booking: ${error.message}`,
    });
  }
};

/**
 * Export booking as an iCalendar (.ics) file
 */
export const exportICS = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const startDate = new Date(booking.scheduledAt);
    const durationMs = (booking.durationMinutes || 30) * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const formatDateICS = (d) => {
      return d.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const startICS = formatDateICS(startDate);
    const endICS = formatDateICS(endDate);
    const nowICS = formatDateICS(new Date());

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//InterviewIQ.AI//Interview Scheduling System//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:booking-${booking._id}@interviewiq.ai`,
      `DTSTAMP:${nowICS}`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:Mock Interview - ${booking.role} (${booking.mode})`,
      `DESCRIPTION:InterviewIQ.AI Mock Interview Session\\nRole: ${booking.role}\\nExperience: ${booking.experience}\\nMode: ${booking.mode}\\nNotes: ${booking.notes || 'None'}`,
      `LOCATION:Online (InterviewIQ.AI Portal)`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="mock-interview-${booking._id}.ics"`);
    return res.send(icsContent);
  } catch (error) {
    console.error("Error generating ICS file:", error);
    return res.status(500).json({ success: false, message: "Error generating calendar file." });
  }
};
