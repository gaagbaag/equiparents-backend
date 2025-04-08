// src/api/parentalAccounts/parentalFinalizeController.js
import { prisma } from "../config/database.js";
import { createHistoryEntry } from "../../utils/historyUtils.js";

/**
 * 🎯 POST /api/parental-accounts/finalize-step
 * Marca el paso "parents" o "children" como finalizado.
 * Si ambos están listos, marca la cuenta como `finalized: true`.
 */
export const finalizeStep = async (req, res) => {
  try {
    const { parentalAccountId, id: userId } = req.user;
    const { step } = req.body;

    if (!["parents", "children"].includes(step)) {
      return res.status(400).json({ message: "Paso no válido." });
    }

    const account = await prisma.parentalAccount.findUnique({
      where: { id: parentalAccountId },
    });

    if (!account) {
      return res
        .status(404)
        .json({ message: "Cuenta parental no encontrada." });
    }

    // Preparar campos a actualizar
    const updateData = {};
    if (step === "parents") updateData.parentsReady = true;
    if (step === "children") updateData.childrenReady = true;

    const updated = await prisma.parentalAccount.update({
      where: { id: parentalAccountId },
      data: updateData,
    });

    // Si ambos pasos están listos, marcar como finalizado
    if (updated.parentsReady && updated.childrenReady && !updated.finalized) {
      const finalized = await prisma.parentalAccount.update({
        where: { id: parentalAccountId },
        data: { finalized: true },
      });

      await createHistoryEntry({
        userId,
        parentalAccountId,
        type: "configuración completada",
        summary: "La cuenta parental fue marcada como finalizada.",
      });

      return res.status(200).json({
        message: "Cuenta parental finalizada exitosamente.",
        finalized: true,
      });
    }

    return res.status(200).json({
      message: `Paso "${step}" marcado como completado.`,
      finalized: updated.finalized,
    });
  } catch (error) {
    console.error("❌ Error al finalizar paso:", error);
    return res.status(500).json({
      message: "Error interno al finalizar la configuración.",
    });
  }
};
