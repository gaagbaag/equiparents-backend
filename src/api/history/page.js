import express from "express";
import { authenticate } from "../middleware/index.js";

// Middleware para verificar roles
import { prisma } from "../config/database.js"; // Prisma para base de datos

const router = express.Router();

// ✅ Ruta protegida real, accesible por admin o parent
router.get(
  "/",
  authenticate, // Middleware que valida el JWT y coloca los datos del usuario en `req.user`
  authorizeAnyRole(["admin", "parent"]), // Verifica que el usuario tenga el rol adecuado
  async (req, res) => {
    try {
      const { parentalAccountId } = req.user; // Extraemos el `parentalAccountId` del usuario

      // Asegúrate de que `parentalAccountId` esté disponible en `req.user`
      if (!parentalAccountId) {
        return res
          .status(403)
          .json({ message: "No tienes permiso para acceder al historial" });
      }

      // Consulta de historial desde la base de datos utilizando Prisma
      const history = await prisma.history.findMany({
        where: { parentalAccountId },
        select: {
          id: true,
          category: true,
          type: true,
          summary: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" }, // Ordenar el historial por fecha (opcional)
      });

      // Responder con los datos del historial
      res.status(200).json({ data: history });
    } catch (err) {
      console.error("❌ Error en /history:", err);
      res.status(500).json({ message: "Error al obtener historial" });
    }
  }
);

// 🔓 Ruta pública de prueba
router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

export default router;
