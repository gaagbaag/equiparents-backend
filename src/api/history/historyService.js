// src/api/history/historyService.js
import { prisma } from "../config/database.js";

/**
 * 📥 Registra un evento de historial para un usuario
 */
export async function registerHistoryEvent(
  userId,
  category,
  summary = null,
  type = "system"
) {
  try {
    return await prisma.history.create({
      data: {
        userId,
        category,
        summary,
        type,
        // Si usas parentalAccountId en el modelo de History, puedes agregarlo también
        // parentalAccountId: ...
      },
    });
  } catch (error) {
    console.error("❌ Error al registrar evento en historial:", error);
    throw new Error("Error al registrar historial");
  }
}

/**
 * 🔍 Obtiene el historial completo de un usuario por ID
 */
export async function getHistoryByUserId(userId) {
  return await prisma.history.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * 🔟 Obtiene las últimas 10 entradas del historial de un usuario
 */
export async function getRecentHistoryByUserId(userId) {
  return await prisma.history.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

/**
 * 🧑‍🤝‍🧑 Obtiene historial por cuenta parental (opcional si usas parentalAccountId)
 */
export async function getHistoryByParentalAccount(parentalAccountId) {
  return await prisma.history.findMany({
    where: { parentalAccountId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });
}
