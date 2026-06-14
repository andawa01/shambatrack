import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const FarmerLoans = () => {
  const [summary, setSummary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    loan_type: "",
    principal: "",
    due_date: "",
  });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const [summaryRes, loansRes] = await Promise.all([
        api.get("/farmer/loans/summary"),
        api.get("/farmer/loans"),
      ]);

      setSummary(summaryRes.data);
      setLoans(loansRes.data.loans || loansRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load secure credit profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLoans();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitLoan = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/farmer/loans/apply", formData);
      toast.success("Credit request submitted to underwriting ledger");
      setShowApplyModal(false);
      setFormData({ loan_type: "", principal: "", due_date: "" });
      fetchLoans();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to finalize application routing",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    if (!status) return "bg-slate-50 text-slate-500 border-slate-200";
    switch (status.toLowerCase().trim()) {
      case "approved":
      case "disbursed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "fully_paid":
        return "bg-sky-50 text-sky-700 border-sky-200/60";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          Re-indexing loan ledger matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* HEADER HERO PLATFORM */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Credit & Loan Register
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 sm:mt-0.5 max-w-2xl">
            Track active capital balances, liability indexes, and submit direct
            underwriting requests.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchLoans}
            className="w-full md:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 md:py-2.5 rounded-xl shadow-xs transition cursor-pointer text-center"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-900 font-black text-xs uppercase tracking-wider px-5 py-3 md:py-2.5 rounded-xl shadow-sm transition transform active:scale-98 cursor-pointer text-center"
          >
            Apply For Credit +
          </button>
        </div>
      </div>

      {/* REVENUE & LIABILITY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Outstanding Liability */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Outstanding Debt Balance
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight break-all">
              <span className="text-xs font-bold text-rose-400 mr-0.5">
                KES
              </span>
              {Number(summary?.outstanding_balance || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 text-base flex items-center justify-center font-bold shadow-inner shrink-0 ml-2">
            💳
          </div>
        </div>

        {/* Total Borrowed Accumulated */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-slate-300 transition">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Total Capital Borrowed
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight break-all">
              <span className="text-xs font-bold text-slate-400 mr-0.5">
                KES
              </span>
              {Number(summary?.total_borrowed || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 text-base flex items-center justify-center font-bold shrink-0 ml-2">
            🏛️
          </div>
        </div>

        {/* Active Open Contracts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-emerald-200 transition">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Active Facilities
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {summary?.active_loans || 0}{" "}
              <span className="text-xs font-medium text-slate-400">
                Contracts
              </span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-base flex items-center justify-center font-bold shrink-0 ml-2">
            🛡️
          </div>
        </div>

        {/* Total Logs Counter */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-slate-200 transition">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              All Ledger Actions
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-700 tracking-tight">
              {summary?.total_loans || 0}{" "}
              <span className="text-xs font-medium text-slate-400">
                Entries
              </span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 text-base flex items-center justify-center font-bold shrink-0 ml-2">
            📜
          </div>
        </div>
      </div>

      {/* IMMUTABLE LOAN LEDGER TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Historical Amortization Ledger
          </h2>
          <span className="bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            Underwriting Node V2
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-5 py-3.5">Facility ID Number</th>
                <th className="px-5 py-3.5">Allocation Purpose</th>
                <th className="px-5 py-3.5">Principal Granted</th>
                <th className="px-5 py-3.5">Outstanding Liability</th>
                <th className="px-5 py-3.5">Disbursement Date</th>
                <th className="px-5 py-3.5">Maturation Cutoff</th>
                <th className="px-5 py-3.5 text-center">Underwriter State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
              {loans.length === 0 ? (
                <tr className="flex w-full justify-center">
                  <td
                    colSpan="7"
                    className="text-center py-16 font-medium text-slate-400 w-full"
                  >
                    No historic amortization schedules assigned to this profile
                    index.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr
                    key={loan.id || loan._id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0"
                  >
                    {/* Facility Number Key */}
                    <td className="px-0 md:px-5 md:py-4 font-mono font-bold text-slate-800 tracking-tight break-all">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                        Facility ID Number:
                      </span>
                      {loan.loan_number || "UNASSIGNED"}
                    </td>

                    {/* Loan Allocation Purpose type */}
                    <td className="px-0 md:px-5 md:py-4 font-semibold text-slate-700 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                        Allocation Purpose:
                      </span>
                      {loan.loan_type}
                    </td>

                    {/* Principal Amount column */}
                    <td className="px-0 md:px-5 md:py-4 font-bold text-slate-500 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                        Principal Granted:
                      </span>
                      KES {Number(loan.principal || 0).toLocaleString()}
                    </td>

                    {/* Outstanding Balance liability state column */}
                    <td className="px-0 md:px-5 md:py-4 font-black text-rose-600 whitespace-nowrap text-sm">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                        Outstanding Liability:
                      </span>
                      KES {Number(loan.current_balance || 0).toLocaleString()}
                    </td>

                    {/* Issue Date */}
                    <td className="px-0 md:px-5 md:py-4 font-medium text-slate-400 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                        Disbursement Date:
                      </span>
                      {loan.date_issued
                        ? new Date(loan.date_issued).toLocaleDateString(
                            "en-KE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>

                    {/* Due Target Date */}
                    <td className="px-0 md:px-5 md:py-4 font-medium text-slate-400 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                        Maturation Cutoff:
                      </span>
                      {loan.due_date
                        ? new Date(loan.due_date).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Core Status Micro Badge */}
                    <td className="px-0 md:px-5 md:py-4 text-left md:text-center whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                        Underwriter State:
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-md border ${getStatusStyle(loan.status)}`}
                      >
                        {loan.status?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICANT INPUT SHEET OVERLAY MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 transform transition-all scale-100 flex flex-col">
            {/* Modal Cap title banner */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight">
                  Credit Ingestion Request
                </h2>
                <p className="text-[11px] font-medium text-slate-400">
                  Initialize core node loan parameter structures.
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer transition p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={submitLoan}
              className="p-6 space-y-4 overflow-y-auto"
            >
              {/* Field 1: Facility allocation classification */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Capital Allocation Classification
                </label>
                <input
                  type="text"
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleChange}
                  placeholder="e.g., Fertilizer Inputs, Specialized Machinery, School Fees"
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden focus:border-slate-400 focus:bg-white transition"
                  required
                />
              </div>

              {/* Field 2: Requested Principal Capital */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Requested Principal Capital (KES)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-xs">
                      KES
                    </span>
                  </div>
                  <input
                    type="number"
                    name="principal"
                    value={formData.principal}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="1"
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-xs font-bold focus:outline-hidden focus:border-slate-400 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Field 3: Maturation Cutoff Target Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Maturation Cutoff Target Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-hidden focus:border-slate-400 focus:bg-white transition"
                  required
                />
              </div>

              {/* Action operations platform bar */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 mt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 border border-transparent hover:border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Discard
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                      Routing...
                    </>
                  ) : (
                    "Authorize Underwriting ✓"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerLoans;
