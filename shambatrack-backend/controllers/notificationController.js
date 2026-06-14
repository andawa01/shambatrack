import Notification from "../models/Notification.js";
import NotificationRecipient from "../models/NotificationRecipient.js";
import { v4 as uuidv4 } from "uuid";
import { sendSMS } from "../services/smsService.js";
import pool from "../config/mysql.js";

export async function sendNotification(req, res) {
  try {
    const { title, message, farmer_ids, channel } = req.body;

    const coop_id = req.user.coop_id;

    // 1. Create notification
    const notification = await Notification.create({
      coop_id,
      title,
      message,
      channel,
      created_by: req.user.id,
    });

    // 2. Get farmers from MySQL
    const [farmers] = await pool.execute(
      `
      SELECT
        f.id,
        u.name,
        f.phone
      FROM farmers f
      INNER JOIN users u
        ON u.id = f.user_id
      WHERE f.cooperative_id = ?
      `,
      [coop_id],
    );

    // Optional filtering if specific farmers selected
    const selectedFarmers =
      farmer_ids?.length > 0
        ? farmers.filter((f) => farmer_ids.includes(f.id))
        : farmers;

    // 3. Create recipients + send SMS
    for (const farmer of selectedFarmers) {
      const recipient = await NotificationRecipient.create({
        notification_id: notification._id,
        farmer_id: farmer.id,
        phone: farmer.phone,
        status: "pending",
      });

      try {
        if (
          channel === "sms" ||
          channel === "both" ||
          channel === "push" ||
          channel === "app"
        ) {
          console.log(
            `📱 Sending SMS to ${farmer.phone}: ${title}: ${message}`,
          );

          await sendSMS(farmer.phone, `${title}: ${message}`);

          console.log("✅ SMS sent successfully");
        }

        recipient.status = "sent";
        await recipient.save();
      } catch (err) {
        console.error(" SMS SEND FAILED:", err);

        recipient.status = "failed";
        await recipient.save();

        console.log("Recipient marked as FAILED");
      }
    }

    return res.json({
      message: "Notification sent successfully",
      notificationId: notification._id,
    });
  } catch (error) {
    console.error(" sendNotification ERROR:");
    console.error(error);

    return res.status(500).json({
      message: "Failed to send notification",
    });
  }
}

export async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;

    // find farmer linked to this user
    const [rows] = await pool.execute(
      "SELECT id FROM farmers WHERE user_id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.json([]); // user is not a farmer
    }

    const farmerId = rows[0].id;

    // query notifications correctly
    const notifications = await NotificationRecipient.find({
      farmer_id: farmerId,
    }).populate("notification_id");

    return res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

export async function markAsRead(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      "SELECT id FROM farmers WHERE user_id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farmerId = rows[0].id;
    const { id } = req.params;

    const updated = await NotificationRecipient.findOneAndUpdate(
      {
        notification_id: id,
        farmer_id: farmerId,
      },
      { is_read: true },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Marked as read",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notification" });
  }
}

export async function getAllNotificationsForCoop(req, res) {
  try {
    const coopId = req.user.coop_id;

    // 1. Get all notifications for this coop
    const notifications = await Notification.find({ coop_id: coopId })
      .sort({ createdAt: -1 })
      .lean();

    // 2. Attach recipient stats (sent / failed / total)
    const notificationIds = notifications.map((n) => n._id);

    const recipients = await NotificationRecipient.aggregate([
      {
        $match: {
          notification_id: { $in: notificationIds },
        },
      },
      {
        $group: {
          _id: "$notification_id",
          total: { $sum: 1 },
          sent: {
            $sum: {
              $cond: [{ $eq: ["$status", "sent"] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
            },
          },
          read: {
            $sum: {
              $cond: [{ $eq: ["$is_read", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 3. Convert to lookup map
    const statsMap = {};
    recipients.forEach((r) => {
      statsMap[r._id.toString()] = r;
    });

    // 4. Merge stats into notifications
    const result = notifications.map((n) => ({
      ...n,
      stats: statsMap[n._id.toString()] || {
        total: 0,
        sent: 0,
        failed: 0,
        read: 0,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching coop notifications" });
  }
}
