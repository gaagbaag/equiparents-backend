// test/emailTestRoutes.js
import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { createHistoryEntry } from "../utils/historyUtils.js";

const router = express.Router();

/**
 * 📬 Ruta protegida con JWT y usuario autenticado
 * POST /api/test/email
 */
router.post("/email", checkJwt, authenticate, async (req, res) => {
  try {
    const { to = "gabrielaguayo@equiparents.app" } = req.body;

    console.log("📨 (Simulado) Enviando correo a:", to);

    await createHistoryEntry({
      userId: req.user.id,
      parentalAccountId: req.user.parentalAccountId,
      type: "evento",
      category: "invitación",
      summary: `Correo simulado enviado a ${to} como prueba.`,
      ip:
        req.headers["x-forwarded-for"]?.toString() ||
        req.socket?.remoteAddress ||
        null,
      userAgent: req.headers["user-agent"] || null,
    });

    res.status(200).json({
      status: "success",
      message: `Correo simulado enviado a ${to}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al simular envío de correo.",
      details: error.message,
    });
  }
});

/**
 * 🧪 Ruta de prueba sin autenticación (solo para desarrollo)
 * POST /api/test/email/dev
 */
router.post("/email/dev", async (req, res) => {
  try {
    const { to = "gabrielaguayo@equiparents.app" } = req.body;

    console.log("📨 (Simulado DEV) Enviando correo a:", to);

    await createHistoryEntry({
      userId: "dev-user",
      parentalAccountId: "dev-account",
      type: "evento",
      category: "invitación",
      summary: `Correo simulado (dev) enviado a ${to}.`,
      ip:
        req.headers["x-forwarded-for"]?.toString() ||
        req.socket?.remoteAddress ||
        null,
      userAgent: req.headers["user-agent"] || null,
    });

    res.status(200).json({
      status: "success",
      message: `Correo simulado enviado sin autenticación a ${to}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al simular envío de correo.",
      details: error.message,
    });
  }
});

export default router;
