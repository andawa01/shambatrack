import { Link, useLocation } from "react-router-dom";

export default function SystemSidebar({
  isMenuOpen = false,
  setIsMenuOpen = () => {},
}) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Navigation items matching your design
  const navItems = [
    {
      label: "Dashboard",
      path: "/system-admin/dashboard",
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
      label: "Cooperatives",
      path: "/system-admin/cooperatives",
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
      label: "Coop Admins",
      path: "/system-admin/coop-admins",
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
      label: "Audit Logs",
      path: "/system-admin/audit-logs",
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
            d="M9 12h6m-6 4h6M9 8h6m2 12H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 1. Backdrop layer: Fixed on top of text (z-40), but behind the sliding sidebar (z-50) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* 2. Sidebar Container */}
      <div
        className={`
    fixed lg:sticky top-0 z-50
    w-64 h-screen bg-slate-900
    transition-transform duration-300
    right-0 border-l border-slate-800
    lg:left-0 lg:right-auto lg:border-r lg:border-l-0
    ${isMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
  `}
      >
        {/* Top Section */}
        <div className="p-5">
          {/* Top Branding Frame */}
          <div className="flex items-center gap-3 px-2 mb-8 mt-4 lg:mt-0">
            <div className="bg-gradient-to-tr from-green-500 to-emerald-400 p-2 rounded-xl text-slate-900 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                ShambaTrack
              </h2>
              <span className="text-xs font-semibold uppercase text-green-500">
                System Admin
              </span>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)} // Clean auto-close on navigate
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-green-600/20 to-emerald-600/10 text-green-400 border border-green-500/20"
                      : "text-white hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  {/* Icon with hover bounce */}
                  <div
                    className={`transition-transform duration-200 group-hover:scale-105 ${
                      active
                        ? "text-green-400"
                        : "text-white group-hover:text-green-300"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Identity Frame */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 backdrop-blur-sm flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center font-bold text-sm text-white shadow-sm">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Administrator
            </p>
            <p className="text-xs text-slate-500 truncate">
              admin@shambatrack.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
