// 📍 Ruta sugerida: GET /api/children/upcoming-events

import { prisma } from "../config/database.js";

export const getChildrenWithUpcomingEvents = async (req, res) => {
  try {
    const hijos = await prisma.child.findMany({
      where: {
        eventLinks: {
          some: {
            event: {
              start: { gt: new Date() },
            },
          },
        },
      },
      include: {
        parentalAccount: true,
        eventLinks: {
          where: {
            event: {
              start: { gt: new Date() },
            },
          },
          include: {
            event: {
              include: {
                category: true,
                calendar: {
                  include: {
                    parentalAccount: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({ children: hijos });
  } catch (error) {
    console.error("❌ Error al obtener hijos con eventos futuros:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
