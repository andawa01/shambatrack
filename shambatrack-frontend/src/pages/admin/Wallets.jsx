import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Wallets = () => {
  const [summary, setSummary] = useState({});
  const [wallet, setWallet] = useState({});
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    delivery_id: "",
    amount: "",
    channel: "cash",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [summaryRes, walletRes, paymentsRes, transactionsRes] =
        await Promise.all([
          api.get("/payments/summary"),
          api.get("/payments/coop-wallet"),
          api.get("/payments/pending"),
          api.get("/payments/coop-transactions"),
        ]);

      setSummary(summaryRes.data);
      setWallet(walletRes.data);
      setPayments(paymentsRes.data.payments || []);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      toast.error("Failed to sync wallet account data logs");
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const openPaymentModal = (payment) => {
    setPaymentForm({
      delivery_id: payment.delivery_id,
      amount: payment.balance, // Autofill total remaining balance automatically
      channel: "cash",
    });
    setShowModal(true);
  };

  const processPayment = async (e) => {
    e.preventDefault();

    const selected = payments.find(
      (p) => p.delivery_id === paymentForm.delivery_id,
    );

    if (!selected) {
      return toast.error("Invalid payment selected");
    }

    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      return toast.error("Amount must be greater than 0");
    }

    if (Number(paymentForm.amount) > Number(selected.balance)) {
      return toast.error(
        "Requested transaction cannot exceed remaining balance owing",
      );
    }

    if (Number(paymentForm.amount) > Number(wallet.balance || 0)) {
      return toast.error(
        "Insufficient cooperative pool wallet balance funds available",
      );
    }

    const request = api.post("/payments/process", paymentForm);

    toast.promise(request, {
      loading: "Transmitting vault settlement funds...",
      success: () => {
        setShowModal(false);
        setPaymentForm({ delivery_id: "", amount: "", channel: "cash" });
        fetchData();
        return "Farmer settlement transaction updated successfully";
      },
      error: (err) =>
        err.response?.data?.message || "Failed to finalize payout",
    });
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0)
      return toast.error("Specify absolute value");

    try {
      setIsDepositing(true);
      await api.post("/payments/deposit", { amount: depositAmount });

      toast.success("Liquidity capital successfully injected into wallet pool");
      setDepositAmount("");
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Deposit transaction aborted",
      );
    } finally {
      setIsDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Syncing cooperative finance ledgers...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Header Panel Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Financial Vault & Wallets
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Disburse payouts to crop suppliers, add operational cash liquidity,
            and monitor system transaction audits.
          </p>
        </div>

        {/* Deposit Inline Action Block Form */}
        <form
          onSubmit={handleDeposit}
          className="w-full lg:w-auto flex items-center justify-between sm:justify-start gap-2 bg-slate-50 border border-slate-200/60 rounded-xl p-1.5 pl-3.5"
        >
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 whitespace-nowrap">
              Top Up
            </div>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="KES 0.00"
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none w-full sm:w-32"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isDepositing}
            className="bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-slate-900 transition shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            {isDepositing ? "Loading..." : "Deposit"}
          </button>
        </form>
      </div>

      {/* Analytics Summary Value Matrix Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 sm:p-5 rounded-2xl shadow-md border border-emerald-600 text-white relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 opacity-90 block mb-1">
            Available Reserve Balance
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            KES{" "}
            {Number(wallet.balance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
          <div className="absolute right-2 bottom-0 text-white/5 font-black text-4xl sm:text-5xl select-none translate-y-2">
            CASH
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pending Invoice Accounts
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {summary.total_pending || 0} Records
          </h2>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Outstanding Liability
          </span>
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              Number(summary.pending_amount || 0) > Number(wallet.balance || 0)
                ? "text-rose-600 animate-pulse"
                : "text-amber-600"
            }`}
          >
            KES{" "}
            {Number(summary.pending_amount || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Historical Settled Aggregate
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">
            KES{" "}
            {Number(summary.total_paid || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
        </div>
      </div>

      {/* Main Feature: Farmers Pending Settlement Invoices Ledger */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">
              Awaiting Settlement Payout Queue
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Process pending payments for recorded farmer deliveries here.
            </p>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 inline-block">
            Action Required
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-6 py-4">Farmer Beneficiary</th>
                <th className="px-6 py-4">Total Value Evaluated</th>
                <th className="px-6 py-4">Previously Settled</th>
                <th className="px-6 py-4 text-emerald-600">Net Due Balance</th>
                <th className="px-6 py-4">Intake Date</th>
                <th className="px-6 py-4 text-right">Settlement Command</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
              {payments.length === 0 ? (
                <tr className="flex w-full justify-center text-center">
                  <td
                    colSpan="6"
                    className="text-center py-16 text-slate-400 font-medium w-full"
                  >
                    <p className="text-sm">
                      Excellent! No outstanding delivery debts logged inside
                      index backlog.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const isInsufficient =
                    Number(payment.balance) > Number(wallet.balance || 0);
                  return (
                    <tr
                      key={payment.delivery_id}
                      className={`hover:bg-slate-50/50 transition duration-150 flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100 ${
                        isInsufficient ? "bg-rose-50/20" : ""
                      }`}
                    >
                      {/* Farmer Beneficiary */}
                      <td className="px-0 md:px-6 md:py-4 font-bold text-slate-800 text-sm md:text-base">
                        <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                          Farmer Beneficiary:
                        </span>
                        {payment.farmer_name}
                      </td>

                      {/* Total Value Evaluated */}
                      <td className="px-0 md:px-6 md:py-4 font-medium text-slate-500">
                        <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                          Total Value:
                        </span>
                        KES{" "}
                        {Number(payment.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Previously Settled */}
                      <td className="px-0 md:px-6 md:py-4 text-slate-400">
                        <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                          Previously Settled:
                        </span>
                        KES{" "}
                        {Number(payment.total_paid).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      {/* Net Due Balance */}
                      <td className="px-0 md:px-6 md:py-4 font-black text-slate-900">
                        <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                          Net Due Balance:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold inline-block ${isInsufficient ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}
                        >
                          KES{" "}
                          {Number(payment.balance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Intake Date */}
                      <td className="px-0 md:px-6 md:py-4 text-xs font-semibold text-slate-400">
                        <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                          Intake Date:
                        </span>
                        {new Date(payment.delivery_date).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>

                      {/* Settlement Command */}
                      <td className="px-0 md:px-6 md:py-4 text-left md:text-right whitespace-nowrap mt-2 md:mt-0">
                        <button
                          onClick={() => openPaymentModal(payment)}
                          className={`w-full md:w-auto text-center font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl border transition shadow-sm ${
                            isInsufficient
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700"
                          }`}
                          disabled={isInsufficient}
                          title={
                            isInsufficient
                              ? "Deposit more funds into the co-op balance to process this payment"
                              : "Pay farmer now"
                          }
                        >
                          {isInsufficient
                            ? "Low Co-op Balance"
                            : "Disburse Pay"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Sub-ledger Auditing Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-sm">
            System Operations Ledger Audits
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-6 py-4">Transaction Scope</th>
                <th className="px-6 py-4">Transferred Gross</th>
                <th className="px-6 py-4">Audit Reference ID</th>
                <th className="px-6 py-4">System Operator</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80 text-xs font-medium text-slate-500 flex flex-col md:table-row-group">
              {transactions.map((tx) => {
                const isDeposit =
                  tx.transaction_type?.toLowerCase() === "deposit";
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/30 transition flex flex-col md:table-row p-4 md:p-0 gap-1.5 md:gap-0 border-b md:border-b-0 border-slate-100"
                  >
                    {/* Transaction Scope */}
                    <td className="px-0 md:px-6 md:py-4 capitalize font-bold text-slate-700 text-sm md:text-xs">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Transaction Scope:
                      </span>
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${isDeposit ? "bg-green-500" : "bg-blue-500"}`}
                      ></span>
                      {tx.transaction_type}
                    </td>

                    {/* Transferred Gross */}
                    <td
                      className={`px-0 md:px-6 md:py-4 font-bold text-sm ${isDeposit ? "text-green-600" : "text-slate-800"}`}
                    >
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5 text-slate-400">
                        Transferred Gross:
                      </span>
                      {isDeposit ? "+" : "-"} KES{" "}
                      {Number(tx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Audit Reference ID */}
                    <td className="px-0 md:px-6 md:py-4 font-mono text-slate-400">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Audit Reference ID:
                      </span>
                      {tx.reference_number || `TX-${tx.id}`}
                    </td>

                    {/* System Operator */}
                    <td className="px-0 md:px-6 md:py-4 text-slate-600">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        System Operator:
                      </span>
                      {tx.handled_by || "System Automated"}
                    </td>

                    {/* Timestamp */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-right text-slate-400 font-semibold">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Timestamp:
                      </span>
                      {new Date(tx.transaction_date).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible Payment Action Sheet Overlay Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-800">
                  Execute Farmer Payout
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Disbursing cash liquidity payload directly to vendor file
                  context.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={processPayment}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto"
            >
              <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 border border-emerald-100 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-emerald-800/80 uppercase tracking-wide">
                  <span>Target Voucher Line</span>
                  <span>#{paymentForm.delivery_id}</span>
                </div>
                <div className="text-xs text-emerald-700/80 leading-relaxed">
                  Maximum safe payout threshold ceiling auto-validated by server
                  against source balance ledger tracking metrics.
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Payout Value Amount (KES)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-600 bg-white"
                  placeholder="0.00"
                  step="any"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Settlement Medium Gateway
                </label>
                <div className="relative">
                  <select
                    value={paymentForm.channel}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        channel: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-600 bg-white appearance-none"
                  >
                    <option value="cash">💵 Cash Disbursement</option>
                    <option value="mpesa">📱 M-Pesa Mobile Money</option>
                    <option value="bank">🏦 Direct Bank Wire Transfer</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto text-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 px-4 py-3 sm:py-2.5 rounded-xl transition"
                >
                  Close Modal
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-emerald-600 border border-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 sm:py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition text-center"
                >
                  Confirm & Disburse Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
