// categoryController.js
import { prisma } from "../config/database.js";

export async function getCategories(req, res) {
  try {
    const { type } = req.query;

    if (type === "event") {
      // Usa el modelo Category de tu schema
      // Filtrando por type="event" y ordenando por name ASC
      const categories = await prisma.category.findMany({
        where: { type: "event" },
        orderBy: { name: "asc" },
      });
      return res.json({ categories });
    }

    if (type === "expense") {
      // Filtrar por type="expense"
      const categories = await prisma.category.findMany({
        where: { type: "expense" },
        orderBy: { name: "asc" },
      });
      return res.json({ categories });
    }

    // Si el tipo no es event ni expense, retornamos error 400
    return res.status(400).json({ message: "Parámetro `type` inválido" });
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
}
