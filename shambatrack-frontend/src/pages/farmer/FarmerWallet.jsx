import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const FarmerWallet = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/farmer/wallet");
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to synchronize wallet ledger data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallet();
  }, []);

  const getTransactionBadge = (type) => {
    if (!type) return "bg-slate-50 text-slate-500 border-slate-200";
    const t = type.toLowerCase();
    if (t === "credit")
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    if (t === "debit") return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          Ingesting secure financial vault data...
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
            Financial Settlement Wallet
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 sm:mt-0.5 max-w-2xl">
            Real-time balance tracking, credit facility management, and
            transaction audit trails.
          </p>
        </div>
        <button
          onClick={fetchWallet}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-xs transition cursor-pointer text-center whitespace-nowrap"
        >
          🔄 Sync Ledger
        </button>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            label: "Available Balance",
            val: data?.wallet?.balance,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Loan Liability",
            val: data?.wallet?.loan_balance,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
          {
            label: "Loan Capacity",
            val: data?.wallet?.loan_limit,
            color: "text-sky-600",
            bg: "bg-sky-50",
          },
          {
            label: "Total Operations",
            val: data?.summary?.total_transactions || 0,
            color: "text-slate-800",
            bg: "bg-slate-50",
            isCount: true,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-200 transition"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {item.label}
            </p>
            <h2
              className={`text-xl sm:text-2xl font-black mt-2 break-all ${item.color}`}
            >
              {!item.isCount && <span className="text-xs mr-0.5">KES</span>}
              {Number(item.val || 0).toLocaleString()}
            </h2>
          </div>
        ))}
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Inflow Credits
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 break-all">
            KES {Number(data?.summary?.total_credits || 0).toLocaleString()}
          </h2>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Outflow Debits
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 break-all">
            KES {Number(data?.summary?.total_debits || 0).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Immutable Transaction History
          </h2>
          <span className="bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            SECURE_NODE_TXN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Reference Hash</th>
                <th className="px-5 py-3.5">Channel/Gateway</th>
                <th className="px-5 py-3.5">Entry Type</th>
                <th className="px-5 py-3.5 text-right">Amount Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
              {!data?.transactions || data.transactions.length === 0 ? (
                <tr className="flex w-full justify-center">
                  <td
                    colSpan="5"
                    className="text-center py-16 font-medium text-slate-400 w-full"
                  >
                    No transaction records located.
                  </td>
                </tr>
              ) : (
                data.transactions.map((txn) => (
                  <tr
                    key={txn.id || txn._id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0"
                  >
                    {/* Timestamp Column */}
                    <td className="px-0 md:px-5 md:py-4 font-mono text-slate-500 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Timestamp:
                      </span>
                      {new Date(txn.date).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Reference Hash */}
                    <td className="px-0 md:px-5 md:py-4 font-mono font-bold text-slate-800 break-all">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Reference Hash:
                      </span>
                      {txn.trans_ref || "---"}
                    </td>

                    {/* Channel/Gateway */}
                    <td className="px-0 md:px-5 md:py-4 font-semibold text-slate-700 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Channel/Gateway:
                      </span>
                      {txn.channel || "INTERNAL"}
                    </td>

                    {/* Entry Type */}
                    <td className="px-0 md:px-5 md:py-4 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                        Entry Type:
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md border ${getTransactionBadge(txn.type)}`}
                      >
                        {txn.type}
                      </span>
                    </td>

                    {/* Amount Delta */}
                    <td
                      className={`px-0 md:px-5 md:py-4 text-left md:text-right font-black whitespace-nowrap text-sm ${txn.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Amount Delta:
                      </span>
                      {txn.type === "debit" ? "-" : "+"} KES{" "}
                      {Number(txn.amount).toLocaleString()}
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

export default FarmerWallet;
