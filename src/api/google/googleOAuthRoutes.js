import express from "express";
import { checkJwt, authenticate } from "../middleware/authenticate.js";
import {
  initGoogleOAuth,
  handleGoogleOAuthCallback,
  saveGoogleRefreshToken,
  listUserCalendars,
  selectUserCalendar,
} from "./googleOAuthController.js";

const router = express.Router();

router.get("/oauth/init", initGoogleOAuth); // sin protección
router.get("/oauth/callback", handleGoogleOAuthCallback); // sin protección

// 🔐 autenticadas por JWT
router.post(
  "/oauth/save-token",
  checkJwt,
  authenticate,
  saveGoogleRefreshToken
);

router.get("/calendar-list", checkJwt, authenticate, listUserCalendars);
router.post("/calendar-select", checkJwt, authenticate, selectUserCalendar);

export default router;
