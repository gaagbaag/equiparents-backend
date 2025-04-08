import express from "express";

// Middlewares
import {
  checkJwt,
  authenticate,
  requireAdmin,
  requireRole,
  requireParentalAccount,
} from "./middleware/authenticate.js";

// Rutas de módulos
import authRoutes from "./auth/authRoutes.js";
import userRoutes from "./users/userRoutes.js";
import parentalRoutes from "./parentalAccounts/parentalRoutes.js";
import invitationRoutes from "./invitations/invitationRoutes.js";
import calendarRoutes from "./calendar/calendarRoutes.js";
import historyRoutes from "./history/historyRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";
import categoryRoutes from "./categories/categoryRoutes.js";
import childrenRoutes from "./children/childrenRoutes.js";
import roleRoutes from "./roles/roleRoutes.js";
import onboardingRoutes from "./onboarding/onboardingRoutes.js";
import tagRoutes from "./tags/tagRoutes.js";

const router = express.Router();

// 🔐 Rutas protegidas
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/parental-accounts", checkJwt, authenticate, parentalRoutes);
router.use("/invitations", checkJwt, authenticate, invitationRoutes);
router.use(
  "/calendar",
  checkJwt,
  authenticate,
  requireParentalAccount,
  calendarRoutes
);
router.use(
  "/children",
  checkJwt,
  authenticate,
  requireParentalAccount,
  childrenRoutes
);
router.use("/categories", checkJwt, authenticate, categoryRoutes);
router.use("/history", checkJwt, authenticate, historyRoutes);
router.use("/admin", checkJwt, authenticate, requireAdmin, adminRoutes);
router.use("/roles", checkJwt, authenticate, requireRole("admin"), roleRoutes);
router.use("/onboarding", checkJwt, authenticate, onboardingRoutes);
router.use("/tags", checkJwt, authenticate, tagRoutes);

export default router;
