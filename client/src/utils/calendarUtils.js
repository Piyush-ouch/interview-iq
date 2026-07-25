/**
 * Format date to ISO UTC format string without separators for Google / Outlook calendar URLs
 */
const formatISOForCalendar = (dateObj) => {
  const d = new Date(dateObj);
  return d.toISOString().replace(/-|:|\.\d+/g, "");
};

/**
 * Generate Google Calendar event URL
 */
export const getGoogleCalendarUrl = (booking) => {
  const startDate = new Date(booking.scheduledAt);
  const durationMs = (booking.durationMinutes || 30) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const title = encodeURIComponent(`Mock Interview: ${booking.role} (${booking.mode})`);
  const details = encodeURIComponent(
    `InterviewIQ.AI Mock Interview Session\n\nRole: ${booking.role}\nExperience Level: ${booking.experience}\nMode: ${booking.mode}\nNotes: ${booking.notes || "None"}\n\nJoin link: http://localhost:5173/interview`
  );
  const location = encodeURIComponent("InterviewIQ.AI Online Portal");
  const dates = `${formatISOForCalendar(startDate)}/${formatISOForCalendar(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

/**
 * Generate Outlook / Office 365 Calendar event URL
 */
export const getOutlookCalendarUrl = (booking) => {
  const startDate = new Date(booking.scheduledAt);
  const durationMs = (booking.durationMinutes || 30) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const subject = encodeURIComponent(`Mock Interview: ${booking.role} (${booking.mode})`);
  const body = encodeURIComponent(
    `InterviewIQ.AI Mock Interview Session\n\nRole: ${booking.role}\nExperience Level: ${booking.experience}\nMode: ${booking.mode}\nNotes: ${booking.notes || "None"}\n\nJoin link: http://localhost:5173/interview`
  );
  const location = encodeURIComponent("InterviewIQ.AI Online Portal");
  const startdt = encodeURIComponent(startDate.toISOString());
  const enddt = encodeURIComponent(endDate.toISOString());

  return `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${startdt}&enddt=${enddt}&body=${body}&location=${location}`;
};

/**
 * Download .ics file directly in browser
 */
export const downloadICS = (booking) => {
  const startDate = new Date(booking.scheduledAt);
  const durationMs = (booking.durationMinutes || 30) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const startICS = formatISOForCalendar(startDate);
  const endICS = formatISOForCalendar(endDate);
  const nowICS = formatISOForCalendar(new Date());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//InterviewIQ.AI//Interview Scheduling System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:booking-${booking._id || Date.now()}@interviewiq.ai`,
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

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `mock-interview-${booking._id || "schedule"}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
