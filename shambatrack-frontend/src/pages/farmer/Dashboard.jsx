import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/farmer/dashboard");
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync structural dashboard parameters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          Syncing core farm ledger indexes...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Welcome Back Farmer 👋
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 sm:mt-0.5 max-w-2xl">
            Track your seasonal deliveries, earnings, loans, dynamic wallet
            ledger balances, and network dispatches.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-xs transition cursor-pointer text-center whitespace-nowrap"
        >
          🔄 Refresh Metrics
        </button>
      </div>

      {/* Grid Configuration KPI Summary Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Deliveries */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-slate-300 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Deliveries
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {data?.summary?.total_deliveries || 0}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 text-base flex items-center justify-center font-bold shrink-0">
            🚜
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-emerald-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Earnings
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight break-all">
              <span className="text-xs font-bold text-emerald-500 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.total_earnings || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-base flex items-center justify-center font-bold shrink-0">
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
              {Number(data?.summary?.pending_payments || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 text-base flex items-center justify-center font-bold shrink-0">
            ⏳
          </div>
        </div>

        {/* Wallet Balance (Deep Accent Box) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Wallet Balance
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight break-all">
              <span className="text-xs font-bold text-slate-400 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.wallet_balance || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 text-base flex items-center justify-center font-bold shadow-inner shrink-0">
            💳
          </div>
        </div>

        {/* Loan Balance */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-rose-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Loan Balance
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight break-all">
              <span className="text-xs font-bold text-rose-400 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.loan_balance || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 text-base flex items-center justify-center font-bold shrink-0">
            🚨
          </div>
        </div>

        {/* Loan Limit */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-blue-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Available Loan Limit
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight break-all">
              <span className="text-xs font-bold text-blue-400 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.loan_limit || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 text-base flex items-center justify-center font-bold shrink-0">
            📈
          </div>
        </div>

        {/* Total Loans Counter */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-slate-300 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Loans Requested
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {data?.summary?.total_loans || 0}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 text-base flex items-center justify-center font-bold shrink-0">
            🏦
          </div>
        </div>

        {/* Unread Notifications */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-indigo-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Unread Broadcasts
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">
              {data?.unreadNotifications || 0}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 text-base flex items-center justify-center font-bold shrink-0">
            ✉️
          </div>
        </div>
      </div>

      {/* Loan Overview Segment Map */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs">📊</span>
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Loan Matrix Evaluation Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Accounts Loaded
            </p>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
              {data?.summary?.total_loans || 0}{" "}
              <span className="text-xs font-medium text-slate-400">Files</span>
            </h3>
          </div>

          <div className="bg-rose-50/20 p-4 rounded-xl border border-rose-100/60">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
              Outstanding Balance
            </p>
            <h3 className="text-lg sm:text-xl font-black text-rose-600 mt-1break-all">
              <span className="text-xs font-bold mr-0.5">KES</span>
              {Number(data?.summary?.outstanding_loans || 0).toLocaleString()}
            </h3>
          </div>

          <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-100/60">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
              Dynamic Access Ceiling
            </p>
            <h3 className="text-lg sm:text-xl font-black text-blue-600 mt-1 break-all">
              <span className="text-xs font-bold mr-0.5">KES</span>
              {Number(data?.summary?.loan_limit || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Two-Column Asymmetric Dashboard Grid Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Logistical Deliveries Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
                Recent Stock Ingestion Log
              </h2>
              <span className="bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                Ledger View
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                    <th className="px-5 py-3.5">Log Date</th>
                    <th className="px-5 py-3.5">Product Type</th>
                    <th className="px-5 py-3.5">Net Mass/Qty</th>
                    <th className="px-5 py-3.5 text-right">Computed Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
                  {data?.recentDeliveries?.length === 0 ? (
                    <tr className="flex w-full justify-center">
                      <td
                        colSpan="4"
                        className="text-center py-12 font-medium text-slate-400 w-full"
                      >
                        No processing activity found on this profile register.
                      </td>
                    </tr>
                  ) : (
                    data?.recentDeliveries?.map((delivery) => (
                      <tr
                        key={delivery.id || delivery._id}
                        className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-1.5 md:gap-0"
                      >
                        <td className="px-0 md:px-5 md:py-3.5 font-semibold text-slate-400 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                            Log Date:
                          </span>
                          {new Date(delivery.date).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-0 md:px-5 md:py-3.5 font-bold text-slate-800 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                            Product Type:
                          </span>
                          {delivery.product_name}
                        </td>
                        <td className="px-0 md:px-5 md:py-3.5 font-mono font-bold text-slate-600 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                            Net Mass/Qty:
                          </span>
                          {delivery.quantity}
                        </td>
                        <td className="px-0 md:px-5 md:py-3.5 text-left md:text-right font-bold text-slate-900 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                            Computed Payout:
                          </span>
                          KES {Number(delivery.total_amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: System Network Notification Center Container */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col">
          <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
              Broadcast Pipeline
            </h2>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-xs animate-ping"></span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[350px]">
            {data?.notifications?.length === 0 ? (
              <div className="py-16 text-center text-xs font-medium text-slate-400">
                No real-time broadcast entries located.
              </div>
            ) : (
              data.notifications.map((item) => (
                <div
                  key={item._id}
                  className="p-4 hover:bg-slate-50/30 transition group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-xs tracking-tight group-hover:text-emerald-700 transition truncate">
                        {item.notification_id?.title || "Platform Update"}
                      </h4>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed break-words">
                        {item.notification_id?.message}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wide border ${
                        item.is_read
                          ? "bg-slate-50 text-slate-400 border-slate-100"
                          : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      }`}
                    >
                      {item.is_read ? "Archived" : "New"}
                    </span>
                  </div>

                  <p className="text-[9px] font-mono font-medium text-slate-400 mt-2">
                    {new Date(item.createdAt).toLocaleString("en-KE", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
