import pool from "../config/mysql.js";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";

export async function getPendingPayments(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [payments] = await pool.execute(
      `
  SELECT
    pp.delivery_id,
    pp.amount,
    pp.balance,
    pp.total_paid,
    d.date AS delivery_date,
    f.id AS farmer_id,
    u.name AS farmer_name

  FROM pending_payments pp

  LEFT JOIN deliveries d ON pp.delivery_id = d.id
  LEFT JOIN farmers f ON pp.farmer_id = f.id
  LEFT JOIN users u ON f.user_id = u.id

  WHERE pp.coop_id = ?

  ORDER BY d.date DESC
  `,
      [coopId],
    );

    return res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get pending payments error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getPendingPaymentById(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { deliveryId } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
        pp.*,

        d.date AS delivery_date,
        d.quantity,
        d.unit_price,
        d.total_amount,

        u.name AS farmer_name

      FROM pending_payments pp

      INNER JOIN deliveries d
        ON pp.delivery_id = d.id

      INNER JOIN farmers f
        ON pp.farmer_id = f.id

      INNER JOIN users u
        ON f.user_id = u.id

      WHERE pp.delivery_id = ?
      AND pp.coop_id = ?
      `,
      [deliveryId, coopId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Pending payment not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get pending payment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function processPayment(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const handledBy = req.user.id;

    const { delivery_id, amount, channel } = req.body;

    if (!delivery_id || !amount) {
      return res.status(400).json({
        message: "delivery_id and amount are required",
      });
    }

    // Get pending payment
    const [paymentRows] = await connection.execute(
      `
      SELECT *
      FROM pending_payments
      WHERE delivery_id = ?
      AND coop_id = ?
      `,
      [delivery_id, coopId],
    );

    if (paymentRows.length === 0) {
      return res.status(404).json({
        message: "Pending payment not found",
      });
    }

    const payment = paymentRows[0];

    if (Number(amount) > Number(payment.balance)) {
      return res.status(400).json({
        message: "Payment exceeds remaining balance",
      });
    }

    // Verify coop wallet balance
    const [walletRows] = await connection.execute(
      `
      SELECT *
      FROM cooperative_wallets
      WHERE coop_id = ?
      `,
      [coopId],
    );

    if (walletRows.length === 0) {
      return res.status(404).json({
        message: "Cooperative wallet not found",
      });
    }

    const coopWallet = walletRows[0];

    if (Number(coopWallet.balance) < Number(amount)) {
      return res.status(400).json({
        message: "Insufficient cooperative funds",
      });
    }

    // Update pending payment
    await connection.execute(
      `
      UPDATE pending_payments
      SET
        balance = balance - ?,
        total_paid = total_paid + ?
      WHERE delivery_id = ?
      `,
      [amount, amount, delivery_id],
    );

    // Credit farmer wallet
    await connection.execute(
      `
      UPDATE farmer_wallets
      SET balance = balance + ?
      WHERE farmer_id = ?
      `,
      [amount, payment.farmer_id],
    );

    // Deduct coop wallet
    await connection.execute(
      `
      UPDATE cooperative_wallets
      SET balance = balance - ?
      WHERE coop_id = ?
      `,
      [amount, coopId],
    );

    // Farmer transaction
    const farmerTxnId = uuidv4();

    await connection.execute(
      `
      INSERT INTO farmer_wallet_transactions (
        id,
        wallet_id,
        amount,
        type,
        trans_ref,
        channel,
        coop_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        farmerTxnId,
        payment.farmer_id,
        amount,
        "credit",
        "FWT-" + Date.now(),
        channel || "system",
        coopId,
      ],
    );

    // Coop transaction
    const coopTxnId = uuidv4();

    await connection.execute(
      `
      INSERT INTO cooperative_transactions (
        id,
        coop_id,
        transaction_type,
        amount,
        reference_number,
        user_id_handled_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [coopTxnId, coopId, "payout", amount, "CWT-" + Date.now(), handledBy],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "PROCESS_PAYMENT",
      entity: "payment",
      entity_id: delivery_id,
      details: {
        amount,
        channel,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Payment processed successfully",
      amount,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Process payment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getFarmerWallet(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { farmerId } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
        fw.*,
        u.name AS farmer_name
      FROM farmer_wallets fw
      INNER JOIN farmers f
        ON fw.farmer_id = f.id
      INNER JOIN users u
        ON f.user_id = u.id
      WHERE fw.farmer_id = ?
      AND fw.coop_id = ?
      `,
      [farmerId, coopId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Farmer wallet not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get farmer wallet error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getFarmerWalletTransactions(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { farmerId } = req.params;

    const [transactions] = await pool.execute(
      `
      SELECT *
      FROM farmer_wallet_transactions
      WHERE wallet_id = ?
      AND coop_id = ?
      ORDER BY date DESC
      `,
      [farmerId, coopId],
    );

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get farmer transactions error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getCooperativeWallet(req, res) {
  try {
    const coopId = req.user.coop_id;

    let [rows] = await pool.execute(
      `
      SELECT *
      FROM cooperative_wallets
      WHERE coop_id = ?
      `,
      [coopId],
    );

    if (rows.length === 0) {
      await pool.execute(
        `
        INSERT INTO cooperative_wallets (
          coop_id,
          balance
        )
        VALUES (?, 0)
        `,
        [coopId],
      );

      [rows] = await pool.execute(
        `
        SELECT *
        FROM cooperative_wallets
        WHERE coop_id = ?
        `,
        [coopId],
      );
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get cooperative wallet error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getCooperativeTransactions(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [transactions] = await pool.execute(
      `
      SELECT
        ct.*,
        u.name AS handled_by
      FROM cooperative_transactions ct
      INNER JOIN users u
        ON ct.user_id_handled_by = u.id
      WHERE ct.coop_id = ?
      ORDER BY ct.transaction_date DESC
      `,
      [coopId],
    );

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get cooperative transactions error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

// New wallet summary
export async function walletSummary(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [[wallet]] = await pool.execute(
      `
      SELECT balance
      FROM cooperative_wallets
      WHERE coop_id = ?
      `,
      [coopId],
    );

    const [[pending]] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_pending,
        SUM(balance) AS pending_amount,
        SUM(total_paid) AS total_paid
      FROM pending_payments
      WHERE coop_id = ?
      `,
      [coopId],
    );

    return res.status(200).json({
      wallet_balance: Number(wallet?.balance || 0),
      total_pending: Number(pending?.total_pending || 0),
      pending_amount: Number(pending?.pending_amount || 0),
      total_paid: Number(pending?.total_paid || 0),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function depositToCooperativeWallet(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const userId = req.user.id;

    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Valid amount is required",
      });
    }

    // Update wallet
    await connection.execute(
      `
      UPDATE cooperative_wallets
      SET balance = balance + ?
      WHERE coop_id = ?
      `,
      [amount, coopId],
    );

    // Record transaction
    const transactionId = uuidv4();

    await connection.execute(
      `
      INSERT INTO cooperative_transactions (
        id,
        coop_id,
        transaction_type,
        amount,
        reference_number,
        user_id_handled_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [transactionId, coopId, "deposit", amount, "DEP-" + Date.now(), userId],
    );

    await connection.commit();

    return res.status(200).json({
      message: "Funds deposited successfully",
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
