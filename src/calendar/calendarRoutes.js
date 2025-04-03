import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import { requireParentalAccount } from "../middleware/authenticate.js";
import { getEvents, createEvent, getEventById } from "./calendarController.js";

const router = express.Router();

router.get(
  "/events",
  checkJwt,
  authenticate,
  requireParentalAccount,
  getEvents
);
router.post(
  "/events",
  checkJwt,
  authenticate,
  requireParentalAccount,
  createEvent
);
router.get("/:id", getEventById);

export default router;
