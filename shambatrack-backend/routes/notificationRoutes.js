import express from "express";
import {
  sendNotification,
  getMyNotifications,
  markAsRead,
  getAllNotificationsForCoop,
} from "../controllers/notificationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendNotification);

router.get("/my", authMiddleware, getMyNotifications);

router.patch("/:id/read", authMiddleware, markAsRead);

router.get("/coop", authMiddleware, getAllNotificationsForCoop);

export default router;
