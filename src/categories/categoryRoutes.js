// src/categories/categoryRoutes.js

import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { getCategories } from "./categoryController.js";

const router = express.Router();

// 🛡️ Ruta protegida
router.get("/", checkJwt, authenticate, getCategories);

export default router;
