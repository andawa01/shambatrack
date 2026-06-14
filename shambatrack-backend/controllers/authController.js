import pool from "../config/mysql.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logAudit } from "../utils/auditLogger.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ? LIMIT 1",
      [username],
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        coop_id: user.coop_id,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Audit Log
    await logAudit({
      user_id: user.id,
      coop_id: user.coop_id,
      user_name: user.name,

      action: "LOGIN",

      entity: "user",

      entity_id: user.id,

      details: {
        username: user.username,
        user_name: user.name,
        role: user.role,
      },

      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
}
