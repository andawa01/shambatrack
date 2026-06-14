import AuditLog from "../models/AuditLog.js";

export async function logAudit({
  user_id,
  user_name,
  coop_id,
  action,
  entity,
  entity_id,
  details = {},
  ip_address = null,
  user_agent = null,
}) {
  try {
    await AuditLog.create({
      user_id,
      user_name,
      coop_id,
      action,
      entity,
      entity_id,
      details,
      ip_address,
      user_agent,
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
