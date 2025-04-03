// src/categories/categoryController.js

import { prisma } from "../config/database.js";

/**
 * GET /api/categories
 * Lista categorías por tipo (event, expense, history)
 */
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        message: "Debes especificar el tipo: event, expense o history",
      });
    }

    const categories = await prisma.category.findMany({
      where: { type },
      orderBy: { name: "asc" },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    return res.status(500).json({ message: "Error al obtener categorías" });
  }
};
