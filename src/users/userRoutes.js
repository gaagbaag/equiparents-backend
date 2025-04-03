import express from "express";
import {
  checkJwt,
  authenticate,
  requireAdmin,
} from "../middleware/authenticate.js";
import {
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
  updateCurrentUser,
  updateUserRole,
  getUserBySub,
  updateUserBySub,
} from "./userController.js";

const router = express.Router();

// Ruta para obtener los datos del usuario autenticado
// Requiere JWT y que el usuario esté autenticado en la base de datos
router.get("/me", checkJwt, authenticate, getMe);

// Ruta para actualizar los datos del usuario autenticado
// Requiere JWT y que el usuario esté autenticado en la base de datos
router.put("/me", checkJwt, authenticate, updateCurrentUser);

// Ruta para obtener todos los usuarios (solo acceso de admin)
// Requiere JWT y rol de admin
router.get("/", checkJwt, authenticate, requireAdmin, getAllUsers);

// Ruta para actualizar o eliminar un usuario específico (solo acceso de admin)
// Requiere JWT y rol de admin
router.put("/:id", checkJwt, authenticate, requireAdmin, updateUser);
router.delete("/:id", checkJwt, authenticate, requireAdmin, deleteUser);

// Ruta para obtener un usuario por su `sub`v
// En tu ruta de Express
router.get("/users/:sub", checkJwt, authenticate, getUserBySub);

// Ruta para cambiar el rol de un usuario (solo acceso de admin)
// Requiere JWT y rol de admin
router.patch("/:id/role", checkJwt, authenticate, requireAdmin, updateUserRole);

export default router;
