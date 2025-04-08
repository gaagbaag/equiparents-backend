import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

/**
 * Sincroniza un evento local con Google Calendar
 * @param {Object} eventData { title, description, start, end, timezone, recurrenceRule, meetingLink, reminders }
 */
export const createGoogleCalendarEvent = async (eventData) => {
  const {
    title,
    description,
    start,
    end,
    timezone,
    recurrenceRule,
    meetingLink,
    reminders,
  } = eventData;

  const googleReminders = reminders?.length
    ? {
        useDefault: false,
        overrides: reminders.map((r) => ({
          method: "popup",
          minutes: r.minutesBefore,
        })),
      }
    : { useDefault: true };

  const gEvent = {
    summary: title,
    description: description + (meetingLink ? `\nEnlace: ${meetingLink}` : ""),
    start: { dateTime: start, timeZone: timezone },
    end: { dateTime: end, timeZone: timezone },
    reminders: googleReminders,
    ...(recurrenceRule ? { recurrence: [recurrenceRule] } : {}),
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: gEvent,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error sincronizando evento con Google Calendar:", error);
    throw error;
  }
};
