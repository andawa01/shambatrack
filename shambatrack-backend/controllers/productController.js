import pool from "../config/mysql.js";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";

export async function createProduct(req, res) {
  try {
    const coopId = req.user.coop_id;

    const { name, unit, unit_price, type } = req.body;

    if (!name || !unit || !unit_price) {
      return res.status(400).json({
        message: "name, unit and unit_price are required",
      });
    }

    const id = uuidv4();

    await pool.execute(
      `
      INSERT INTO products (
        id,
        name,
        unit,
        unit_price,
        coop_id,
        type
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id, name, unit, unit_price, coopId, type || null],
    );

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "CREATE_PRODUCT",
      entity: "product",
      entity_id: id,
      details: {
        name,
        unit,
        unit_price,
        type,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(201).json({
      message: "Product created successfully",
      product: {
        id,
        name,
        unit,
        unit_price,
        type,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getProducts(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [products] = await pool.execute(
      `
      SELECT *
      FROM products
      WHERE coop_id = ?
      ORDER BY name ASC
      `,
      [coopId],
    );

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getProductById(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM products
      WHERE id = ?
      AND coop_id = ?
      `,
      [id, coopId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { id } = req.params;

    const { name, unit, unit_price, type } = req.body;

    const [product] = await pool.execute(
      `
      SELECT id
      FROM products
      WHERE id = ?
      AND coop_id = ?
      `,
      [id, coopId],
    );

    if (product.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await pool.execute(
      `
      UPDATE products
      SET
        name = ?,
        unit = ?,
        unit_price = ?,
        type = ?
      WHERE id = ?
      `,
      [name, unit, unit_price, type, id],
    );

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "UPDATE_PRODUCT",
      entity: "product",
      entity_id: id,
      details: {
        name,
        unit,
        unit_price,
        type,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function deactivateProduct(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { id } = req.params;

    const [product] = await pool.execute(
      `
      SELECT id, status
      FROM products
      WHERE id = ?
      AND coop_id = ?
      `,
      [id, coopId],
    );

    if (product.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const currentStatus = product[0].status;

    const newStatus = currentStatus === "inactive" ? "active" : "inactive";

    await pool.execute(
      `
      UPDATE products
      SET status = ?
      WHERE id = ?
      `,
      [newStatus, id],
    );

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "UPDATE_PRODUCT_STATUS",
      entity: "product",
      entity_id: id,
      details: {
        status: newStatus,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: `Product ${
        newStatus === "inactive" ? "deactivated" : "activated"
      } successfully`,
      status: newStatus,
    });
  } catch (error) {
    console.error("Deactivate product error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}
