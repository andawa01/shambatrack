import { useNavigate } from "react-router-dom";
import { useState } from "react";

const FarmerNavbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // Safely extract the first letter of the user's name for the profile badge
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "🧑‍🌾";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="shrink-0 w-full bg-slate-900 border-b border-slate-100 px-4 sm:px-6 py-3.5 flex justify-between items-center z-40">
      {/* Brand / Context Title */}
      <div className="flex items-center gap-2.5">
        <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl text-lg font-bold select-none">
          🌾
        </div>
        <div>
          <h1 className="font-black text-slate-400 text-base sm:text-lg tracking-tight leading-none">
            Farmer Portal
          </h1>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            Management System
          </span>
        </div>
      </div>

      {/* Right Side Controls & Profile Group */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Profile Identity Info Card */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 py-1.5 pl-2.5 pr-4 rounded-xl hidden sm:flex">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
            {userInitial}
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-800 leading-tight">
              {user?.name || "Cooperative Producer"}
            </span>
            <span className="block text-[9px] font-mono font-medium text-slate-400">
              {user?.role || "Verified Farmer"}
            </span>
          </div>
        </div>

        {/* Action Button Segment */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold text-xs uppercase tracking-wider px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition duration-200 whitespace-nowrap"
          >
            Sign Out
          </button>
        ) : (
          /* Inline Confirmation State to Prevent Accidental Sign-outs */
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-1 rounded-xl animate-fadeIn">
            <span className="text-[10px] font-bold text-rose-700 px-2 uppercase tracking-wide hidden md:inline">
              Are you sure?
            </span>
            <button
              onClick={handleLogout}
              className="bg-rose-600 border border-rose-700 text-white font-black text-xs uppercase tracking-wide px-2.5 py-1.5 rounded-lg hover:bg-rose-700 transition whitespace-nowrap"
            >
              Yes, Exit
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition"
        >
          {isMenuOpen ? "✖" : "☰"}
        </button>
      </div>
    </header>
  );
};

export default FarmerNavbar;
