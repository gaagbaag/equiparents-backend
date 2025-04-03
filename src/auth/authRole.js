import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { prisma } from "../config/database.js";

import {
  getParentalAccountForUser,
  getParentalAccountById,
  createParentalAccount,
  updateParentalAccount,
  deleteParentalAccount,
  inviteParent,
} from "../parentalAccounts/parentalController.js";

import { createUserPostLogin, getUserRole } from "./authController.js";

const router = express.Router();

// ✅ Middleware JWT global para proteger todas las rutas
const checkJwt = auth({
  audience: "https://equiparents.api",
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

router.use(checkJwt);

// ✅ Ruta que Auth0 llama para obtener el rol real del usuario
router.post("/role", getUserRole);

// ✅ Ruta que crea automáticamente el usuario tras login exitoso
router.post("/post-login", createUserPostLogin);

// 🔒 Rutas protegidas para gestión de cuenta parental
router.get("/", getParentalAccountForUser);
router.get("/me", async (req, res) => {
  const auth0Id = req.auth?.payload?.sub;
  if (!auth0Id) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      select: { parentalAccountId: true },
    });

    if (!user || !user.parentalAccountId) {
      return res.status(404).json({ message: "Cuenta parental no encontrada" });
    }

    return res.status(200).json({ parentalAccountId: user.parentalAccountId });
  } catch (error) {
    console.error("❌ Error al obtener cuenta parental:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🛡️ Rutas solo para administradores
router.post("/", authorizeRole("admin"), createParentalAccount);
router.post("/invite", authorizeRole("admin"), inviteParent);
router.put("/:id", authorizeRole("admin"), updateParentalAccount);
router.delete("/:id", authorizeRole("admin"), deleteParentalAccount);
router.get("/:id", getParentalAccountById); // disponible para todos los autenticados

export default router;
