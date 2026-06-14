import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const FarmerDeliveries = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/farmer/deliveries");
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load historical batch parameters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeliveries();
  }, []);

  const getQualityBadgeColor = (grade) => {
    if (!grade) return "bg-slate-50 text-slate-400 border-slate-200";
    const normalGrade = grade.trim().toUpperCase();
    if (
      normalGrade.startsWith("A") ||
      normalGrade.includes("PREMIUM") ||
      normalGrade.includes("HIGH")
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (
      normalGrade.startsWith("B") ||
      normalGrade.includes("GOOD") ||
      normalGrade.includes("MEDIUM")
    ) {
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    }
    if (normalGrade.startsWith("C") || normalGrade.includes("FAIR")) {
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          Syncing cooperative delivery logs...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Context Area Title Header Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Delivery Ingestion Log
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 sm:mt-0.5 max-w-2xl">
            Review your collection receipts, computed metric mass values,
            verified tier metrics, and accumulated crop revenue.
          </p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-xs transition cursor-pointer text-center whitespace-nowrap"
        >
          🔄 Force Sync Log
        </button>
      </div>

      {/* Aggregate Logistical Performance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Total Deliveries Index Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-slate-300 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Batches Submitted
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {data?.summary?.total_deliveries || 0}{" "}
              <span className="text-xs font-medium text-slate-400">Loads</span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 text-base flex items-center justify-center font-bold shrink-0">
            🚜
          </div>
        </div>

        {/* Aggregated Product Quantity Volume Counter */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:border-blue-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Net Volume Processed
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight break-all">
              {Number(data?.summary?.total_quantity || 0).toLocaleString()}{" "}
              <span className="text-xs font-bold text-slate-400 uppercase tracking-normal">
                Units
              </span>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 text-base flex items-center justify-center font-bold shrink-0">
            ⚖️
          </div>
        </div>

        {/* Gross Capital Revenue Generated Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:shadow-md transition sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Realized Revenue
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight break-all">
              <span className="text-xs font-bold text-emerald-400 mr-0.5">
                KES
              </span>
              {Number(data?.summary?.total_earnings || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 text-base flex items-center justify-center font-bold shadow-inner shrink-0">
            💸
          </div>
        </div>
      </div>

      {/* Main Core Ledger History Responsive Layout Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Ingestion Registry Record View
          </h2>
          <span className="bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            Verified Archives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-5 py-3.5">Weigh In Date</th>
                <th className="px-5 py-3.5">Produce Classification</th>
                <th className="px-5 py-3.5">Net Mass</th>
                <th className="px-5 py-3.5">Base Rate Unit</th>
                <th className="px-5 py-3.5">Gross Yield Value</th>
                <th className="px-5 py-3.5 text-center">Lab/Quality Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
              {!data?.deliveries || data.deliveries.length === 0 ? (
                <tr className="flex w-full justify-center">
                  <td
                    colSpan="6"
                    className="text-center py-16 font-medium text-slate-400 w-full"
                  >
                    No active collection profiles located within this account
                    register link.
                  </td>
                </tr>
              ) : (
                data.deliveries.map((delivery) => (
                  <tr
                    key={delivery.id || delivery._id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0"
                  >
                    {/* Log Date Column */}
                    <td className="px-0 md:px-5 md:py-4 font-semibold text-slate-400 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Weigh In Date:
                      </span>
                      {new Date(delivery.date).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Product Classification Title */}
                    <td className="px-0 md:px-5 md:py-4 font-bold text-slate-800 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Produce Classification:
                      </span>
                      {delivery.product_name}
                    </td>

                    {/* Quantity Level Counter */}
                    <td className="px-0 md:px-5 md:py-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Net Mass:
                      </span>
                      {delivery.quantity}
                    </td>

                    {/* Base Cost Variable Index Row */}
                    <td className="px-0 md:px-5 md:py-4 font-medium text-slate-500 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Base Rate Unit:
                      </span>
                      KES {Number(delivery.unit_price || 0).toLocaleString()}
                    </td>

                    {/* Computed Dynamic Payout Sum Column */}
                    <td className="px-0 md:px-5 md:py-4 font-black text-emerald-600 whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block">
                        Gross Yield Value:
                      </span>
                      KES {Number(delivery.total_amount || 0).toLocaleString()}
                    </td>

                    {/* Quality Grade Attribute Badge Container */}
                    <td className="px-0 md:px-5 md:py-4 text-left md:text-center whitespace-nowrap">
                      <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                        Lab/Quality Tier:
                      </span>
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-md border ${getQualityBadgeColor(delivery.quality)}`}
                      >
                        {delivery.quality || "Pending Check"}
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

export default FarmerDeliveries;
