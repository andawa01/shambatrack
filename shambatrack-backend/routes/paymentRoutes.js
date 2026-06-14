import express from "express";
import {
  getPendingPayments,
  getPendingPaymentById,
  processPayment,
  getFarmerWallet,
  getFarmerWalletTransactions,
  getCooperativeWallet,
  getCooperativeTransactions,
  walletSummary,
  depositToCooperativeWallet,
} from "../controllers/paymentController.js";

import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("coop_admin"));

router.get("/pending", getPendingPayments);

router.get("/pending/:deliveryId", getPendingPaymentById);

router.post("/process", processPayment);

router.get("/farmer-wallet/:farmerId", getFarmerWallet);

router.get(
  "/farmer-wallet/:farmerId/transactions",
  getFarmerWalletTransactions,
);

router.get("/coop-wallet", getCooperativeWallet);

router.get("/coop-transactions", getCooperativeTransactions);

router.get("/summary", walletSummary);

router.post("/deposit", depositToCooperativeWallet);

export default router;
