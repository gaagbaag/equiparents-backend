import express from "express";
import {
  checkJwt,
  authenticate,
  requireAdmin,
} from "../middleware/authenticate.js";
import {
  getAdminDashboardStats,
  getAllUsersWithAccounts,
  deleteEvent,
  cleanHistory,
} from "./adminController.js";

const router = express.Router();

router.get(
  "/dashboard",
  checkJwt,
  authenticate,
  requireAdmin,
  getAdminDashboardStats
);
router.get(
  "/users",
  checkJwt,
  authenticate,
  requireAdmin,
  getAllUsersWithAccounts
);
router.post(
  "/clean-history",
  checkJwt,
  authenticate,
  requireAdmin,
  cleanHistory
);
router.delete("/events/:id", checkJwt, authenticate, requireAdmin, deleteEvent);

export default router;
