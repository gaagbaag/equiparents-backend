import express from "express";
import { getSession } from "../controllers/sessionController.js";

const router = express.Router();

// Ruta: GET /api/session
router.get("/", getSession);

export default router;
