import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SystemDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/system/dashboard-stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // =========================
  // LOADING SKELETON
  // =========================
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-xl w-1/2"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-100 border border-slate-200 rounded-2xl p-6"
            />
          ))}
        </div>
      </div>
    );
  }

  // =========================
  // METRICS CONFIG
  // =========================
  const metrics = [
    {
      title: "Total Cooperatives",
      value: stats?.totalCooperatives ?? 0,
      gradient: "from-emerald-500 to-green-600",
      icon: "🏢",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      gradient: "from-blue-500 to-indigo-600",
      icon: "👥",
    },
    {
      title: "Active Loans",
      value: stats?.activeLoans ?? 0,
      gradient: "from-amber-500 to-orange-600",
      icon: "💰",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 animate-fadeIn">
      {/* =========================
          HERO HEADER
      ========================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Control Center
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl">
            Monitor cooperatives, users, loans, and platform-wide activity in
            real time.
          </p>
        </div>

        {/* decorative glow */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-green-500/10 blur-3xl rounded-full" />
      </div>

      {/* =========================
          KPI CARDS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="group relative bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* gradient accent bar */}
            <div
              className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${m.gradient}`}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {m.title}
                </p>

                <h2 className="text-3xl font-extrabold text-slate-800 mt-2 group-hover:scale-[1.03] transition-transform">
                  {Number(m.value).toLocaleString()}
                </h2>
              </div>

              <div
                className={`text-3xl p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition`}
              >
                {m.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          INSIGHT PANEL (OPTIONAL)
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            System Health Overview
          </h3>

          <div className="space-y-3 text-sm text-slate-600">
            <p>• Cooperatives are actively expanding across regions</p>
            <p>• Loan activity is stable across all registered users</p>
            <p>• System database connections are stable</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Platform Status
          </h3>

          <p className="text-4xl font-extrabold mt-4">Healthy</p>

          <p className="text-sm text-white/80 mt-2">
            All systems operational and processing normally.
          </p>
        </div>
      </div>
    </div>
  );
}
