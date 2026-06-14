import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [form, setForm] = useState({
    farmer_id: "",
    loan_type: "",
    principal: "",
    due_date: "",
  });

  const fetchLoans = async () => {
    try {
      const res = await api.get("/loans");
      setLoans(res.data.loans || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load loans list");
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await api.get("/coop-admin/farmers");
      setFarmers(res.data.farmers || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get("/loans/summary");
      setSummary(res.data || {});
    } catch (error) {
      console.error(error);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchLoans(), fetchFarmers(), fetchSummary()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const progressToast = toast.loading("Submitting new loan application...");

    try {
      await api.post("/loans", form);
      toast.success("Loan application logged successfully", {
        id: progressToast,
      });

      setForm({
        farmer_id: "",
        loan_type: "",
        principal: "",
        due_date: "",
      });
      setShowForm(false);
      await Promise.all([fetchLoans(), fetchSummary()]);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit loan request",
        { id: progressToast },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const approveLoan = async (id) => {
    setProcessingId(id);
    const progressToast = toast.loading("Approving loan account...");
    try {
      await api.patch(`/loans/${id}/approve`);
      toast.success("Loan successfully approved", { id: progressToast });
      await Promise.all([fetchLoans(), fetchSummary()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve loan", {
        id: progressToast,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const disburseLoan = async (id) => {
    setProcessingId(id);
    const progressToast = toast.loading("Processing capital disbursement...");
    try {
      await api.patch(`/loans/${id}/disburse`);
      toast.success("Capital successfully disbursed to farmer", {
        id: progressToast,
      });
      await Promise.all([fetchLoans(), fetchSummary()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disburse loan", {
        id: progressToast,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const repayLoan = async (loan) => {
    const formattedBalance = Number(loan.current_balance).toLocaleString(
      undefined,
      { minimumFractionDigits: 2 },
    );
    const amount = prompt(
      `Enter repayment amount in KES (Remaining Balance: ${formattedBalance})`,
    );

    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    setProcessingId(loan.id);
    const progressToast = toast.loading("Recording settlement repayment...");
    try {
      await api.post(`/loans/${loan.id}/repay`, { amount: Number(amount) });
      toast.success("Repayment transaction indexed successfully", {
        id: progressToast,
      });
      await Promise.all([fetchLoans(), fetchSummary()]);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to execute payment transaction",
        { id: progressToast },
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const format = status?.toLowerCase() || "";
    if (format === "pending")
      return "bg-amber-50 text-amber-700 border-amber-100";
    if (format === "approved")
      return "bg-blue-50 text-blue-700 border-blue-100";
    if (format === "disbursed")
      return "bg-green-50 text-green-700 border-green-100";
    return "bg-slate-50 text-slate-500 border-slate-200";
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Top Banner Control Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Credit & Financial Loans
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Issue financing capital, review pending requests, track repayment
            metrics, and audit balances.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight border shadow-sm transition duration-150 ${
            showForm
              ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              : "bg-green-600 border-green-700 text-white hover:bg-green-700"
          }`}
        >
          {showForm ? "Cancel Operation" : "＋ Issue New Loan"}
        </button>
      </div>

      {/* Financial Status Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          {
            label: "Total Accounts",
            value: summary.total_loans,
            color: "text-slate-800",
          },
          {
            label: "Total Issued",
            value: summary.total_issued,
            color: "text-indigo-600",
            isCurrency: true,
          },
          {
            label: "Total Disbursed",
            value: summary.total_disbursed,
            color: "text-blue-600",
            isCurrency: true,
          },
          {
            label: "Total Repaid",
            value: summary.total_repaid,
            color: "text-green-600",
            isCurrency: true,
          },
          {
            label: "Active Lines",
            value: summary.active_loans,
            color: "text-emerald-700",
          },
          {
            label: "Pending Reviews",
            value: summary.pending_loans,
            color: "text-amber-600",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-slate-100/80"
          >
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {card.label}
            </span>
            <h3
              className={`text-sm sm:text-base font-black tracking-tight ${card.color}`}
            >
              {card.isCurrency && "KES "}
              {card.isCurrency
                ? Number(card.value || 0).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })
                : card.value || 0}
            </h3>
          </div>
        ))}
      </div>

      {/* Interactive Form Panel Component */}
      {showForm && (
        <form
          onSubmit={handleCreateLoan}
          className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 sm:p-6 space-y-5 transition duration-200"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-700">
              Configure Loan Allocation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensure the selected farmer account holds an active cooperative
              status before provisioning funds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Target Farmer Beneficiary
              </label>
              <div className="relative">
                <select
                  name="farmer_id"
                  value={form.farmer_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition appearance-none"
                >
                  <option value="">Select Producer</option>
                  {farmers
                    .filter((f) => f.status === "active")
                    .map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} — {farmer.phone}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Financing Classification
              </label>
              <input
                type="text"
                name="loan_type"
                value={form.loan_type}
                onChange={handleChange}
                required
                placeholder="e.g. Fertilizer Advance, Machinery"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Principal Capital (KES)
              </label>
              <input
                type="number"
                step="0.01"
                name="principal"
                value={form.principal}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Maturity Settlement Date
              </label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 border border-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>Commit Financial Loan</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Ledger Database Presentation Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-sm">
            Credit Issuance Registry Matrix
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto"></div>
            <p>Gathering credit accounts mapping...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                  <th className="px-5 py-4">Loan Code</th>
                  <th className="px-5 py-4">Farmer Name</th>
                  <th className="px-5 py-4">Contact Phone</th>
                  <th className="px-5 py-4">Asset Type</th>
                  <th className="px-5 py-4">Principal Value</th>
                  <th className="px-5 py-4">Remaining Balance</th>
                  <th className="px-5 py-4 text-center">Lifecycle Status</th>
                  <th className="px-5 py-4 text-right">
                    Workflow Interventions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
                {loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100"
                  >
                    {/* Loan Code */}
                    <td className="px-0 md:px-5 md:py-4 font-mono text-xs font-bold text-slate-400">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Loan Code:
                      </span>
                      {loan.loan_number || `LN-${loan.id}`}
                    </td>

                    {/* Farmer Name */}
                    <td className="px-0 md:px-5 md:py-4 font-bold text-slate-800 text-sm md:text-base">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Farmer Name:
                      </span>
                      {loan.farmer_name || "—"}
                    </td>

                    {/* Contact Phone */}
                    <td className="px-0 md:px-5 md:py-4 text-xs font-medium text-slate-500">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Contact Phone:
                      </span>
                      {loan.phone || "—"}
                    </td>

                    {/* Asset Type */}
                    <td className="px-0 md:px-5 md:py-4">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Asset Type:
                      </span>
                      <span className="bg-slate-100/90 text-slate-600 text-[11px] sm:text-xs px-2 py-1 rounded-md font-medium inline-block">
                        {loan.loan_type}
                      </span>
                    </td>

                    {/* Principal Value */}
                    <td className="px-0 md:px-5 md:py-4 font-medium text-slate-700">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Principal Value:
                      </span>
                      KES{" "}
                      {Number(loan.principal || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Remaining Balance */}
                    <td className="px-0 md:px-5 md:py-4 font-bold text-slate-800">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Remaining Balance:
                      </span>
                      KES{" "}
                      {Number(loan.current_balance || 0).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </td>

                    {/* Lifecycle Status */}
                    <td className="px-0 md:px-5 md:py-4 text-left md:text-center">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Lifecycle Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(loan.status)}`}
                      >
                        {loan.status || "Unknown"}
                      </span>
                    </td>

                    {/* Workflow Interventions */}
                    <td className="px-0 md:px-5 md:py-4 text-left md:text-right whitespace-nowrap mt-2 md:mt-0">
                      {loan.status === "pending" && (
                        <button
                          onClick={() => approveLoan(loan.id)}
                          disabled={processingId !== null}
                          className="w-full md:w-auto text-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 md:py-1.5 rounded-lg transition disabled:opacity-40"
                        >
                          {processingId === loan.id
                            ? "Processing..."
                            : "Approve Account"}
                        </button>
                      )}

                      {loan.status === "approved" && (
                        <button
                          onClick={() => disburseLoan(loan.id)}
                          disabled={processingId !== null}
                          className="w-full md:w-auto text-center text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-2 md:py-1.5 rounded-lg transition disabled:opacity-40"
                        >
                          {processingId === loan.id
                            ? "Processing..."
                            : "Disburse Funds"}
                        </button>
                      )}

                      {loan.status === "disbursed" && (
                        <button
                          onClick={() => repayLoan(loan)}
                          disabled={processingId !== null}
                          className="w-full md:w-auto text-center text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-2 md:py-1.5 rounded-lg transition disabled:opacity-40"
                        >
                          {processingId === loan.id
                            ? "Logging..."
                            : "Log Repayment"}
                        </button>
                      )}

                      {loan.status !== "pending" &&
                        loan.status !== "approved" &&
                        loan.status !== "disbursed" && (
                          <span className="text-xs font-medium text-slate-400 italic md:px-2 block md:inline">
                            No actions required
                          </span>
                        )}
                    </td>
                  </tr>
                ))}

                {loans.length === 0 && (
                  <tr className="flex w-full justify-center text-center">
                    <td
                      colSpan="8"
                      className="text-center py-12 text-slate-400 font-medium w-full"
                    >
                      <p className="text-sm">
                        No credit accounts found indexed inside ledger context.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loans;
