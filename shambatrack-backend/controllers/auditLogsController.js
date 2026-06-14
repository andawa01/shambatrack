import AuditLog from "../models/AuditLog.js";

export async function getAuditLogs(req, res) {
  try {
    const { action, entity } = req.query;

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (entity) {
      filter.entity = entity;
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);

    return res.json(logs);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch audit logs",
    });
  }
}

export async function getCoopAuditLogs(req, res) {
  try {
    const coopId = req.user.coop_id;

    const { action, entity } = req.query;

    const filter = {
      coop_id: coopId,
    };

    if (action) {
      filter.action = action;
    }

    if (entity) {
      filter.entity = entity;
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);

    return res.json(logs);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch audit logs",
    });
  }
}

export async function getFarmerAuditLogs(req, res) {
  try {
    const userId = req.user.id;

    const logs = await AuditLog.find({
      user_id: userId,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch farmer audit logs",
    });
  }
}
