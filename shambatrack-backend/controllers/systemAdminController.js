import pool from "../config/mysql.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { logAudit } from "../utils/auditLogger.js";
import { AUDIT_ACTIONS } from "../utils/auditActions.js";

export async function createCooperative(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { name, email, contact } = req.body;

    // Validation
    if (!name || !email || !contact) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check duplicate email
    const [existingEmail] = await connection.execute(
      "SELECT id FROM cooperatives WHERE email = ?",
      [email],
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    // Create cooperative
    const id = uuidv4();

    await connection.execute(
      `
      INSERT INTO cooperatives (
        id,
        name,
        email,
        contact
      )
      VALUES (?, ?, ?, ?)
      `,
      [id, name, email, contact],
    );

    // Create cooperative wallet
    await connection.execute(
      `
      INSERT INTO cooperative_wallets (
        coop_id,
        balance
      )
      VALUES (?, ?)
      `,
      [id, 0],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: id,
      user_name: req.user.name,

      action: AUDIT_ACTIONS.CREATE_COOPERATIVE,

      entity: "cooperative",

      entity_id: id,

      details: {
        name,
        email,
        contact,
      },

      ip_address: req.ip,

      user_agent: req.get("user-agent"),
    });

    return res.status(201).json({
      message: "Cooperative created successfully",
      cooperative: {
        id,
        name,
        email,
        contact,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create cooperative error:", error);

    return res.status(500).json({
      message: "Server error while creating cooperative",
    });
  } finally {
    connection.release();
  }
}

export async function createCoopAdmin(req, res) {
  try {
    const { name, username, password, coop_id } = req.body;

    // 1. Validation
    if (!name || !username || !password || !coop_id) {
      return res.status(400).json({
        message: "name, username, password, and coop_id are required",
      });
    }

    // 2. Check if coop exists
    const [coop] = await pool.execute(
      "SELECT id FROM cooperatives WHERE id = ?",
      [coop_id],
    );

    if (coop.length === 0) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    // 3. Check username uniqueness
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const id = uuidv4();

    // 5. Insert coop admin
    await pool.execute(
      `INSERT INTO users (id, name, username, password, role, coop_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, username, hashedPassword, "coop_admin", coop_id, "active"],
    );

    await logAudit({
      user_id: req.user.id,
      coop_id,
      user_name: req.user.name,

      action: AUDIT_ACTIONS.CREATE_COOP_ADMIN,

      entity: "user",

      entity_id: id,

      details: {
        name,
        username,
        role: "coop_admin",
      },

      ip_address: req.ip,

      user_agent: req.get("user-agent"),
    });

    return res.status(201).json({
      message: "Coop admin created successfully",
      user: {
        id,
        name,
        username,
        role: "coop_admin",
        coop_id,
      },
    });
  } catch (error) {
    console.error("Create coop admin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const getSystemDashboardStats = async (req, res) => {
  try {
    const [[coops]] = await pool.query(
      "SELECT COUNT(*) AS totalCooperatives FROM cooperatives",
    );

    const [[users]] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users",
    );

    const [[loans]] = await pool.query(
      "SELECT COUNT(*) AS activeLoans FROM loans",
    );

    res.json({
      totalCooperatives: coops.totalCooperatives,
      totalUsers: users.totalUsers,
      activeLoans: loans.activeLoans,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export async function getCooperatives(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        id,
        name,
        email,
        contact,
        created_at
      FROM cooperatives
      ORDER BY created_at DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch cooperatives",
    });
  }
}

export async function getCoopAdmins(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.id,
        u.name,
        u.username,
        u.status,
        u.created_at,
        c.name AS cooperative_name
      FROM users u
      LEFT JOIN cooperatives c
        ON u.coop_id = c.id
      WHERE u.role = 'coop_admin'
      ORDER BY u.created_at DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch coop admins",
    });
  }
}

export async function getCooperativeOptions(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name
      FROM cooperatives
      ORDER BY name ASC
    `);

    return res.json(rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch cooperatives",
    });
  }
}
