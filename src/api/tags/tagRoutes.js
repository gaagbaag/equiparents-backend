// src/api/tags/tagRoutes.js
import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { getTags } from "./tagController.js";

const router = express.Router();

// 🛡️ Protección global del módulo
router.use((req, res, next) => {
  console.log("📥 Solicitud recibida en /api/tags");
  next();
});
router.use(checkJwt, authenticate);

// 📌 GET /api/tags?type=event
router.get(
  "/",
  (req, res, next) => {
    console.log("🔍 GET /api/tags ejecutado con query:", req.query);
    next();
  },
  getTags
);

export default router;
