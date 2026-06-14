import express from "express";
import {
  createFarmer,
  getFarmers,
  getFarmerById,
  updateFarmer,
  deactivateFarmer,
  recordDelivery,
  getDeliveries,
  getDeliveryById,
  getCoopAdminDashboard,
  updateDelivery,
} from "../controllers/coopAdminController.js";

import { getCoopAuditLogs } from "../controllers/auditLogsController.js";

import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("coop_admin"));

router.post("/farmers", createFarmer);
router.get("/farmers", getFarmers);
router.get("/farmers/:id", getFarmerById);
router.put("/farmers/:id", updateFarmer);
router.patch("/farmers/:id/status", deactivateFarmer);

router.post(
  "/deliveries",
  authMiddleware,
  requireRole("coop_admin"),
  recordDelivery,
);

router.get(
  "/deliveries",
  authMiddleware,
  requireRole("coop_admin"),
  getDeliveries,
);

router.get(
  "/deliveries/:id",
  authMiddleware,
  requireRole("coop_admin"),
  getDeliveryById,
);

router.get(
  "/dashboard",
  authMiddleware,
  requireRole("coop_admin"),
  getCoopAdminDashboard,
);

router.put(
  "/deliveries/:id",
  authMiddleware,
  requireRole("coop_admin"),
  updateDelivery,
);

router.get(
  "/audit-logs",
  authMiddleware,
  requireRole("coop_admin"),
  getCoopAuditLogs,
);

export default router;
