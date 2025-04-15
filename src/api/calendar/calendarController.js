import { google } from "googleapis";
import { prisma } from "../config/database.js";
import { syncEventWithConnectedParents } from "../utils/googleCalendarService.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 📅 GET /api/calendar/events
export const getEvents = async (req, res) => {
  try {
    const { parentalAccountId } = req.user;
    const { categoryId, childId } = req.query;

    const calendar = await prisma.calendar.findUnique({
      where: { parentalAccountId },
    });

    if (!calendar) {
      return res.status(404).json({ message: "Calendario no encontrado" });
    }

    const filters = {
      calendarId: calendar.id,
      ...(categoryId && { categoryId }),
      ...(childId && { children: { some: { childId } } }),
    };

    const events = await prisma.event.findMany({
      where: filters,
      include: {
        category: true,
        children: { include: { child: true } },
      },
      orderBy: { start: "asc" },
    });

    return res.status(200).json({ events });
  } catch (err) {
    console.error("❌ Error en getEvents:", err);
    return res.status(500).json({ message: "Error al obtener eventos" });
  }
};

// 📝 POST /api/calendar/events
// src/api/calendar/calendarController.js
// 📝 POST /api/calendar/events
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      start,
      end,
      categoryId,
      childIds = [],
      tagIds = [],
      parentIds = [],
      location,
      description,
      timezone,
      recurrenceRule,
      meetingLink,
      reminders = [],
    } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const parentalAccountId = user.parentalAccountId;

    if (!parentalAccountId) {
      return res.status(403).json({ message: "Cuenta parental no encontrada" });
    }

    // Crear el evento en la base de datos
    const event = await prisma.event.create({
      data: {
        title,
        start: new Date(start),
        end: new Date(end),
        location,
        description,
        timezone,
        recurrenceRule,
        meetingLink,
        createdBy: {
          connect: { id: userId },
        },
        calendar: {
          connect: { parentalAccountId },
        },
        category: {
          connect: { id: categoryId },
        },
        children: {
          create: childIds.map((childId) => ({
            child: { connect: { id: childId } },
          })),
        },
        tags: {
          connect: tagIds.map((tagId) => ({ id: tagId })),
        },
        parents: {
          create: parentIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
        reminders: {
          create: reminders.map((reminder) => ({
            type: reminder.type,
            minutesBefore: reminder.minutesBefore,
          })),
        },
      },
      include: {
        category: true,
        reminders: true,
        children: true,
        tags: true,
        parents: true,
      },
    });

    // Sincronización con Google Calendar (si aplica)
    if (user.googleRefreshToken && user.googleCalendarId) {
      try {
        oauth2Client.setCredentials({
          refresh_token: user.googleRefreshToken,
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const googleEvent = {
          summary: title,
          description,
          location,
          start: { dateTime: new Date(start).toISOString() },
          end: { dateTime: new Date(end).toISOString() },
          recurrence: recurrenceRule ? [recurrenceRule] : undefined,
          conferenceData: meetingLink
            ? { createRequest: { requestId: meetingLink } }
            : undefined,
        };

        const inserted = await calendar.events.insert({
          calendarId: user.googleCalendarId,
          requestBody: googleEvent,
        });

        console.log(
          "✅ Evento sincronizado con Google Calendar:",
          inserted.data.id
        );

        // ✅ Guardar el ID del evento en Google Calendar
        await prisma.event.update({
          where: { id: event.id },
          data: { googleEventId: inserted.data.id },
        });
      } catch (syncErr) {
        console.warn(
          "⚠️ No se pudo sincronizar con Google Calendar:",
          syncErr.message
        );
      }
    }

    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error al crear evento:", err);
    res.status(500).json({ message: "Error al crear evento" });
  }
};

// 📌 GET /api/calendar/events/:id
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentalAccountId } = req.user;

    const event = await prisma.event.findFirst({
      where: { id, calendar: { parentalAccountId } },
      include: {
        category: true,
        children: { include: { child: true } },
        tags: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const formatted = {
      ...event,
      children: event.children.map((ec) => ec.child),
    };

    return res.status(200).json({ event: formatted });
  } catch (err) {
    console.error("❌ Error en getEventById:", err);
    return res.status(500).json({ message: "Error al obtener evento" });
  }
};

// 📅 Sincronizar todos los eventos con Google Calendar
export const syncEventsWithGoogle = async (req, res) => {
  try {
    // Obtener todos los usuarios con Google Calendar vinculado
    const users = await prisma.user.findMany({
      where: {
        googleCalendarId: { not: null },
        googleRefreshToken: { not: null },
      },
    });

    // Iterar sobre cada usuario para sincronizar los eventos
    for (const user of users) {
      if (!user.googleCalendarId || !user.googleRefreshToken) {
        console.warn(
          "⚠️ Usuario sin Google Calendar vinculado o refresh token"
        );
        continue;
      }

      // Autenticación con Google usando el refresh token
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // Obtener los eventos desde la base de datos (Prisma)
      const events = await prisma.event.findMany({
        where: {
          calendar: { parentalAccountId: user.parentalAccountId },
        },
      });

      // Sincronizar cada evento con Google Calendar
      for (const event of events) {
        const googleEvent = {
          summary: event.title,
          description: event.description,
          location: event.location,
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
          recurrence: event.recurrenceRule ? [event.recurrenceRule] : undefined,
        };

        try {
          // Insertar el evento en Google Calendar
          const inserted = await calendar.events.insert({
            calendarId: user.googleCalendarId,
            requestBody: googleEvent,
          });
          console.log(
            "✅ Evento sincronizado con Google Calendar:",
            inserted.data.id
          );
        } catch (err) {
          console.warn(
            "⚠️ Error sincronizando con Google Calendar:",
            err.message
          );
        }
      }
    }

    return res.status(200).json({
      message: "Eventos sincronizados correctamente con Google Calendar.",
    });
  } catch (error) {
    console.error(
      "❌ Error al sincronizar eventos con Google Calendar:",
      error
    );
    return res
      .status(500)
      .json({ message: "Error al sincronizar eventos con Google Calendar." });
  }
};

export const syncAllEventsToGoogle = async (req, res) => {
  try {
    const { googleRefreshToken, googleCalendarId } = req.user;

    if (!googleRefreshToken || !googleCalendarId) {
      console.warn("⚠️ El usuario no tiene calendarId o refreshToken.");
      return res
        .status(401)
        .json({ message: "Unauthorized - Missing Google credentials" });
    }

    oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Sincronización de eventos...
    const events = await prisma.event.findMany({
      where: { calendar: { parentalAccountId: req.user.parentalAccountId } },
    });

    for (const event of events) {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
        recurrence: event.recurrenceRule ? [event.recurrenceRule] : undefined,
      };

      const inserted = await calendar.events.insert({
        calendarId: googleCalendarId,
        requestBody: googleEvent,
      });

      console.log(
        "✅ Evento sincronizado con Google Calendar:",
        inserted.data.id
      );
    }

    res
      .status(200)
      .json({ message: "Eventos sincronizados con Google Calendar" });
  } catch (err) {
    console.error("❌ Error al sincronizar eventos con Google Calendar:", err);
    res.status(500).json({ message: "Error al sincronizar eventos" });
  }
};
