import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/coop-admin/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Premium Contextual Metrics Definition
  const cards = [
    {
      title: "Cooperatives",
      value: data?.totalCooperatives ?? 0,
      colorClass: "text-green-600 bg-green-50 border-green-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      title: "Farmers",
      value: data?.totalFarmers ?? 0,
      colorClass: "text-blue-600 bg-blue-50 border-blue-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      title: "Products",
      value: data?.totalProducts ?? 0,
      colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      title: "Total Loans",
      value: data?.totalLoans ?? 0,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Pending Loans",
      value: data?.pendingLoans ?? 0,
      colorClass:
        data?.pendingLoans > 0
          ? "text-rose-600 bg-rose-50 border-rose-100 animate-pulse-slow"
          : "text-amber-600 bg-amber-50 border-amber-100",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  // Professional Animated Grid Skeleton Loader
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 border border-slate-200/60 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-50 border border-slate-200/60 rounded-2xl p-5"
            >
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Cooperative Info Banner Block */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl shadow-slate-950/20">
        {/* Subtle decorative background plant/globe badge element */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 text-slate-800/20 pointer-events-none transform -rotate-12 hidden sm:block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-64 w-64"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="relative z-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md">
            Active Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
            {data?.cooperative?.name || "Cooperative Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl">
            Welcome back to your ShambaTrack hub. Review incoming deliveries,
            manage farmer accounts, and process pending loan allocations below.
          </p>
        </div>
      </div>

      {/* Grid KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/60 hover:shadow-md hover:border-slate-200/80 transition-all duration-200 flex flex-col justify-between group gap-4"
          >
            <div className="flex justify-between items-start gap-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                {card.title}
              </h2>
              {/* Dynamic Accent Icon Wrapper */}
              <div
                className={`p-2 rounded-xl border shrink-0 transition-transform duration-200 group-hover:scale-105 ${card.colorClass}`}
              >
                {card.icon}
              </div>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight transition-transform duration-150 group-hover:scale-[1.01]">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace Activity Grid Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center text-slate-400 text-sm flex flex-col items-center justify-center min-h-[180px]">
          <p className="font-semibold text-slate-600 mb-1">
            Recent Production &amp; Deliveries
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Operational timelines and charts showing daily weight collection
            summaries will map perfectly inside this section.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center text-slate-400 text-sm flex flex-col items-center justify-center min-h-[180px]">
          <p className="font-semibold text-slate-600 mb-1">Quick Actions</p>
          <div className="mt-3 w-full space-y-2 px-4">
            <div className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold p-2.5 rounded-xl shadow-sm hover:bg-slate-50 cursor-pointer transition">
              + Register New Farmer
            </div>
            <div className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold p-2.5 rounded-xl shadow-sm hover:bg-slate-50 cursor-pointer transition">
              &rarr; Log New Delivery Payload
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
