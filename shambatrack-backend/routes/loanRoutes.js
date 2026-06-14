import express from "express";
import {
  createLoan,
  approveLoan,
  disburseLoan,
  repayLoan,
  getLoans,
  loanSummary,
  getOverdueLoans,
  getLoanById,
  getLoanEligibility,
} from "../controllers/loanController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("coop_admin"), createLoan);

router.patch(
  "/:id/approve",
  authMiddleware,
  requireRole("coop_admin"),
  approveLoan,
);

router.patch(
  "/:id/disburse",
  authMiddleware,
  requireRole("coop_admin"),
  disburseLoan,
);

router.post("/:id/repay", authMiddleware, requireRole("coop_admin"), repayLoan);

router.get("/", authMiddleware, requireRole("coop_admin"), getLoans);

router.get("/summary", authMiddleware, requireRole("coop_admin"), loanSummary);

router.get(
  "/overdue",
  authMiddleware,
  requireRole("coop_admin"),
  getOverdueLoans,
);

router.get("/:id", authMiddleware, requireRole("coop_admin"), getLoanById);

router.get("/eligibility/:farmer_id", authMiddleware, getLoanEligibility);

export default router;
