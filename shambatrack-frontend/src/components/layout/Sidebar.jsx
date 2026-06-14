import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({
  isMenuOpen = false,
  setIsMenuOpen = () => {},
}) {
  const location = useLocation();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/coop-admin/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchData();
  }, []);

  // Helper function to check if a link is currently active
  const isActive = (path) => location.pathname === path;

  // Configuration array for scalable navigation elements
  const navItems = [
    {
      label: "Dashboard",
      path: "/cooperative-admin/dashboard",
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
          />
        </svg>
      ),
    },
    {
      label: "Farmers",
      path: "/cooperative-admin/farmers",
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
      label: "Products",
      path: "/cooperative-admin/products",
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
      label: "Deliveries",
      path: "/cooperative-admin/deliveries",
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
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 3v5a1 1 0 01-1 1h-1m-6 0h-2"
          />
        </svg>
      ),
    },
    {
      label: "Loans",
      path: "/cooperative-admin/loans",
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Wallets",
      path: "/cooperative-admin/wallets",
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      label: "Notifications",
      path: "/cooperative-admin/notifications",
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      label: "Audit Logs",
      path: "/cooperative-admin/audit-logs",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
    fixed top-0 left-0 z-50
    w-64 h-screen bg-slate-900
    border-r border-slate-800 text-slate-300
    flex flex-col justify-between
    transition-transform duration-300 ease-in-out

    ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `}
      >
        {/* Upper Navigation Block */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Branding/Header */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="bg-gradient-to-tr from-green-500 to-emerald-500 p-2 rounded-xl text-white shadow-md shadow-green-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 4a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide leading-none mb-1">
                ShambaTrack
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Coop Admin
              </span>
            </div>
          </div>

          {/* Navigation Item Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 group ${
                    active
                      ? "bg-gradient-to-r from-green-600/20 to-emerald-600/10 text-green-400 border border-green-500/20 shadow-inner"
                      : "hover:bg-slate-800/60 hover:text-white border border-transparent"
                  }`}
                >
                  {/* SVG Icon housing with dynamic text/hover interactions */}
                  <div
                    className={`transition-transform duration-150 group-hover:scale-105 ${active ? "text-green-400" : "text-slate-400 group-hover:text-slate-200"}`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Identity Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 backdrop-blur-sm flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-inner">
            CA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {data?.cooperative?.name || "Loading..."}
            </p>

            <p className="text-[11px] text-slate-500 truncate">
              {data?.cooperative?.email || ""}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
