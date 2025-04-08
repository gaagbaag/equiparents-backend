import { prisma } from "../config/database.js";

/**
 * 📅 GET /api/calendar/events
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
    return res.status(500).json({ message: "Error al obtener eventos" });
  }
};

/**
 * 📝 POST /api/calendar/events
 * Crea un nuevo evento en el calendario familiar
 */
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
    } = req.body;

    if (!title || !start || !end || !categoryId) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        message: "La fecha de término debe ser posterior a la de inicio",
      });
    }

    // Eliminar duplicados
    childIds = [...new Set(childIds)];
    tagIds = [...new Set(tagIds)];

    // Buscar el calendario
    const calendar = await prisma.calendar.findUnique({
      where: { parentalAccountId },
    });

    if (!calendar) {
      return res.status(404).json({ message: "Calendario no encontrado" });
    }

    // Crear el evento
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
        tags: {
          connect: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
      include: {
        children: { include: { child: true } },
        category: true,
        tags: true,
      },
    });

    // 🔎 Buscar la categoría de historial (type=history, name="Evento")
    // para registrar la acción en el historial
    const historyCategory = await prisma.category.findFirst({
      where: { type: "history", name: "Evento" },
    });

    await prisma.history.create({
      data: {
        userId,
        parentalAccountId,
        type: "evento",
        categoryId: historyCategory?.id || undefined,
        summary: `📅 Evento creado: ${title} (${tagIds.length} etiquetas)`,
      },
    });

    return res.status(201).json({ message: "Evento creado", event: newEvent });
  } catch (error) {
    console.error("❌ Error al crear evento:", error);
    return res.status(500).json({ message: "Error al crear evento" });
  }
};

/**
 * 📌 GET /api/calendar/events/:id
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
        tags: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // Reorganizar los hijos para comodidad
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
