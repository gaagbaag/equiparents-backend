// src/children/childrenRoutes.js
import express from "express";
import {
  getAllChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
} from "./childrenController.js";

const router = express.Router();

router.get("/", getAllChildren);
router.get("/:id", getChildById);
router.post("/", createChild);
router.put("/:id", updateChild);
router.delete("/:id", deleteChild);

export default router;
