import express from "express";
import {
  checkJwt,
  authenticate,
  requireParentalAccount,
} from "../middleware/authenticate.js";
import {
  getEvents,
  createEvent,
  getEventById,
  syncAllEventsToGoogle,
} from "./calendarController.js";

const router = express.Router();

router.use(checkJwt, authenticate, requireParentalAccount); // Todo requiere cuenta parental

router.get("/events", getEvents);
router.post("/events", createEvent);
router.get("/:id", getEventById);
router.post(
  "/sync-events-to-google",
  checkJwt,
  authenticate,
  syncAllEventsToGoogle
);

export default router;
