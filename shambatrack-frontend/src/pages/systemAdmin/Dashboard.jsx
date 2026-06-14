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

  // Professional Skeleton Loading State
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-100 border border-slate-200 rounded-2xl p-6"
            >
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Define metric items for descriptive mapping
  const metrics = [
    {
      title: "Total Cooperatives",
      value: stats?.totalCooperatives ?? 0,
      colorClass: "text-green-600 bg-green-50 border-green-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      colorClass: "text-blue-600 bg-blue-50 border-blue-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "Active Loans",
      value: stats?.activeLoans ?? 0,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          System Admin Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time overview of ShambaTrack ecosystems, registered entities, and
          structural operational data.
        </p>
      </div>

      {/* Grid KPI Metrics Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 hover:shadow-md hover:border-slate-200/80 transition-all duration-200 flex items-center justify-between group"
          >
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {metric.title}
              </h2>
              <p className="text-4xl font-extrabold text-slate-800 tracking-tight group-hover:scale-[1.01] transition-transform duration-150">
                {metric.value.toLocaleString()}
              </p>
            </div>

            {/* Icon housing */}
            <div
              className={`p-4 rounded-xl border ${metric.colorClass} shadow-inner shrink-0 transition-transform duration-200 group-hover:scale-105`}
            >
              {metric.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
