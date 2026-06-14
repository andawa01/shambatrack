import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const FarmerPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/farmer/payments");
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync structural ledger settlement states");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
  }, []);

  const getStatusBadgeStyle = (status) => {
    if (!status) return "bg-slate-50 text-slate-400 border-slate-200";
    const phase = status.trim().toLowerCase();

    if (phase === "completed" || phase === "success" || phase === "paid") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (phase === "pending" || phase === "processing" || phase === "queued") {
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  const getMethodBadgeStyle = (method) => {
    if (!method) return "bg-slate-50 text-slate-500 border-slate-200";
    const normalized = method.toLowerCase();

    if (normalized.includes("mpesa") || normalized.includes("mobile")) {
      return "bg-slate-900 text-emerald-400 border-slate-800 font-mono";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          Syncing transaction ledger files...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Disbursement Ledger
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 sm:mt-0.5 max-w-2xl">
            Monitor real-time verified pay slips, platform clearings,
            transaction reference signatures, and historic cash outs.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-xs transition cursor-pointer text-center whitespace-nowrap"
        >
          🔄 Refresh Settlements
        </button>
      </div>

      {/* SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Received */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Cleared Capital
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight break-all">
              <span className="text-xs font-bold text-emerald-400 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.total_received || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 text-base flex items-center justify-center font-bold shadow-inner shrink-0">
            💸
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-amber-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pending Payments
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight break-all">
              <span className="text-xs font-bold text-amber-500 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.total_pending || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 text-base flex items-center justify-center font-bold shrink-0">
            ⏳
          </div>
        </div>

        {/* Total Transactions Counter */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-slate-300 transition sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Settlement Events Logged
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {data?.summary?.total_transactions || 0}{" "}
              <span className="text-xs font-medium text-slate-400">
                Receipts
              </span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 text-base flex items-center justify-center font-bold shrink-0">
            📂
          </div>
        </div>
      </div>

      {/* AUDIT HISTORY REGISTRY TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Audit Ingestion Registry
          </h2>
          <span className="bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            Encrypted Core Node
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-5 py-3.5">Settlement Date</th>
                <th className="px-5 py-3.5">Reference Hash Signature</th>
                <th className="px-5 py-3.5">Payout Channel</th>
                <th className="px-5 py-3.5">Transferred Capital</th>
                <th className="px-5 py-3.5 text-center">Gateway Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
              {!data?.payments?.length ? (
                <tr className="flex w-full justify-center">
                  <td
                    colSpan="5"
                    className="text-center py-16 font-medium text-slate-400 w-full"
                  >
                    No historic settlement clearances located within this
                    profile ledger index.
                  </td>
                </tr>
              ) : (
                data.payments.map((payment) => (
                  <tr
                    key={payment.id || payment._id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0"
                  >
                    {/* Settlement Date Column */}
                    <td className="px-0 md:px-5 md:py-4 font-semibold text-slate-400 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Settlement Date:
                      </span>
                      {new Date(payment.payment_date).toLocaleDateString(
                        "en-KE",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>

                    {/* Reference Hash Signature */}
                    <td className="px-0 md:px-5 md:py-4 font-mono font-bold text-slate-800 tracking-tight whitespace-nowrap break-all">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Reference Hash Signature:
                      </span>
                      {payment.reference_no || "N/A"}
                    </td>

                    {/* Payout Channel Badge */}
                    <td className="px-0 md:px-5 md:py-4 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                        Payout Channel:
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-md border ${getMethodBadgeStyle(payment.payment_method)}`}
                      >
                        {payment.payment_method}
                      </span>
                    </td>

                    {/* Transferred Amount Column */}
                    <td className="px-0 md:px-5 md:py-4 font-black text-emerald-600 whitespace-nowrap text-sm">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Transferred Capital:
                      </span>
                      KES {Number(payment.amount || 0).toLocaleString()}
                    </td>

                    {/* Gateway Status Badge */}
                    <td className="px-0 md:px-5 md:py-4 text-left md:text-center whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                        Gateway Status:
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-md border ${getStatusBadgeStyle(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmerPayments;
