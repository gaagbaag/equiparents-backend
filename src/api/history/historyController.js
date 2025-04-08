import { prisma } from "../config/database.js";

/**
 * 📜 GET /api/history
 * Devuelve todo el historial del usuario autenticado
 */
export const getHistory = async (req, res) => {
  try {
    const { sub: auth0Id } = req.auth.payload;
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: { history: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ history: user.history });
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    return res.status(500).json({ message: "Error al obtener historial" });
  }
};

/**
 * 📅 GET /api/history/recent
 * Devuelve las últimas 10 entradas de historial del usuario autenticado
 */
export const getRecentHistory = async (req, res) => {
  try {
    const { sub: auth0Id } = req.auth.payload;
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const recentHistory = await prisma.history.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return res.status(200).json({ history: recentHistory });
  } catch (error) {
    console.error("❌ Error al obtener historial reciente:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener historial reciente" });
  }
};
