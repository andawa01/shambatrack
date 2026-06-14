import mongoose from "mongoose";

const notificationRecipientSchema = new mongoose.Schema(
  {
    notification_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },

    farmer_id: {
      type: String,
      required: true,
      index: true,
    },

    phone: String,

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "NotificationRecipient",
  notificationRecipientSchema,
);
