// src/auth/authRoutes.js
import express from "express";
import { checkJwt } from "../middleware/authenticate.js";
import { createUserPostLogin, getUserRole, logout } from "./authController.js";

const router = express.Router();

// ✅ Rutas protegidas con JWT
router.use(checkJwt);

// POST: Crear usuario automáticamente si no existe
router.post("/post-login", createUserPostLogin);

// POST: Obtener rol del usuario (por auth0Id)
router.post("/role", getUserRole);

// GET: Cerrar sesión (opcional, cookies)
router.get("/logout", logout);

export default router;
