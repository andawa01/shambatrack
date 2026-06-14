import pool from "../config/mysql.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";

export async function createFarmer(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { name, username, password, phone, email, nid, location } = req.body;

    if (!name || !username || !password || !phone || !nid) {
      return res.status(400).json({
        message: "name, username, password, phone and nid are required",
      });
    }

    const cooperativeId = req.user.coop_id;

    const [coopRows] = await connection.execute(
      "SELECT id FROM cooperatives WHERE id = ?",
      [cooperativeId],
    );

    if (coopRows.length === 0) {
      return res.status(404).json({
        message: "Cooperative not found",
      });
    }

    // Check username
    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    // Check phone
    const [existingPhone] = await connection.execute(
      "SELECT id FROM farmers WHERE phone = ?",
      [phone],
    );

    if (existingPhone.length > 0) {
      return res.status(409).json({
        message: "Phone already exists",
      });
    }

    // Check NID
    const [existingNid] = await connection.execute(
      "SELECT id FROM farmers WHERE nid = ?",
      [nid],
    );

    if (existingNid.length > 0) {
      return res.status(409).json({
        message: "National ID already exists",
      });
    }

    // Create user
    const userId = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 12);

    await connection.execute(
      `INSERT INTO users
      (id, name, username, password, role, coop_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        username,
        hashedPassword,
        "farmer",
        cooperativeId,
        "active",
      ],
    );

    // Create farmer profile
    const farmerId = uuidv4();

    await connection.execute(
      `INSERT INTO farmers
      (
        id,
        user_id,
        cooperative_id,
        phone,
        email,
        nid,
        location
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        farmerId,
        userId,
        cooperativeId,
        phone,
        email || null,
        nid,
        location || null,
      ],
    );

    // Create farmer wallet
    await connection.execute(
      `
  INSERT INTO farmer_wallets (
    farmer_id,
    balance,
    loan_balance,
    coop_id,
    loan_limit
  )
  VALUES (?, ?, ?, ?, ?)
  `,
      [farmerId, 0, 0, cooperativeId, 0],
    );

    await connection.commit();

    // Audit Log
    await logAudit({
      user_id: req.user.id,
      coop_id: cooperativeId,
      user_name: req.user.name,

      action: "CREATE_FARMER",

      entity: "farmer",

      entity_id: farmerId,

      details: {
        name,
        username,
        phone,
        nid,
      },

      ip_address: req.ip,

      user_agent: req.get("user-agent"),
    });

    return res.status(201).json({
      message: "Farmer created successfully",
      farmer: {
        id: farmerId,
        user_id: userId,
        name,
        username,
        phone,
        cooperative_id: cooperativeId,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getFarmers(req, res) {
  try {
    const cooperativeId = req.user.coop_id;

    const [farmers] = await pool.execute(
      `
      SELECT
          f.id,
          f.phone,
          f.email,
          f.nid,
          f.location,
          f.created_at,

          u.id AS user_id,
          u.name,
          u.username,
          u.status

      FROM farmers f
      INNER JOIN users u
          ON f.user_id = u.id

      WHERE f.cooperative_id = ?

      ORDER BY f.created_at DESC
      `,
      [cooperativeId],
    );

    return res.status(200).json({
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error("Get farmers error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getFarmerById(req, res) {
  try {
    const cooperativeId = req.user.coop_id;
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
          f.id,
          f.user_id,
          f.cooperative_id,
          f.phone,
          f.email,
          f.nid,
          f.location,
          f.created_at,
          f.updated_at,

          u.name,
          u.username,
          u.status

      FROM farmers f
      INNER JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
        AND f.cooperative_id = ?
      LIMIT 1
      `,
      [id, cooperativeId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found in your cooperative",
      });
    }

    return res.status(200).json({
      farmer: rows[0],
    });
  } catch (error) {
    console.error("Get farmer by id error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function updateFarmer(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const cooperativeId = req.user.coop_id;
    const { id } = req.params;

    const { name, phone, email, location, username } = req.body;

    // 1. Check if farmer exists in this coop
    const [existingFarmer] = await connection.execute(
      `
      SELECT f.id, f.user_id
      FROM farmers f
      WHERE f.id = ? AND f.cooperative_id = ?
      `,
      [id, cooperativeId],
    );

    if (existingFarmer.length === 0) {
      return res.status(404).json({
        message: "Farmer not found in your cooperative",
      });
    }

    const farmer = existingFarmer[0];

    // 2. Check phone uniqueness (if updating)
    if (phone) {
      const [phoneCheck] = await connection.execute(
        "SELECT id FROM farmers WHERE phone = ? AND id != ?",
        [phone, id],
      );

      if (phoneCheck.length > 0) {
        return res.status(409).json({
          message: "Phone already exists",
        });
      }
    }

    // 3. Check email uniqueness
    if (email) {
      const [emailCheck] = await connection.execute(
        "SELECT id FROM farmers WHERE email = ? AND id != ?",
        [email, id],
      );

      if (emailCheck.length > 0) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    // 4. Update farmers table
    await connection.execute(
      `
      UPDATE farmers
      SET
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        location = COALESCE(?, location)
      WHERE id = ?
      `,
      [phone, email, location, id],
    );

    // 5. Update users table (name/username)
    await connection.execute(
      `
      UPDATE users
      SET
        name = COALESCE(?, name),
        username = COALESCE(?, username)
      WHERE id = ?
      `,
      [name, username, farmer.user_id],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: cooperativeId,
      user_name: req.user.name,
      action: "UPDATE_FARMER",
      entity: "farmer",
      entity_id: id,
      details: {
        name,
        phone,
        email,
        location,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Farmer updated successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Update farmer error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function deactivateFarmer(req, res) {
  try {
    const cooperativeId = req.user.coop_id;
    const { id } = req.params;

    // 1. Get farmer + user status (status is in users table)
    const [rows] = await pool.execute(
      `
      SELECT 
        f.id,
        f.user_id,
        u.status
      FROM farmers f
      INNER JOIN users u ON f.user_id = u.id
      WHERE f.id = ? 
        AND f.cooperative_id = ?
      LIMIT 1
      `,
      [id, cooperativeId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found in your cooperative",
      });
    }

    const farmer = rows[0];

    // 2. Toggle status
    const newStatus = farmer.status === "inactive" ? "active" : "inactive";

    // 3. Update USERS table (correct place)
    await pool.execute(
      `
      UPDATE users
      SET status = ?
      WHERE id = ?
      `,
      [newStatus, farmer.user_id],
    );

    // 4. Optional audit log
    await logAudit({
      user_id: req.user.id,
      coop_id: cooperativeId,
      action: "DEACTIVATE_FARMER",
      entity: "farmer",
      entity_id: id,
      details: {
        previous_status: farmer.status,
        new_status: newStatus,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: `Farmer ${newStatus === "inactive" ? "deactivated" : "activated"} successfully`,
      status: newStatus,
    });
  } catch (error) {
    console.error("Deactivate farmer error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function recordDelivery(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const recordedBy = req.user.id;

    const { farmer_id, product_id, quantity, quality } = req.body;

    if (!farmer_id || !product_id || !quantity) {
      return res.status(400).json({
        message: "farmer_id, product_id and quantity are required",
      });
    }

    // Verify farmer belongs to coop
    const [farmerRows] = await connection.execute(
      `
      SELECT id
      FROM farmers
      WHERE id = ? AND cooperative_id = ?
      `,
      [farmer_id, coopId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found in your cooperative",
      });
    }

    // Verify product belongs to coop
    const [productRows] = await connection.execute(
      `
      SELECT *
      FROM products
      WHERE id = ? AND coop_id = ?
      `,
      [product_id, coopId],
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = productRows[0];

    const totalAmount = Number(quantity) * Number(product.unit_price);

    const deliveryId = uuidv4();

    await connection.execute(
      `
      INSERT INTO deliveries (
        id,
        product_id,
        farmer_id,
        coop_id,
        quantity,
        unit_price,
        total_amount,
        quality,
        recorded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        deliveryId,
        product_id,
        farmer_id,
        coopId,
        quantity,
        product.unit_price,
        totalAmount,
        quality || null,
        recordedBy,
      ],
    );

    await connection.execute(
      `
  INSERT INTO pending_payments (
    delivery_id,
    farmer_id,
    coop_id,
    amount,
    balance,
    total_paid
  )
  VALUES (?, ?, ?, ?, ?, ?)
  `,
      [deliveryId, farmer_id, coopId, totalAmount, totalAmount, 0],
    );

    await connection.commit();

    await logAudit({
      user_id: recordedBy,
      coop_id: coopId,
      user_name: req.user.name,

      action: "RECORD_DELIVERY",

      entity: "delivery",

      entity_id: deliveryId,

      details: {
        farmer_id,
        product_id,
        quantity,
        quality,
      },

      ip_address: req.ip,

      user_agent: req.get("user-agent"),
    });

    return res.status(201).json({
      message: "Delivery recorded successfully",
      delivery: {
        id: deliveryId,
        quantity,
        unit_price: product.unit_price,
        total_amount: totalAmount,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("FULL MYSQL ERROR:", error.sqlMessage);
    console.error("FULL ERROR OBJECT:", error);

    console.error("Record delivery error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getDeliveries(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [deliveries] = await pool.execute(
      `
      SELECT
        d.id,
        d.quantity,
        d.unit_price,
        d.total_amount,
        d.quality,
        d.date,

        p.name AS product_name,

        u.name AS farmer_name

      FROM deliveries d

      INNER JOIN products p
        ON d.product_id = p.id

      INNER JOIN farmers f
        ON d.farmer_id = f.id

      INNER JOIN users u
        ON f.user_id = u.id

      WHERE d.coop_id = ?

      ORDER BY d.date DESC
      `,
      [coopId],
    );

    return res.status(200).json({
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    console.error("Get deliveries error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getDeliveryById(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
        d.*,

        p.name AS product_name,

        u.name AS farmer_name

      FROM deliveries d

      INNER JOIN products p
        ON d.product_id = p.id

      INNER JOIN farmers f
        ON d.farmer_id = f.id

      INNER JOIN users u
        ON f.user_id = u.id

      WHERE d.id = ?
      AND d.coop_id = ?
      `,
      [id, coopId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Delivery not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get delivery by id error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function updateDelivery(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const { id } = req.params;

    const { farmer_id, product_id, quantity, quality } = req.body;

    const [deliveryRows] = await connection.execute(
      `
      SELECT *
      FROM deliveries
      WHERE id = ?
      AND coop_id = ?
      `,
      [id, coopId],
    );

    if (deliveryRows.length === 0) {
      return res.status(404).json({
        message: "Delivery not found",
      });
    }

    const [productRows] = await connection.execute(
      `
      SELECT *
      FROM products
      WHERE id = ?
      AND coop_id = ?
      `,
      [product_id, coopId],
    );

    if (productRows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = productRows[0];

    const totalAmount = Number(quantity) * Number(product.unit_price);

    await connection.execute(
      `
      UPDATE deliveries
      SET
        farmer_id = ?,
        product_id = ?,
        quantity = ?,
        unit_price = ?,
        total_amount = ?,
        quality = ?
      WHERE id = ?
      `,
      [
        farmer_id,
        product_id,
        quantity,
        product.unit_price,
        totalAmount,
        quality,
        id,
      ],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "UPDATE_DELIVERY",
      entity: "delivery",
      entity_id: id,
      details: {
        farmer_id,
        product_id,
        quantity,
        quality,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Delivery updated successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Update delivery error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getCoopAdminDashboard(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [totalDeliveries] = await pool.execute(
      "SELECT COUNT(*) AS count FROM deliveries WHERE coop_id = ?",
      [coopId],
    );

    const [totalProducts] = await pool.execute(
      "SELECT COUNT(*) AS count FROM products WHERE coop_id = ?",
      [coopId],
    );

    const [totalFarmers] = await pool.execute(
      "SELECT COUNT(*) AS count FROM farmers WHERE cooperative_id = ?",
      [coopId],
    );

    const [cooperatives] = await pool.execute(
      "SELECT COUNT(*) AS count FROM cooperatives",
    );

    const [totalLoans] = await pool.execute(
      "SELECT COUNT(*) AS count FROM loans WHERE coop_id = ?",
      [coopId],
    );

    const [pendingLoans] = await pool.execute(
      "SELECT COUNT(*) AS count FROM loans WHERE coop_id = ? AND status = 'pending'",
      [coopId],
    );

    const [coopInfo] = await pool.execute(
      "SELECT name, email FROM cooperatives WHERE id = ?",
      [coopId],
    );

    return res.status(200).json({
      totalDeliveries: totalDeliveries[0].count,
      totalProducts: totalProducts[0].count,
      totalCooperatives: cooperatives[0].count,
      totalFarmers: totalFarmers[0].count,
      totalLoans: totalLoans[0].count,
      pendingLoans: pendingLoans[0].count,
      cooperative: coopInfo[0] || null,
    });
  } catch (error) {
    console.error("Get coop admin dashboard error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}
