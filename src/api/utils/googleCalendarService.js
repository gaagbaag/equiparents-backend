import { google } from "googleapis";
import { prisma } from "../config/database.js";

/**
 * Crea un evento en Google Calendar basado en los datos del evento local.
 * Utiliza el calendarId y refreshToken del usuario específico.
 */
export async function createGoogleCalendarEventForUser(user, eventData) {
  if (!user.googleRefreshToken || !user.googleCalendarId) {
    console.warn(`⏭ Usuario ${user.email} no tiene Google Calendar conectado.`);
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: user.googleRefreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

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
      calendarId: user.googleCalendarId,
      resource: gEvent,
    });
    console.log(
      `✅ Evento sincronizado en el calendario de ${user.email}: ${response.data.id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error sincronizando evento con Google Calendar para ${user.email}:`,
      error
    );
    throw error;
  }
}

/**
 * Sincroniza un evento con Google Calendar para todos los padres conectados
 * @param {Object} event - El evento de Prisma recién creado
 * @param {Array} connectedParents - Lista de usuarios con googleRefreshToken + googleCalendarId
 */
export async function syncEventWithConnectedParents(event, connectedParents) {
  for (const parent of connectedParents) {
    try {
      oauth2Client.setCredentials({
        refresh_token: parent.googleRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const googleEvent = {
        summary: event.title,
        description: event.description || undefined,
        location: event.location || undefined,
        start: { dateTime: new Date(event.start).toISOString() },
        end: { dateTime: new Date(event.end).toISOString() },
      };

      const inserted = await calendar.events.insert({
        calendarId: parent.googleCalendarId,
        requestBody: googleEvent,
      });

      console.log(
        `✅ Evento sincronizado con Google (${parent.email}):`,
        inserted.data.id
      );
    } catch (err) {
      console.warn(
        `⚠️ Error al sincronizar evento con Google (${parent.email}):`,
        err.message
      );
    }
  }
}
