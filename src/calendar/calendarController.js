import { prisma } from "../config/database.js";

/**
 * 📅 GET /api/events
 * Devuelve eventos del calendario con filtros opcionales
 */
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
    res.status(500).json({ message: "Error al obtener eventos" });
  }
};

/**
 * 📝 POST /api/events
 * Crea un nuevo evento en el calendario familiar
 */
export const createEvent = async (req, res) => {
  try {
    const { parentalAccountId, id: userId } = req.user;
    const {
      title,
      description,
      start,
      end,
      location,
      status = "pending",
      categoryId,
      childIds = [],
    } = req.body;

    if (!title || !start || !end || !categoryId) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const calendar = await prisma.calendar.findUnique({
      where: { parentalAccountId },
    });

    if (!calendar) {
      return res.status(404).json({ message: "Calendario no encontrado" });
    }

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
        categoryId,
        children: {
          create: childIds.map((childId) => ({
            child: { connect: { id: childId } },
          })),
        },
      },
      include: {
        children: { include: { child: true } },
        category: true,
      },
    });

    await prisma.history.create({
      data: {
        userId,
        parentalAccountId,
        type: "evento",
        categoryId,
        summary: `📅 Evento creado: ${title}`,
      },
    });

    return res.status(201).json({ message: "Evento creado", event: newEvent });
  } catch (error) {
    console.error("❌ Error al crear evento:", error);
    return res.status(500).json({ message: "Error al crear evento" });
  }
};

/**
 * 📌 GET /api/events/:id
 * Devuelve un evento específico con hijos y categoría
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentalAccountId } = req.user;

    const event = await prisma.event.findFirst({
      where: {
        id,
        calendar: { parentalAccountId },
      },
      include: {
        category: true,
        children: { include: { child: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // Aplanar la relación muchos-a-muchos para devolver los hijos directamente
    const formatted = {
      ...event,
      children: event.children.map((ec) => ec.child),
    };

    return res.status(200).json({ data: formatted });
  } catch (err) {
    console.error("❌ Error en getEventById:", err);
    res.status(500).json({ message: "Error al obtener evento" });
  }
};
