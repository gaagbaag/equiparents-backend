import express from "express";
import {
  checkJwt,
  authenticate,
  requireParentalAccount,
} from "../middleware/authenticate.js";
import {
  getParentalAccountForUser,
  getParentalAccountById,
  createParentalAccount,
  updateParentalAccount,
  deleteParentalAccount,
  inviteParent,
  acceptInvitation, // Asegúrate de que esta función esté incluida
} from "./parentalController.js";

const router = express.Router();

// Ruta protegida para obtener la cuenta parental del usuario
router.use(checkJwt, authenticate);

// Obtener cuenta parental asociada al usuario
router.get("/my-account", requireParentalAccount, getParentalAccountForUser);

// Obtener cuenta parental por ID
router.get("/:id", getParentalAccountById);

// Crear una nueva cuenta parental
router.post("/", createParentalAccount);

// Invitar a otro progenitor
router.post("/invite", inviteParent);

// Aceptar invitación
router.post("/use-invite", acceptInvitation);

// Actualizar cuenta parental
router.put("/:id", updateParentalAccount);

// Eliminar cuenta parental
router.delete("/:id", deleteParentalAccount);

// Crear cuenta parental desde onboarding (familia)
router.post(
  "/onboarding/family",
  checkJwt,
  authenticate,
  createParentalAccount
);

export default router;
