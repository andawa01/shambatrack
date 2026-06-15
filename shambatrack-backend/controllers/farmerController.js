import pool from "../config/mysql.js";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";
import Notification from "../models/Notification.js";
import NotificationRecipient from "../models/NotificationRecipient.js";

function generateLoanNumber() {
  return `LN-${Date.now()}`;
}

export async function applyLoan(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { principal, loan_type, tenure } = req.body;

    // Validation
    if (!principal || !tenure) {
      await connection.rollback();

      return res.status(400).json({
        message: "principal and tenure are required",
      });
    }

    if (Number(principal) <= 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Principal must be greater than 0",
      });
    }

    if (Number(tenure) <= 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Tenure must be greater than 0",
      });
    }

    // Get farmer profile
    const [farmerRows] = await connection.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id],
    );

    if (farmerRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    const farmerId = farmerRows[0].id;
    const coopId = req.user.coop_id;

    // Get wallet
    const [walletRows] = await connection.execute(
      `
      SELECT
        balance,
        loan_balance,
        loan_limit
      FROM farmer_wallets
      WHERE farmer_id = ?
      AND coop_id = ?
      `,
      [farmerId, coopId],
    );

    if (walletRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Farmer wallet not found",
      });
    }

    const walletBalance = Number(walletRows[0].balance || 0);

    // Get pending payments
    const [pendingRows] = await connection.execute(
      `
      SELECT COALESCE(SUM(balance), 0) AS pending_balance
      FROM pending_payments
      WHERE farmer_id = ?
      AND coop_id = ?
      `,
      [farmerId, coopId],
    );

    const pendingBalance = Number(pendingRows[0]?.pending_balance || 0);

    // Get active loans
    const [activeLoanRows] = await connection.execute(
      `
      SELECT COALESCE(SUM(current_balance), 0) AS active_loans
      FROM loans
      WHERE farmer_id = ?
      AND coop_id = ?
      AND status IN ('pending', 'approved', 'disbursed')
      `,
      [farmerId, coopId],
    );

    const activeLoans = Number(activeLoanRows[0]?.active_loans || 0);

    // Calculate loan limit
    const netWorth = walletBalance + pendingBalance - activeLoans;

    const calculatedLimit = Math.max(Number((netWorth * 0.5).toFixed(2)), 0);

    // Update wallet loan limit
    await connection.execute(
      `
      UPDATE farmer_wallets
      SET loan_limit = ?
      WHERE farmer_id = ?
      AND coop_id = ?
      `,
      [calculatedLimit, farmerId, coopId],
    );

    // Validate requested amount
    if (Number(principal) > calculatedLimit) {
      await connection.rollback();

      return res.status(400).json({
        message: `Loan exceeds your limit. Available limit is KES ${calculatedLimit.toLocaleString()}`,
        loan_limit: calculatedLimit,
        wallet_balance: walletBalance,
        pending_payments: pendingBalance,
        active_loans: activeLoans,
      });
    }

    // Generate loan details
    const loanId = uuidv4();
    const loanNumber = generateLoanNumber();

    const dateIssued = new Date();

    const dueDate = new Date(dateIssued);
    dueDate.setMonth(dueDate.getMonth() + Number(tenure));

    // Create loan
    await connection.execute(
      `
      INSERT INTO loans (
        id,
        loan_number,
        farmer_id,
        coop_id,
        loan_type,
        principal,
        current_balance,
        date_issued,
        due_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
      `,
      [
        loanId,
        loanNumber,
        farmerId,
        coopId,
        loan_type || "general",
        principal,
        principal,
        dueDate,
        "pending",
      ],
    );

    // Audit log
    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "CREATE_LOAN",
      entity: "loan",
      entity_id: loanId,
      details: {
        farmer_id: farmerId,
        principal,
        loan_type,
        tenure,
        loan_limit: calculatedLimit,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    await connection.commit();

    return res.status(201).json({
      message: "Loan application submitted successfully",
      loan: {
        id: loanId,
        loan_number: loanNumber,
        principal,
        current_balance: principal,
        date_issued: dateIssued,
        due_date: dueDate,
        status: "pending",
      },
      eligibility: {
        loan_limit: calculatedLimit,
        wallet_balance: walletBalance,
        pending_payments: pendingBalance,
        active_loans: activeLoans,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Apply loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getMyLoans(req, res) {
  try {
    const userId = req.user.id;

    const [farmerRows] = await pool.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const farmerId = farmerRows[0].id;

    const [loans] = await pool.execute(
      `
      SELECT *
      FROM loans
      WHERE farmer_id = ?
      ORDER BY date_issued DESC
      `,
      [farmerId],
    );

    return res.status(200).json(loans);
  } catch (error) {
    console.error("Get loans error:", error);

    return res.status(500).json({
      message: "Error fetching loans",
    });
  }
}

export async function getAvailableProducts(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE coop_id = ?`,
      [req.user.coop_id],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
}

export async function getMyNotifications(req, res) {
  try {
    const notifications = await Notification.find({
      coop_id: req.user.coop_id,
      $or: [
        { farmer_id: req.user.id },
        { farmer_id: null }, // broadcast messages
      ],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      {
        _id: id,
        coop_id: req.user.coop_id,
      },
      {
        is_read: true,
      },
    );

    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
}

export async function getFarmerDashboard(req, res) {
  try {
    const userId = req.user.id;

    // Get farmer record
    const [farmerRows] = await pool.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const farmerId = farmerRows[0].id;

    // DELIVERY SUMMARY
    const [deliveryStats] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_deliveries,
        COALESCE(SUM(total_amount),0) AS total_earnings
      FROM deliveries
      WHERE farmer_id = ?
      `,
      [farmerId],
    );

    // PENDING PAYMENTS
    const [pendingStats] = await pool.execute(
      `
      SELECT
        COALESCE(SUM(balance),0) AS pending_amount
      FROM pending_payments
      WHERE farmer_id = ?
      `,
      [farmerId],
    );

    // WALLET
    const [walletRows] = await pool.execute(
      `
      SELECT
        balance,
        loan_balance,
        loan_limit
      FROM farmer_wallets
      WHERE farmer_id = ?
      LIMIT 1
      `,
      [farmerId],
    );

    const wallet =
      walletRows.length > 0
        ? walletRows[0]
        : {
            balance: 0,
            loan_balance: 0,
            loan_limit: 0,
          };

    // LOANS
    const [loanRows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_loans,
        COALESCE(SUM(principal),0) AS total_loan_amount,
        COALESCE(SUM(current_balance),0) AS outstanding_loans
      FROM loans
      WHERE farmer_id = ?
      `,
      [farmerId],
    );

    // RECENT DELIVERIES
    const [recentDeliveries] = await pool.execute(
      `
      SELECT
        d.id,
        d.quantity,
        d.total_amount,
        d.date,
        p.name AS product_name
      FROM deliveries d
      INNER JOIN products p
        ON p.id = d.product_id
      WHERE d.farmer_id = ?
      ORDER BY d.date DESC
      LIMIT 5
      `,
      [farmerId],
    );

    const [monthlyEarnings] = await pool.execute(
      `
  SELECT
    DATE_FORMAT(date, '%b') AS month,
    COALESCE(SUM(total_amount),0) AS earnings
  FROM deliveries
  WHERE farmer_id = ?
    AND YEAR(date) = YEAR(CURDATE())
  GROUP BY MONTH(date)
  ORDER BY MONTH(date)
  `,
      [farmerId],
    );

    const [productPerformance] = await pool.execute(
      `
  SELECT
    p.name AS product,
    COALESCE(SUM(d.quantity),0) AS quantity
  FROM deliveries d
  JOIN products p ON p.id = d.product_id
  WHERE d.farmer_id = ?
  GROUP BY p.id,p.name
  ORDER BY quantity DESC
  `,
      [farmerId],
    );

    const walletBreakdown = [
      {
        name: "Wallet",
        value: Number(wallet.balance || 0),
      },
      {
        name: "Loan",
        value: Number(wallet.loan_balance || 0),
      },
    ];

    // NOTIFICATIONS
    const notifications = await NotificationRecipient.find({
      farmer_id: farmerId,
    })
      .populate("notification_id")
      .sort({ createdAt: -1 })
      .limit(5);

    const unreadNotifications = await NotificationRecipient.countDocuments({
      farmer_id: farmerId,
      is_read: false,
    });

    return res.json({
      summary: {
        total_deliveries: Number(deliveryStats[0]?.total_deliveries || 0),

        total_earnings: Number(deliveryStats[0]?.total_earnings || 0),

        pending_payments: Number(pendingStats[0]?.pending_amount || 0),

        monthlyEarnings,

        productPerformance,

        walletBreakdown,

        wallet_balance: Number(wallet.balance || 0),

        loan_balance: Number(wallet.loan_balance || 0),

        loan_limit: Number(wallet.loan_limit || 0),

        total_loans: Number(loanRows[0]?.total_loans || 0),

        outstanding_loans: Number(loanRows[0]?.outstanding_loans || 0),
      },

      recentDeliveries,

      notifications,

      unreadNotifications,
    });
  } catch (error) {
    console.error("Farmer dashboard error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getFarmerDeliveries(req, res) {
  try {
    const userId = req.user.id;

    const [farmerRows] = await pool.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const farmerId = farmerRows[0].id;

    const [deliveries] = await pool.execute(
      `
  SELECT
    d.id,
    d.date,
    d.quantity,
    d.unit_price,
    d.total_amount,
    d.quality,
    p.name AS product_name
  FROM deliveries d
  INNER JOIN products p
    ON p.id = d.product_id
  WHERE d.farmer_id = ?
  ORDER BY d.date DESC
  `,
      [farmerId],
    );

    const [stats] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_deliveries,
        COALESCE(SUM(quantity),0) AS total_quantity,
        COALESCE(SUM(total_amount),0) AS total_earnings
      FROM deliveries
      WHERE farmer_id = ?
      `,
      [farmerId],
    );

    return res.json({
      summary: stats[0],
      deliveries,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to load deliveries",
    });
  }
}

export async function getFarmerPayments(req, res) {
  try {
    const userId = req.user?.id;

    // Get farmer record
    const [farmerRows] = await pool.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const farmerId = farmerRows[0].id;

    // Summary
    const [summaryRows] = await pool.execute(
      `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END),0) AS total_received,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount END),0) AS total_pending,
        COUNT(*) AS total_transactions
      FROM payments
      WHERE farmer_id = ?
      `,
      [farmerId],
    );

    // Payment history
    const [payments] = await pool.execute(
      `
      SELECT
        id,
        amount,
        payment_method,
        reference_no,
        status,
        payment_date
      FROM payments
      WHERE farmer_id = ?
      ORDER BY payment_date DESC
      `,
      [farmerId],
    );

    return res.json({
      summary: summaryRows[0],
      payments,
    });
  } catch (error) {
    console.error("Farmer payments error:", error);
    return res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
}

export async function getMyWallet(req, res) {
  try {
    const userId = req.user.id;

    // Get farmer record
    const [farmerRows] = await pool.execute(
      `
      SELECT
        f.id,
        u.name
      FROM farmers f
      INNER JOIN users u
        ON u.id = f.user_id
      WHERE f.user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const farmer = farmerRows[0];

    // Wallet
    const [walletRows] = await pool.execute(
      `
      SELECT
        farmer_id,
        balance,
        loan_balance,
        loan_limit,
        coop_id
      FROM farmer_wallets
      WHERE farmer_id = ?
      LIMIT 1
      `,
      [farmer.id],
    );

    const wallet =
      walletRows.length > 0
        ? walletRows[0]
        : {
            farmer_id: farmer.id,
            balance: 0,
            loan_balance: 0,
            loan_limit: 0,
          };

    // Transactions
    const [transactions] = await pool.execute(
      `
      SELECT
        id,
        amount,
        type,
        date,
        trans_ref,
        channel
      FROM farmer_wallet_transactions
      WHERE wallet_id = ?
      ORDER BY date DESC
      LIMIT 20
      `,
      [farmer.id],
    );

    return res.status(200).json({
      farmer: {
        id: farmer.id,
        name: farmer.name,
      },

      wallet,

      transactions,

      summary: {
        total_transactions: transactions.length,

        total_credits: transactions
          .filter((t) => t.type === "credit")
          .reduce((sum, t) => sum + Number(t.amount), 0),

        total_debits: transactions
          .filter((t) => t.type === "debit")
          .reduce((sum, t) => sum + Number(t.amount), 0),
      },
    });
  } catch (error) {
    console.error("Get wallet error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getFarmerLoanEligibility(req, res) {
  try {
    const userId = req.user.id;
    const coopId = req.user.coop_id;

    const [farmerRows] = await pool.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    const farmerId = farmerRows[0].id;

    // Wallet balance
    const [walletRows] = await pool.execute(
      `
      SELECT COALESCE(balance,0) AS balance
      FROM farmer_wallets
      WHERE farmer_id = ?
      AND coop_id = ?
      `,
      [farmerId, coopId],
    );

    const walletBalance = Number(walletRows[0]?.balance || 0);

    // Pending payments
    const [pendingRows] = await pool.execute(
      `
      SELECT COALESCE(SUM(balance),0) AS pending_balance
      FROM pending_payments
      WHERE farmer_id = ?
      AND coop_id = ?
      `,
      [farmerId, coopId],
    );

    const pendingBalance = Number(pendingRows[0]?.pending_balance || 0);

    // Active loans
    const [loanRows] = await pool.execute(
      `
      SELECT COALESCE(SUM(current_balance),0) AS active_loans
      FROM loans
      WHERE farmer_id = ?
      AND coop_id = ?
      AND status IN ('pending','approved','disbursed')
      `,
      [farmerId, coopId],
    );

    const activeLoans = Number(loanRows[0]?.active_loans || 0);

    // Eligibility formula
    const loanLimit = Math.max(
      (walletBalance + pendingBalance - activeLoans) * 0.5,
      0,
    );

    return res.status(200).json({
      walletBalance,
      pendingBalance,
      activeLoans,
      loanLimit,
    });
  } catch (error) {
    console.error("Loan eligibility error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

// LOAN SUMMARY
export async function getFarmerLoanSummary(req, res) {
  try {
    const userId = req.user.id;

    const [farmerRows] = await pool.execute(
      `
      SELECT id
      FROM farmers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId],
    );

    if (farmerRows.length === 0) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const farmerId = farmerRows[0].id;

    const [[summary]] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_loans,
        COALESCE(SUM(principal),0) AS total_borrowed,
        COALESCE(SUM(current_balance),0) AS outstanding_balance,
        SUM(
          CASE
            WHEN status IN ('approved','disbursed')
            THEN 1
            ELSE 0
          END
        ) AS active_loans
      FROM loans
      WHERE farmer_id = ?
      `,
      [farmerId],
    );

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Loan summary error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

// LOAN DETAILS
export async function getFarmerLoanDetails(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Loan ID is required",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM loans
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Loan details error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

// LOAN TRANSACTIONS

export async function getFarmerLoanTransactions(req, res) {
  try {
    const { loanId } = req.params;

    const [transactions] = await pool.execute(
      `
      SELECT *
      FROM loan_transactions
      WHERE loan_id = ?
      ORDER BY date DESC
      `,
      [loanId],
    );

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Loan transactions error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getFarmerProfile(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `
      SELECT 
        u.id AS user_id,
        u.name,
        u.username,
        u.role,

        f.id AS farmer_id,
        f.phone,

        f.cooperative_id,
        c.name AS cooperative_name,

        w.balance AS wallet_balance,
        w.loan_balance,
        w.loan_limit

      FROM users u
      INNER JOIN farmers f ON f.user_id = u.id
      LEFT JOIN cooperatives c ON c.id = f.cooperative_id
      LEFT JOIN farmer_wallets w ON w.farmer_id = f.id

      WHERE u.id = ?
      `,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("getFarmerProfile error:", error);
    return res.status(500).json({
      message: "Error fetching farmer profile",
    });
  }
}
