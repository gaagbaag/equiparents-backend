import { prisma } from "../config/database.js";
import { createHistoryEntry } from "../utils/historyUtils.js";
import { getClientIP, getUserAgent } from "../utils/requestInfo.js";

/**
 * 📌 Obtener todos los hijos asociados a la cuenta parental
 */
export const getAllChildren = async (req, res) => {
  try {
    const { parentalAccountId } = req.user;
    if (!parentalAccountId) {
      return res
        .status(403)
        .json({ message: "No tienes cuenta parental asociada" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const children = await prisma.child.findMany({
      where: { parentalAccountId },
      skip: offset,
      take: limit,
    });

    res.status(200).json({ children });
  } catch (error) {
    console.error("❌ Error al obtener los hijos:", error);
    res.status(500).json({ message: "Error al obtener los hijos." });
  }
};

/**
 * 📌 Obtener un hijo específico
 */
export const getChildById = async (req, res) => {
  const { id } = req.params;
  try {
    const child = await prisma.child.findFirst({
      where: {
        id,
        parentalAccountId: req.user.parentalAccountId,
      },
    });

    if (!child) {
      return res.status(404).json({ message: "Hijo no encontrado." });
    }

    res.status(200).json({ status: "success", data: child });
  } catch (error) {
    console.error("❌ Error al obtener el hijo:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * 📌 Crear un nuevo hijo
 */
export const createChild = async (req, res) => {
  const { firstName, birthDate } = req.body;
  const { id: userId, parentalAccountId } = req.user;

  if (!firstName || !birthDate) {
    return res.status(400).json({
      message: "El nombre y la fecha de nacimiento son obligatorios.",
    });
  }

  try {
    const newChild = await prisma.child.create({
      data: {
        firstName,
        lastName: "",
        birthDate: new Date(birthDate),
        parentalAccountId,
      },
    });

    await createHistoryEntry({
      parentalAccountId,
      userId,
      type: "hijo creado",
      summary: `Se agregó al hijo "${newChild.firstName}" con fecha ${birthDate}`,
      ip: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    res.status(201).json(newChild); // ✅ devuelve el hijo directamente
  } catch (error) {
    console.error("❌ Error en createChild:", error);
    res.status(500).json({ message: "Error al crear el hijo." });
  }
};

/**
 * 📌 Actualizar hijo
 */
export const updateChild = async (req, res) => {
  const { id } = req.params;
  const { firstName, birthDate } = req.body;
  const { id: userId, parentalAccountId } = req.user;

  try {
    const existing = await prisma.child.findUnique({ where: { id } });

    if (!existing || existing.parentalAccountId !== parentalAccountId) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para modificar este hijo." });
    }

    const updated = await prisma.child.update({
      where: { id },
      data: { firstName, birthDate },
    });

    // 🧠 Registrar historial
    await createHistoryEntry({
      parentalAccountId,
      userId,
      type: "hijo editado",
      summary: `Se actualizó al hijo/a de "${existing.firstName}" a "${updated.firstName}"`,
      ip: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error al actualizar hijo/a:", error);
    res.status(500).json({ message: "Error al actualizar hijo/a." });
  }
};

/**
 * 📌 Eliminar hijo
 */
export const deleteChild = async (req, res) => {
  const { id } = req.params;
  const { id: userId, parentalAccountId } = req.user;

  try {
    const child = await prisma.child.findUnique({ where: { id } });

    if (!child || child.parentalAccountId !== parentalAccountId) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este hijo." });
    }

    await prisma.child.delete({ where: { id } });

    await createHistoryEntry({
      parentalAccountId,
      userId,
      type: "hijo eliminado",
      summary: `Se eliminó al hijo "${child.firstName}"`,
      ip: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    res.status(200).json({ message: "Hijo eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar hijo:", error);
    res.status(500).json({ message: "Error al eliminar hijo." });
  }
};
