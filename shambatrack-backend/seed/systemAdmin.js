import pool from "../config/mysql.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function seedSystemAdmin() {
  try {
    // Check if system admin already exists
    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      ["superadmin"],
    );

    if (rows.length > 0) {
      console.log("System Admin already seeded.");
      return;
    }

    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash("SuperSecurePassword123", 12);

    await pool.execute(
      `INSERT INTO users 
        (id, name, username, password, role, coop_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        "System Root Administrator",
        "superadmin",
        hashedPassword,
        "system_admin",
        null,
        "active",
      ],
    );

    console.log("System Admin successfully seeded into MySQL!");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}
