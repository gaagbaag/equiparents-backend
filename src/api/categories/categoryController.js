import { prisma } from "../config/database.js";

export async function getCategories(req, res) {
  try {
    const { type } = req.query;

    if (type === "event") {
      const categories = await prisma.eventCategory.findMany({
        orderBy: { name: "asc" },
      });
      return res.json({ categories });
    }

    if (type === "expense") {
      const categories = await prisma.expenseCategory.findMany({
        orderBy: { name: "asc" },
      });
      return res.json({ categories });
    }

    return res.status(400).json({ message: "Parámetro `type` inválido" });
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
}
