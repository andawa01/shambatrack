import express from "express";
import {
  getAuditLogs,
  getFarmerAuditLogs,
} from "../controllers/auditLogsController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/audit-logs",
  authMiddleware,
  requireRole("system_admin"),
  getAuditLogs,
);

router.get(
  "/audit-logs/farmer",
  authMiddleware,
  requireRole("farmer"),
  getFarmerAuditLogs,
);

export default router;
