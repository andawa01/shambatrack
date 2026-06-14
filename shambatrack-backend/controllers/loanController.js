import pool from "../config/mysql.js";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../utils/auditLogger.js";

function generateLoanNumber() {
  return "LN-" + Date.now(); // simple unique number
}

export async function createLoan(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopAdminId = req.user.id;
    const coopId = req.user.coop_id;

    const { farmer_id, loan_type, principal, tenure } = req.body;

    // 1. Validation
    if (!farmer_id || !principal || !due_date) {
      await connection.rollback();
      return res.status(400).json({
        message: "farmer_id, principal, due_date are required",
      });
    }

    if (Number(principal) <= 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Principal must be greater than 0",
      });
    }

    // 2. Verify farmer belongs to this cooperative
    const [farmerRows] = await connection.execute(
      `
      SELECT id
      FROM farmers
      WHERE id = ? AND cooperative_id = ?
      `,
      [farmer_id, coopId],
    );

    if (farmerRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Farmer not found in your cooperative",
      });
    }

    // 3. Get wallet balance
    const [walletRows] = await connection.execute(
      `
      SELECT balance, loan_balance, loan_limit
      FROM farmer_wallets
      WHERE farmer_id = ? AND coop_id = ?
      `,
      [farmer_id, coopId],
    );

    const walletBalance = Number(walletRows[0]?.balance || 0);

    // 4. Get pending payments
    const [pendingRows] = await connection.execute(
      `
      SELECT COALESCE(SUM(balance), 0) AS pending_balance
      FROM pending_payments
      WHERE farmer_id = ? AND coop_id = ?
      `,
      [farmer_id, coopId],
    );

    const pendingBalance = Number(pendingRows[0]?.pending_balance || 0);

    // 5. Get active loans
    const [loanRows] = await connection.execute(
      `
      SELECT COALESCE(SUM(current_balance), 0) AS active_loans
      FROM loans
      WHERE farmer_id = ?
      AND coop_id = ?
      AND status IN ('pending', 'approved', 'disbursed')
      `,
      [farmer_id, coopId],
    );

    const activeLoans = Number(loanRows[0]?.active_loans || 0);

    // 6. Loan limit calculation
    const netWorth = walletBalance + pendingBalance - activeLoans;

    const calculatedLimit = Math.max(Number((netWorth * 0.5).toFixed(2)), 0);

    // 7. Update loan limit in wallet
    await connection.execute(
      `
      UPDATE farmer_wallets
      SET loan_limit = ?
      WHERE farmer_id = ?
      AND coop_id = ?
      `,
      [calculatedLimit, farmer_id, coopId],
    );

    // 8. Validate loan amount against limit
    if (Number(principal) > calculatedLimit) {
      await connection.rollback();

      return res.status(400).json({
        message: `Loan exceeds farmer limit. Available limit is KES ${calculatedLimit.toLocaleString()}`,
        loan_limit: calculatedLimit,
        wallet_balance: walletBalance,
        pending_payments: pendingBalance,
        active_loans: activeLoans,
      });
    }

    // 9. Create loan
    const loanId = uuidv4();
    const loanNumber = generateLoanNumber();

    const today = new Date();

    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + Number(tenure || 1));

    await connection.execute(
      `INSERT INTO loans (
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
  ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        loanId,
        loanNumber,
        farmer_id,
        coopId,
        loan_type || "general",
        principal,
        principal,
        dueDate,
        "pending",
      ],
    );

    // 10. Audit log
    await logAudit({
      user_id: coopAdminId,
      coop_id: coopId,
      user_name: req.user.name,
      action: "CREATE_LOAN",
      entity: "loan",
      entity_id: loanId,
      details: {
        farmer_id,
        loan_type,
        principal,
        due_date,
        loan_limit: calculatedLimit,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    await connection.commit();

    return res.status(201).json({
      message: "Loan created successfully",
      loan: {
        id: loanId,
        loan_number: loanNumber,
        farmer_id,
        principal,
        tenure,
        due_date: dueDate,
        current_balance: principal,
        status: "pending",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getLoanEligibility(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { farmer_id } = req.params;

    // wallet
    const [walletRows] = await pool.execute(
      `SELECT balance FROM farmer_wallets WHERE farmer_id = ? AND coop_id = ?`,
      [farmer_id, coopId],
    );

    const walletBalance = Number(walletRows[0]?.balance || 0);

    // pending payments
    const [pendingRows] = await pool.execute(
      `SELECT COALESCE(SUM(balance),0) AS pending_balance
       FROM pending_payments
       WHERE farmer_id = ? AND coop_id = ?`,
      [farmer_id, coopId],
    );

    const pendingBalance = Number(pendingRows[0].pending_balance || 0);

    // active loans
    const [loanRows] = await pool.execute(
      `SELECT COALESCE(SUM(current_balance),0) AS active_loans
       FROM loans
       WHERE farmer_id = ?
       AND coop_id = ?
       AND status IN ('pending','approved','disbursed')`,
      [farmer_id, coopId],
    );

    const activeLoans = Number(loanRows[0].active_loans || 0);

    // formula
    const loanLimit = Math.max(
      (walletBalance + pendingBalance - activeLoans) * 0.5,
      0,
    );

    return res.json({
      walletBalance,
      pendingBalance,
      activeLoans,
      loanLimit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function approveLoan(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const { id } = req.params;

    // 1. Get loan
    const [loanRows] = await connection.execute(
      `SELECT * FROM loans WHERE id = ? AND coop_id = ?`,
      [id, coopId],
    );

    if (loanRows.length === 0) {
      return res.status(404).json({
        message: "Loan not found in your cooperative",
      });
    }

    const loan = loanRows[0];

    // 2. Check status
    if (loan.status !== "pending") {
      return res.status(400).json({
        message: `Only pending loans can be approved (current: ${loan.status})`,
      });
    }

    // 3. Update status → approved
    await connection.execute(
      `UPDATE loans SET status = 'approved' WHERE id = ?`,
      [id],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "APPROVE_LOAN",
      entity: "loan",
      entity_id: id,
      details: {
        status: "approved",
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Loan approved successfully",
      loan: {
        id,
        status: "approved",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Approve loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function disburseLoan(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const { id } = req.params;

    // 1. Get loan
    const [loanRows] = await connection.execute(
      `SELECT * FROM loans WHERE id = ? AND coop_id = ?`,
      [id, coopId],
    );

    if (loanRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Loan not found in your cooperative",
      });
    }

    const loan = loanRows[0];

    // 2. Must be approved
    if (loan.status !== "approved") {
      await connection.rollback();

      return res.status(400).json({
        message: `Only approved loans can be disbursed (current: ${loan.status})`,
      });
    }

    // 3. Verify farmer wallet
    const [walletRows] = await connection.execute(
      `
      SELECT *
      FROM farmer_wallets
      WHERE farmer_id = ?
      `,
      [loan.farmer_id],
    );

    if (walletRows.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Farmer wallet not found",
      });
    }

    // 4. Verify cooperative wallet
    const [coopWalletRows] = await connection.execute(
      `
      SELECT balance
      FROM cooperative_wallets
      WHERE coop_id = ?
      `,
      [coopId],
    );

    if (coopWalletRows.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Cooperative wallet not found",
      });
    }

    const coopBalance = Number(coopWalletRows[0].balance);

    if (coopBalance < Number(loan.principal)) {
      await connection.rollback();

      return res.status(400).json({
        message: "Insufficient cooperative wallet balance",
      });
    }

    // 5. Update loan status
    await connection.execute(
      `
      UPDATE loans
      SET
        status = 'disbursed',
        date_issued = NOW()
      WHERE id = ?
      `,
      [id],
    );

    // 6. Record loan transaction
    const transactionId = uuidv4();
    const reference = "DIS-" + Date.now();

    await connection.execute(
      `
      INSERT INTO loan_transactions (
        id,
        loan_id,
        farmer_id,
        coop_id,
        transaction_type,
        amount,
        reference_number,
        date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        transactionId,
        loan.id,
        loan.farmer_id,
        coopId,
        "disbursement",
        loan.principal,
        reference,
      ],
    );

    // 7. Debit cooperative wallet
    await connection.execute(
      `
      UPDATE cooperative_wallets
      SET balance = balance - ?
      WHERE coop_id = ?
      `,
      [loan.principal, coopId],
    );

    // 8. Record cooperative transaction
    const coopTransactionId = uuidv4();

    await connection.execute(
      `
      INSERT INTO cooperative_transactions (
        id,
        coop_id,
        transaction_type,
        amount,
        reference_number,
        transaction_date,
        user_id_handled_by
      )
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        coopTransactionId,
        coopId,
        "loan_disbursement",
        loan.principal,
        reference,
        req.user.id,
      ],
    );

    // 9. Credit farmer wallet
    await connection.execute(
      `
      UPDATE farmer_wallets
      SET
        balance = balance + ?,
        loan_balance = loan_balance + ?
      WHERE farmer_id = ?
      `,
      [loan.principal, loan.principal, loan.farmer_id],
    );

    // 10. Record farmer wallet transaction
    const farmerWalletTxnId = uuidv4();

    await connection.execute(
      `
      INSERT INTO farmer_wallet_transactions (
        id,
        wallet_id,
        amount,
        type,
        date,
        trans_ref,
        channel,
        coop_id
      )
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
      `,
      [
        farmerWalletTxnId,
        loan.farmer_id,
        loan.principal,
        "credit",
        reference,
        "Loan Disbursement",
        coopId,
      ],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "DISBURSE_LOAN",
      entity: "loan",
      entity_id: id,
      details: {
        farmer_id: loan.farmer_id,
        amount: loan.principal,
        reference,
        status: "disbursed",
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Loan disbursed successfully",
      transaction: {
        id: transactionId,
        type: "disbursement",
        amount: loan.principal,
        reference,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Disburse loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function repayLoan(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const coopId = req.user.coop_id;
    const { id } = req.params;
    const { amount } = req.body;

    // 1. Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid repayment amount is required",
      });
    }

    // 2. Get loan
    const [loanRows] = await connection.execute(
      `SELECT * FROM loans WHERE id = ? AND coop_id = ?`,
      [id, coopId],
    );

    if (loanRows.length === 0) {
      return res.status(404).json({
        message: "Loan not found in your cooperative",
      });
    }

    const loan = loanRows[0];

    // 3. Must be disbursed
    if (loan.status !== "disbursed") {
      return res.status(400).json({
        message: `Only disbursed loans can be repaid (current: ${loan.status})`,
      });
    }

    // 4. Check repayment amount
    if (amount > loan.current_balance) {
      return res.status(400).json({
        message: "Repayment cannot exceed current balance",
      });
    }

    const newBalance = loan.current_balance - amount;
    const newStatus = newBalance === 0 ? "fully_paid" : "disbursed";

    // 5. Update loan
    await connection.execute(
      `
  UPDATE loans
  SET
    current_balance = ?,
    status = ?
  WHERE id = ?
  `,
      [newBalance, newStatus, id],
    );

    // 6. Record repayment transaction
    const transactionId = uuidv4();
    const reference = "REP-" + Date.now();

    await connection.execute(
      `
  INSERT INTO loan_transactions (
    id,
    loan_id,
    farmer_id,
    coop_id,
    transaction_type,
    amount,
    reference_number,
    date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `,
      [
        transactionId,
        loan.id,
        loan.farmer_id,
        coopId,
        "repayment",
        amount,
        reference,
      ],
    );

    // 7. Update farmer wallet loan balance
    await connection.execute(
      `
  UPDATE farmer_wallets
SET
    balance = GREATEST(balance - ?, 0),
    loan_balance = GREATEST(loan_balance - ?, 0)
WHERE farmer_id = ?
  `,
      [amount, amount, loan.farmer_id],
    );

    // 8. Credit cooperative wallet
    await connection.execute(
      `
  UPDATE cooperative_wallets
  SET balance = balance + ?
  WHERE coop_id = ?
  `,
      [amount, coopId],
    );

    // 9. Record cooperative transaction
    const coopTxnId = uuidv4();

    await connection.execute(
      `
  INSERT INTO cooperative_transactions (
    id,
    coop_id,
    transaction_type,
    amount,
    reference_number,
    transaction_date,
    user_id_handled_by
  )
  VALUES (?, ?, ?, ?, ?, NOW(), ?)
  `,
      [coopTxnId, coopId, "loan_repayment", amount, reference, req.user.id],
    );

    // 10. Record farmer wallet transaction
    const farmerWalletTxnId = uuidv4();

    await connection.execute(
      `
  INSERT INTO farmer_wallet_transactions (
    id,
    wallet_id,
    amount,
    type,
    date,
    trans_ref,
    channel,
    coop_id
  )
  VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
  `,
      [
        farmerWalletTxnId,
        loan.farmer_id,
        amount,
        "debit",
        reference,
        "Loan Repayment",
        coopId,
      ],
    );

    await connection.commit();

    await logAudit({
      user_id: req.user.id,
      coop_id: coopId,
      user_name: req.user.name,
      action: "REPAY_LOAN",
      entity: "loan",
      entity_id: id,
      details: {
        repayment_amount: amount,
        remaining_balance: newBalance,
        status: newStatus,
        reference,
      },
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    });

    return res.status(200).json({
      message: "Repayment successful",
      transaction: {
        id: transactionId,
        type: "repayment",
        amount,
        reference,
      },
      loan: {
        id,
        new_balance: newBalance,
        status: newStatus,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Repay loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    connection.release();
  }
}

export async function getLoans(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [loans] = await pool.execute(
      `
      SELECT
    l.id,
    l.loan_number,
    l.farmer_id,

    u.name AS farmer_name,

    f.phone,

    l.loan_type,
    l.principal,
    l.current_balance,
    l.status,
    l.date_issued,
    l.due_date

FROM loans l

INNER JOIN farmers f
    ON l.farmer_id = f.id

INNER JOIN users u
    ON f.user_id = u.id

WHERE l.coop_id = ?

ORDER BY l.date_issued DESC
      `,
      [coopId],
    );

    return res.status(200).json({
      count: loans.length,
      loans,
    });
  } catch (error) {
    console.error("Get loans error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getLoanById(req, res) {
  try {
    const coopId = req.user.coop_id;
    const { id } = req.params;

    // 1. Loan details
    const [loanRows] = await pool.execute(
      `
      SELECT
      l.id,
       l.loan_number,
       l.farmer_id,

       u.name AS farmer_name,
       f.phone,

       l.loan_type,
       l.principal,
       l.current_balance,
       l.status,
       l.date_issued,
       l.due_date

     FROM loans l

     INNER JOIN farmers f
       ON l.farmer_id = f.id

     INNER JOIN users u
       ON f.user_id = u.id
      `,
      [id, coopId],
    );

    if (loanRows.length === 0) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // 2. Transactions (ledger history)
    const [transactions] = await pool.execute(
      `
      SELECT *
      FROM loan_transactions
      WHERE loan_id = ?
      ORDER BY date DESC
      `,
      [id],
    );

    return res.status(200).json({
      loan: loanRows[0],
      transactions,
    });
  } catch (error) {
    console.error("Get loan by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function loanSummary(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [summary] = await pool.execute(
      `
  SELECT
    COUNT(*) AS total_loans,

    SUM(principal) AS total_issued,

    SUM(
      CASE
        WHEN status IN ('disbursed', 'fully_paid')
        THEN principal
        ELSE 0
      END
    ) AS total_disbursed,

    (
      SELECT COALESCE(SUM(amount), 0)
      FROM loan_transactions lt
      WHERE lt.coop_id = ?
      AND lt.transaction_type = 'repayment'
    ) AS total_repaid,

    SUM(
      CASE
        WHEN status = 'disbursed'
        THEN 1
        ELSE 0
      END
    ) AS active_loans,

    SUM(
      CASE
        WHEN status = 'pending'
        THEN 1
        ELSE 0
      END
    ) AS pending_loans

  FROM loans
  WHERE coop_id = ?
  `,
      [coopId, coopId],
    );

    return res.status(200).json(summary[0]);
  } catch (error) {
    console.error("Loan summary error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getOverdueLoans(req, res) {
  try {
    const coopId = req.user.coop_id;

    const [loans] = await pool.execute(
      `
      SELECT *
      FROM loans
      WHERE coop_id = ?
        AND status = 'disbursed'
        AND due_date < NOW()
      ORDER BY due_date ASC
      `,
      [coopId],
    );

    return res.status(200).json({
      count: loans.length,
      overdue_loans: loans,
    });
  } catch (error) {
    console.error("Overdue loans error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
