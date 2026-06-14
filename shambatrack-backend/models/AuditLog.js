import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },

    coop_id: {
      type: String,
      default: null,
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    entity: {
      type: String,
      required: true,
    },

    user_name: {
      type: String,
      default: null,
    },

    entity_id: {
      type: String,
      required: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ip_address: {
      type: String,
      default: null,
    },

    user_agent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("AuditLog", auditLogSchema);
