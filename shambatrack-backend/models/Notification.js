import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    coop_id: { type: String, required: true, index: true },

    title: { type: String, required: true, trim: true },

    message: { type: String, required: true, trim: true },

    type: {
      type: String,
      enum: ["loan", "payment", "delivery", "general", "system"],
      default: "general",
    },

    channel: {
      type: String,
      enum: ["sms", "app", "both", "push"],
      default: "in_app",
    },

    created_by: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
