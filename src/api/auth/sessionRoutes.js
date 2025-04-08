import express from "express";
import { checkJwt } from "../middleware/authenticate.js";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET /api/session → devuelve usuario desde base de datos, usando el JWT
router.get("/", checkJwt, async (req, res) => {
  try {
    const { sub } = req.auth || {};
    if (!sub) return res.status(401).json({ message: "Sesión inválida" });

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: sub },
      include: { role: true, address: true },
    });

    if (!dbUser)
      return res.status(404).json({ message: "Usuario no encontrado" });

    return res.status(200).json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        phone: dbUser.phone,
        countryCode: dbUser.countryCode,
        countryDialCode: dbUser.countryDialCode,
        parentalAccountId: dbUser.parentalAccountId,
        address: dbUser.address,
        role: dbUser.role?.name,
      },
      roles: [dbUser.role?.name || "parent"],
    });
  } catch (err) {
    console.error("❌ Error en /api/session:", err);
    res.status(500).json({ message: "Error interno" });
  }
});

export default router;
