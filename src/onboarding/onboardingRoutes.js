import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { handleFamilyOnboarding } from "./onboardingController.js";

const router = express.Router();

// Ruta para manejar el proceso de crear o unirse a una cuenta parental
// Se elimina /api porque ya está siendo gestionado en el router principal
router.post(
  "/family", // La ruta ahora será solo /family
  checkJwt, // Verifica el JWT
  authenticate, // Asegura que el usuario esté autenticado
  (req, res, next) => {
    console.log("🚀 Solicitud recibida en /onboarding/family:", req.body);
    next(); // Continuamos con el siguiente middleware o controlador
  },
  handleFamilyOnboarding // Controlador que maneja el flujo de la cuenta parental
);

export default router;
