import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coop-admin/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard core network sync error:", err);
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
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Re-indexing cooperative intelligence assets...
        </p>
      </div>
    );
  }

  // ================= RECHARTS FORMATTING =================
  const pieData = [
    {
      name: "Wallet Balance",
      value: data?.wallet_vs_pending?.wallet || 0,
    },
    {
      name: "Pending Payments",
      value: data?.wallet_vs_pending?.pending || 0,
    },
  ];

  const PIE_COLORS = ["#10b981", "#f43f5e"]; // Emerald and Rose

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Cooperative Administration Node
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Real-time telemetry overview of collective wallet liquid balances,
            outstanding credit cycles, and agricultural product yields.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
        >
          🔄 Re-Sync Stream
        </button>
      </div>

      {/* ================= HIGH-CONTRAST TELEMETRY METRIC GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Total Cooperative Wallet"
          value={data?.wallet_balance || 0}
          isCurrency={true}
          icon="💸"
          accentClass="bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-900"
          valueClass="text-white"
          labelClass="text-slate-400"
        />
        <Card
          title="Pending Payments"
          value={data?.pending_amount || 0}
          isCurrency={true}
          icon="⏳"
          valueClass="text-amber-600"
        />
        <Card
          title="Active Underwritten Loans"
          value={data?.totalLoans || 0}
          isCurrency={false}
          icon="💳"
          valueClass="text-rose-600"
        />
        <Card
          title="Registered Terminal Farmers"
          value={data?.totalFarmers || 0}
          isCurrency={false}
          icon="🧑‍🌾"
          valueClass="text-slate-800"
        />
      </div>

      {/* ================= DATA CHART ANALYSIS PLANES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE METRIC COMPONENT */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/60 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
              Wallet balance vs Pending payments
            </h2>
          </div>
          <div className="p-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  label={false}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index]}
                      className="focus:outline-hidden"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  itemStyle={{
                    color: "#f8fafc",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR METRIC COMPONENT */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/60 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
              Yield Ingestion Weight (Products vs. Quantity)
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data?.products_vs_quantity || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="product"
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  itemStyle={{
                    color: "#34d399",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar
                  dataKey="quantity"
                  fill="#0f172a"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= IMMUTABLE RANKED FARMER LEDGER ================= */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Performance Threshold Matrix (Top Farmers)
          </h2>
          <span className="bg-slate-900 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            LEADERBOARD_CORE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="px-5 py-3.5">Rank & Node Identity</th>
                <th className="px-5 py-3.5">Quantity Supplied</th>
                <th className="px-5 py-3.5">Credit Lines Drawn</th>
                <th className="px-5 py-3.5">Accumulated Liability</th>
                <th className="px-5 py-3.5 text-right">
                  Computed Valuation Net Worth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {!data?.top_farmers || data.top_farmers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-16 font-medium text-slate-400"
                  >
                    No individual yield metrics indexed for current period.
                  </td>
                </tr>
              ) : (
                data.top_farmers.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/40 transition group">
                    {/* Rank Number + Farmer Name */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-900 text-emerald-400 font-mono text-[10px] font-black shadow-inner">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-black text-slate-800 tracking-tight">
                          {f.farmer}
                        </span>
                      </span>
                    </td>

                    {/* Quantity Supplied */}
                    <td className="px-5 py-4 font-bold text-slate-600 whitespace-nowrap">
                      {Number(f.quantity || 0).toLocaleString()}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">
                        Units
                      </span>
                    </td>

                    {/* Active Contract Counts */}
                    <td className="px-5 py-4 font-semibold text-slate-500 whitespace-nowrap">
                      {f.loans_taken || 0} Facilities
                    </td>

                    {/* Total Cumulative Debt */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-400 whitespace-nowrap">
                      KES {Number(f.total_loans || 0).toLocaleString()}
                    </td>

                    {/* Computed Dynamic Net Worth */}
                    <td
                      className={`px-5 py-4 text-right font-black whitespace-nowrap text-sm ${
                        f.net_worth < 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {f.net_worth < 0 ? "-" : "+"} KES{" "}
                      {Number(Math.abs(f.net_worth || 0)).toLocaleString()}
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
}

// ================= CUSTOMIZABLE ISOLATED METRIC UNIT =================
function Card({
  title,
  value,
  isCurrency,
  icon,
  accentClass = "bg-white border-slate-100",
  valueClass = "text-slate-800",
  labelClass = "text-slate-400",
}) {
  return (
    <div
      className={`border rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition ${accentClass}`}
    >
      <div className="space-y-1">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider block ${labelClass}`}
        >
          {title}
        </span>
        <h2 className={`text-2xl font-black tracking-tight ${valueClass}`}>
          {isCurrency && (
            <span className="text-xs font-bold opacity-75 mr-0.5">KES</span>
          )}
          {Number(value).toLocaleString()}
        </h2>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50/10 text-base flex items-center justify-center font-bold shadow-inner">
        {icon}
      </div>
    </div>
  );
}
