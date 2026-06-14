import express from "express";
import {
  createCoopAdmin,
  createCooperative,
  getSystemDashboardStats,
  getCooperatives,
  getCoopAdmins,
  getCooperativeOptions,
} from "../controllers/systemAdminController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Cooperative
router.post(
  "/cooperatives",
  authMiddleware,
  requireRole("system_admin"),
  createCooperative,
);

// Create Coop Admin
router.post(
  "/coop-admin",
  authMiddleware,
  requireRole("system_admin"),
  createCoopAdmin,
);

// Get system dashboard stats
router.get(
  "/dashboard-stats",
  authMiddleware,
  requireRole("system_admin"),
  getSystemDashboardStats,
);

router.get("/cooperatives", getCooperatives);

router.get("/coop-admins", getCoopAdmins);

router.get("/cooperatives/options", getCooperativeOptions);

export default router;
