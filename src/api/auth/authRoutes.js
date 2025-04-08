// src/auth/authRoutes.js
import express from "express";
import { checkJwt } from "../middleware/authenticate.js";
import { createUserPostLogin, getUserRole, logout } from "./authController.js";

const router = express.Router();

// ✅ Middleware: proteger todas las rutas siguientes con JWT válido
router.use(checkJwt);

// ✅ POST: Crear usuario automáticamente si no existe en la base de datos
router.post("/post-login", createUserPostLogin);

// ✅ POST: Obtener el rol del usuario (requiere auth0Id en body)
router.post("/role", getUserRole);

// ✅ GET: Cerrar sesión eliminando cookie
router.get("/logout", logout);

export default router;
