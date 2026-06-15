import express from "express";
import {
  applyLoan,
  getMyLoans,
  getMyPayments,
  getAvailableProducts,
  getMyNotifications,
  markNotificationAsRead,
  getFarmerDashboard,
  getFarmerDeliveries,
  getFarmerPayments,
  getMyWallet,
  getFarmerLoanSummary,
  getFarmerLoanDetails,
  getFarmerLoanTransactions,
  getFarmerProfile,
  getFarmerLoanEligibility,
} from "../controllers/farmerController.js";

import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/loans/apply", authMiddleware, applyLoan);

router.get("/loans", authMiddleware, getMyLoans);

router.get("/loans/eligibility", authMiddleware, getFarmerLoanEligibility);

router.get("/payments", authMiddleware, getMyPayments);

router.get("/products", authMiddleware, getAvailableProducts);

router.get("/notifications", authMiddleware, getMyNotifications);
router.patch("/notifications/:id/read", authMiddleware, markNotificationAsRead);

router.get("/dashboard", authMiddleware, getFarmerDashboard);

router.get("/deliveries", authMiddleware, getFarmerDeliveries);

router.get(
  "/payments",
  authMiddleware,
  requireRole("farmer"),
  getFarmerPayments,
);

router.get("/wallet", authMiddleware, requireRole("farmer"), getMyWallet);

router.get("/loans/summary", authMiddleware, getFarmerLoanSummary);

router.get("/loans/:id", authMiddleware, getFarmerLoanDetails);

router.get(
  "/loans/:id/transactions",
  authMiddleware,
  getFarmerLoanTransactions,
);

router.get("/profile", authMiddleware, getFarmerProfile);

export default router;
