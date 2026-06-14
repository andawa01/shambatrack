import express from "express";
import pool from "../config/mysql.js";

const router = express.Router();

router.get("/mysql", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    res.json({
      success: true,
      message: "MySQL Connected Successfully",
    });

    connection.release();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
