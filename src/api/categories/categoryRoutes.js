import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { getCategories } from "./categoryController.js";

const router = express.Router();

router.use(checkJwt, authenticate); // Se aplica a todas las rutas de este router

router.get("/", getCategories);

export default router;
