// src/utils/historyUtils.js
import { prisma } from "../config/database.js";

/**
 * 🧠 Crea una entrada de historial
 * @param {Object} params - Parámetros de entrada
 * @param {string} params.userId - ID del usuario que ejecutó la acción
 * @param {string} params.parentalAccountId - ID de la cuenta parental relacionada
 * @param {string} params.type - Tipo de acción (ej: "invitación creada")
 * @param {string} params.summary - Descripción corta de la acción
 * @param {string} [params.category] - Categoría opcional (ej: "invitación")
 * @param {string} [params.ip] - IP del cliente (opcional)
 * @param {string} [params.userAgent] - User agent del cliente (opcional)
 */
export const createHistoryEntry = async ({
  userId,
  parentalAccountId,
  type,
  summary,
  category = null,
  ip = null,
  userAgent = null,
}) => {
  try {
    await prisma.history.create({
      data: {
        userId,
        parentalAccountId,
        type,
        summary,
        ip,
        userAgent,
        category: category
          ? {
              connectOrCreate: {
                where: { name: category },
                create: { name: category, type: "history" },
              },
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error("❌ Error al registrar historial:", error);
  }
};
