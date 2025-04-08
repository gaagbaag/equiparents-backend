// src/api/tags/tagController.js
import { prisma } from "../config/database.js";

/**
 * GET /api/tags?type=event
 * Devuelve tags filtrados por tipo (event, expense, history)
 */
export const getTags = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Falta el parámetro 'type'" });
    }

    const tags = await prisma.tag.findMany({
      where: { appliesTo: type },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ tags });
  } catch (err) {
    console.error("❌ Error al obtener tags:", err);
    res.status(500).json({ message: "Error interno al obtener tags" });
  }
};
