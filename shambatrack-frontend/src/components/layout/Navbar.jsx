import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar({
  isMenuOpen = false,
  setIsMenuOpen = () => {},
}) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const adminInitial = user?.name ? user.name.charAt(0).toUpperCase() : "⚙️";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex justify-between items-center shadow-lg">
      {/* Brand Context Header Area */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="bg-emerald-500 text-slate-950 w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shadow-md shrink-0">
          🏢
        </div>
        <div className="min-w-0">
          <h1 className="font-black text-white text-sm tracking-tight leading-none sm:text-lg truncate">
            CoopAdmin{" "}
            <span className="text-emerald-400 font-medium text-xs sm:text-sm">
              OS
            </span>
          </h1>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block truncate">
            Cooperative Management
          </span>
        </div>
      </div>

      {/* Control Actions (Profile, Logout, and Hamburger Trigger) */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Profile Pill */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-800/60 border border-slate-800 py-1.5 pl-2.5 pr-4 rounded-xl">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 flex items-center justify-center text-xs font-black">
              {adminInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-100 leading-tight">
              {user?.name || "Administrator"}
            </span>
            <span className="block text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wide mt-0.5">
              {user?.role || "System Operator"}
            </span>
          </div>
        </div>

        {/* Dynamic Outbound Trigger Segment */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 hover:border-rose-900/60 font-bold text-[11px] sm:text-xs uppercase tracking-wider px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition duration-200 whitespace-nowrap"
          >
            Log Out
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-900/60 p-1 rounded-xl">
            <button
              onClick={handleLogout}
              className="bg-rose-600 border border-rose-700 text-white font-black text-[10px] sm:text-xs uppercase tracking-wide px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-rose-700 transition whitespace-nowrap shadow-sm"
            >
              Exit
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-slate-800 border border-slate-700 text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-wide px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-700 transition whitespace-nowrap"
            >
              No
            </button>
          </div>
        )}

        {/* Integrated Mobile Menu Button (No overlapping issues!) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
