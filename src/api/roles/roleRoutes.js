import express from "express";
import { checkJwt, requireRole } from "../middleware/authenticate.js";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "./roleController.js"; // Rutas y controladores de roles

const router = express.Router();

// Ruta protegida para obtener todos los roles
router.get("/", checkJwt, requireRole(["admin"]), getAllRoles); // Solo admin puede acceder

// Ruta para crear un nuevo rol
router.post("/", checkJwt, requireRole(["admin"]), createRole);

// Ruta para actualizar un rol
router.put("/:id", checkJwt, requireRole(["admin"]), updateRole);

// Ruta para eliminar un rol
router.delete("/:id", checkJwt, requireRole(["admin"]), deleteRole);

export default router;
