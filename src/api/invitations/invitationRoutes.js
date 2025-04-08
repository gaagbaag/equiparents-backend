import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import {
  sendInvitation,
  acceptInvitation,
  getActiveInvitation,
  deleteActiveInvitation,
  getExpiredInvitation,
} from "./invitationController.js";

const router = express.Router();

// Enviar una invitación (requiere autenticación)
router.post("/", checkJwt, authenticate, sendInvitation);

// Aceptar una invitación con código (sin autenticación)
router.post("/accept", checkJwt, authenticate, acceptInvitation);

// Obtener invitación activa para la cuenta parental
router.get("/active", checkJwt, authenticate, getActiveInvitation);

// Cancelar invitación activa
router.delete("/active", checkJwt, authenticate, deleteActiveInvitation);

// Obtener invitaciones expiradas
router.get("/expired", checkJwt, authenticate, getExpiredInvitation);

export default router;
