import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authenticate.js";
import { getHistory, getRecentHistory } from "./historyController.js";

const router = express.Router();

router.get("/", checkJwt, authenticate, requireRole("admin"), getHistory);
router.get("/recent", checkJwt, authenticate, getRecentHistory);
router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

export default router;
