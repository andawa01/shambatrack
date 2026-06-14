import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

  // ================= DYNAMIC DATA CONVERSIONS =================
  const walletPieData = data?.summary?.walletBreakdown || [
    { name: "Wallet Balance", value: data?.summary?.wallet_balance || 0 },
    { name: "Active Debt Exposure", value: data?.summary?.loan_balance || 0 },
  ];

  const PIE_COLORS = ["#10b981", "#ef4444"]; // Emerald & Red

  // Custom Formatter to render absolute financial amounts text on chart paths
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    value,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#334155"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-[11px] font-mono font-bold"
      >
        {name}: KES {Number(value).toLocaleString()}
      </text>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Farmer Dashboard
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Monitor deliveries, real-time earnings, wallet growth, credit line
              cycles, and cooperative announcements from a single workspace.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            🔄 Sync Ledger
          </button>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-xl" />
        <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-slate-500/5 blur-xl" />
      </div>

      {/* ================= TELEMETRY CORE KPI GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Deliveries"
          value={data?.summary?.total_deliveries || 0}
          icon="🚜"
        />
        <MetricCard
          title="Total Gross Earnings"
          value={data?.summary?.total_earnings || 0}
          isCurrency
          icon="💸"
          colorClass="text-emerald-600"
          hoverBorder="hover:border-emerald-200"
        />
        <MetricCard
          title="Pending Settlement"
          value={data?.summary?.pending_payments || 0}
          isCurrency
          icon="⏳"
          colorClass="text-amber-500"
          hoverBorder="hover:border-amber-200"
        />
        <MetricCard
          title="Wallet Liquid Cash"
          value={data?.summary?.wallet_balance || 0}
          isCurrency
          icon="💳"
          isDark
        />
        <MetricCard
          title="Outstanding Loans"
          value={data?.summary?.loan_balance || 0}
          isCurrency
          icon="🚨"
          colorClass="text-rose-600"
          hoverBorder="hover:border-rose-200"
        />
        <MetricCard
          title="Available Credit Limit"
          value={data?.summary?.loan_limit || 0}
          isCurrency
          icon="📈"
          colorClass="text-blue-600"
          hoverBorder="hover:border-blue-200"
        />
        <MetricCard
          title="Active Facilities"
          value={data?.summary?.total_loans || 0}
          icon="🏦"
        />
        <MetricCard
          title="Unread Broadcasts"
          value={data?.unreadNotifications || 0}
          icon="✉️"
          colorClass="text-indigo-600"
          hoverBorder="hover:border-indigo-200"
        />
      </div>

      {/* ================= SECONDARY MATRIX BENCHMARK ROW ================= */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs">📊</span>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Loan Underwriting Matrix Context
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Accounts Loaded
            </p>
            <h3 className="text-xl font-black text-slate-800 mt-1">
              {data?.summary?.total_loans || 0}{" "}
              <span className="text-xs font-medium text-slate-400">Files</span>
            </h3>
          </div>
          <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100/60">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
              Outstanding Exposure Balance
            </p>
            <h3 className="text-xl font-black text-rose-600 mt-1">
              <span className="text-xs font-bold mr-0.5">KES</span>
              {Number(
                data?.summary?.outstanding_loans ||
                  data?.summary?.loan_balance ||
                  0,
              ).toLocaleString()}
            </h3>
          </div>
          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/60">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
              Access Ceiling Ceiling
            </p>
            <h3 className="text-xl font-black text-blue-600 mt-1">
              <span className="text-xs font-bold mr-0.5">KES</span>
              {Number(data?.summary?.loan_limit || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* ================= VISUAL TELEMETRY CHART GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/60 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
              Earnings Performance Cycles
            </h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.summary?.monthlyEarnings || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
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
                  dataKey="earnings"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/60 border-b border-slate-100">
            <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
              Product Yield Metric (Volume/Mass)
            </h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.summary?.productPerformance || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    color: "#38bdf8",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar
                  dataKey="quantity"
                  fill="#0f172a"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financial Position Donut Component Block */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Financial Ratios & Resource Vulnerability
          </h2>
        </div>
        <div className="p-6 h-96 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, bottom: 20, left: 30, right: 30 }}>
              <Pie
                data={walletPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                label={renderCustomizedLabel}
              >
                {walletPieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
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
                formatter={(value) => `KES ${Number(value).toLocaleString()}`}
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

      {/* ================= INTERLOCKING ASYMMETRIC DETAILS BLOCK ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT DELIVERIES TABLE */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
                Recent Ingestion Registers
              </h2>
              <span className="bg-slate-900 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                LEDGER_STREAM
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                    <th className="px-5 py-3.5">Log Timestamp</th>
                    <th className="px-5 py-3.5">Product Category</th>
                    <th className="px-5 py-3.5">Net Units</th>
                    <th className="px-5 py-3.5 text-right">Computed Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
                  {!data?.recentDeliveries ||
                  data.recentDeliveries.length === 0 ? (
                    <tr className="flex w-full justify-center">
                      <td
                        colSpan="4"
                        className="text-center py-16 font-medium text-slate-400 w-full"
                      >
                        No processing warehouse activity located in database
                        logs.
                      </td>
                    </tr>
                  ) : (
                    data.recentDeliveries.map((delivery, i) => (
                      <tr
                        key={delivery.id || delivery._id || i}
                        className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-1.5 md:gap-0"
                      >
                        <td className="px-0 md:px-5 md:py-4 font-mono font-semibold text-slate-400 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                            Timestamp:
                          </span>
                          {new Date(delivery.date).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-0 md:px-5 md:py-4 font-black text-slate-800 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                            Product Category:
                          </span>
                          {delivery.product_name}
                        </td>
                        <td className="px-0 md:px-5 md:py-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                            Net Units:
                          </span>
                          {delivery.quantity}
                        </td>
                        <td className="px-0 md:px-5 md:py-4 text-left md:text-right font-black text-slate-900 whitespace-nowrap text-sm">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
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

        {/* NOTIFICATION HUB */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
              Broadcast Pipelines
            </h2>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {!data?.notifications || data.notifications.length === 0 ? (
              <div className="py-20 text-center text-xs font-medium text-slate-400">
                No active cooperative broadcasts found.
              </div>
            ) : (
              data.notifications.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="p-4 hover:bg-slate-50/40 transition group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-xs tracking-tight group-hover:text-emerald-700 transition truncate">
                        {item.notification_id?.title || "Platform Update"}
                      </h4>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed break-words">
                        {item.notification_id?.message}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wide border ${
                        item.is_read
                          ? "bg-slate-50 text-slate-400 border-slate-100"
                          : "bg-amber-50 text-amber-700 border-amber-200"
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

// ================= ISOLATED DYNAMIC METRIC ELEMENT MODULE =================
function MetricCard({
  title,
  value,
  isCurrency,
  icon,
  isDark,
  colorClass = "text-slate-800",
  hoverBorder = "hover:border-slate-300",
}) {
  if (isDark) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between hover:shadow-md transition shrink-0">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight break-all">
            <span className="text-xs font-bold text-slate-400 mr-0.5">KES</span>
            {Number(value).toLocaleString()}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 text-base flex items-center justify-center font-bold shadow-inner shrink-0">
          {icon}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between transition ${hoverBorder} shrink-0`}
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          {title}
        </span>
        <h2
          className={`text-xl sm:text-2xl font-black tracking-tight break-all ${colorClass}`}
        >
          {isCurrency && (
            <span className="text-xs font-bold opacity-75 mr-0.5">KES</span>
          )}
          {Number(value).toLocaleString()}
        </h2>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 text-base flex items-center justify-center font-bold shrink-0 shadow-xs">
        {icon}
      </div>
    </div>
  );
}
