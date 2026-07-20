import nodemailer from "nodemailer";

/**
 * Creates and returns a Nodemailer transporter.
 * Uses environment credentials if available, otherwise falls back to a development/logger transport.
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback dev transporter (logs email output cleanly without errors)
  return {
    sendMail: async (options) => {
      console.log("==========================================");
      console.log(`[Email Service - Dev Mode] To: ${options.to}`);
      console.log(`[Subject]: ${options.subject}`);
      console.log(`[Preview Text]: Booking notification triggered.`);
      console.log("==========================================");
      return { messageId: `dev-mock-${Date.now()}` };
    },
  };
};

const transporter = createTransporter();
const SENDER_EMAIL = process.env.SMTP_FROM || process.env.EMAIL_USER || "noreply@interviewiq.ai";

/**
 * Formats a Date object to a readable string (e.g. "Monday, July 25, 2026 at 02:30 PM")
 */
const formatDate = (dateObj) => {
  try {
    return new Date(dateObj).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return String(dateObj);
  }
};

/**
 * Send Booking Confirmation Email
 */
export const sendBookingConfirmation = async (user, booking) => {
  const formattedTime = formatDate(booking.scheduledAt);
  const subject = `Confirmed: Mock Interview for ${booking.role} on ${formattedTime}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 30px; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #111827; margin: 0; font-size: 24px;">InterviewIQ.AI</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Mock Interview Booking Confirmation</p>
        </div>

        <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${user.name || "Candidate"}</strong>,</p>
        <p style="font-size: 15px; color: #374151; line-height: 1.6;">
          Your AI Mock Interview has been successfully scheduled! Here are your session details:
        </p>

        <div style="background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Role:</strong> ${booking.role}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Experience Level:</strong> ${booking.experience}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Interview Mode:</strong> ${booking.mode}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Scheduled Time:</strong> ${formattedTime}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Duration:</strong> ${booking.durationMinutes || 30} minutes</p>
          ${booking.notes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Notes:</strong> ${booking.notes}</p>` : ""}
        </div>

        <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
          You will receive an automated email reminder 30 minutes before your scheduled start time. You can also view or reschedule your session anytime from your InterviewIQ dashboard.
        </p>

        <div style="text-align: center; margin-top: 28px;">
          <a href="http://localhost:5173/schedule" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">View My Schedule</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Sent by InterviewIQ.AI &bull; Practice makes perfect
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"InterviewIQ.AI" <${SENDER_EMAIL}>`,
      to: user.email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send booking confirmation email to ${user.email}:`, error.message);
  }
};

/**
 * Send Interview Reminder Email
 */
export const sendInterviewReminder = async (user, booking) => {
  const formattedTime = formatDate(booking.scheduledAt);
  const subject = `Reminder: Your Mock Interview for ${booking.role} starts soon!`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 30px; color: #1f2937;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">Upcoming Session</span>
          <h2 style="color: #111827; margin: 12px 0 0 0; font-size: 24px;">Your Interview Begins Shortly!</h2>
        </div>

        <p style="font-size: 16px; margin-bottom: 16px;">Hi <strong>${user.name || "Candidate"}</strong>,</p>
        <p style="font-size: 15px; color: #374151; line-height: 1.6;">
          This is a friendly reminder that your scheduled mock interview is starting soon.
        </p>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Role:</strong> ${booking.role}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Experience:</strong> ${booking.experience}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Mode:</strong> ${booking.mode}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Time:</strong> ${formattedTime}</p>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="http://localhost:5173/interview?role=${encodeURIComponent(booking.role)}&experience=${encodeURIComponent(booking.experience)}&mode=${encodeURIComponent(booking.mode)}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Start Interview Now</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          InterviewIQ.AI &bull; AI-Powered Mock Interviews
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"InterviewIQ.AI" <${SENDER_EMAIL}>`,
      to: user.email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send interview reminder email to ${user.email}:`, error.message);
  }
};
