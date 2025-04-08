import { prisma } from "../config/database.js";
import { createGoogleCalendarEvent } from "../utils/googleCalendarService.js";

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
export const createEvent = async (req, res) => {
  try {
    const { parentalAccountId, id: userId } = req.user;
    let {
      title,
      description,
      start,
      end,
      location,
      status = "pending",
      categoryId,
      childIds = [],
      tagIds = [],
      parentIds = [],
      timezone,
      recurrenceRule,
      meetingLink,
      reminders = [],
    } = req.body;

    if (!title || !start || !end || !categoryId) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        message: "La fecha de término debe ser posterior a la de inicio",
      });
    }

    childIds = [...new Set(childIds)];
    tagIds = [...new Set(tagIds)];
    parentIds = [...new Set(parentIds)];

    const calendar = await prisma.calendar.findUnique({
      where: { parentalAccountId },
    });

    if (!calendar) {
      return res.status(404).json({ message: "Calendario no encontrado" });
    }

    const durationHours = parseFloat(
      ((new Date(end).getTime() - new Date(start).getTime()) / 3600000).toFixed(
        2
      )
    );

    const newEvent = await prisma.event.create({
      data: {
        calendarId: calendar.id,
        createdById: userId,
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        location,
        status,
        timezone,
        recurrenceRule,
        meetingLink,
        categoryId,
        children: {
          create: childIds.map((id) => ({ child: { connect: { id } } })),
        },
        tags: { connect: tagIds.map((id) => ({ id })) },
        parents: {
          create: parentIds.map((id) => ({
            user: { connect: { id } },
            hoursSpent: durationHours,
          })),
        },
        reminders: {
          create: reminders.map((r) => ({
            type: r.type,
            minutesBefore: r.minutesBefore,
          })),
        },
      },
      include: {
        children: { include: { child: true } },
        category: true,
        tags: true,
        parents: { include: { user: true } },
        reminders: true,
      },
    });

    await prisma.history.create({
      data: {
        userId,
        parentalAccountId,
        type: "evento",
        summary: `📅 Evento creado: ${title} (${tagIds.length} etiquetas)`,
      },
    });

    // 🚀 Sincronización Google Calendar
    try {
      const gEvent = await createGoogleCalendarEvent({
        title,
        description,
        start,
        end,
        timezone,
        recurrenceRule,
        meetingLink,
        reminders,
      });
      console.log("✅ Evento sincronizado en Google Calendar:", gEvent.id);
    } catch (syncError) {
      console.error(
        "⚠️ Error al sincronizar con Google Calendar:",
        syncError.message
      );
      // Decidir si manejar rollback o solo registrar el error
    }

    return res.status(201).json({ message: "Evento creado", event: newEvent });
  } catch (error) {
    console.error("❌ Error al crear evento:", error);
    return res.status(500).json({ message: "Error al crear evento" });
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
