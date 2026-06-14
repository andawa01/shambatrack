import { NavLink } from "react-router-dom";

const FarmerSidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const menus = [
    {
      name: "Dashboard",
      path: "/farmer/dashboard",
      icon: "📊",
    },
    {
      name: "My Deliveries",
      path: "/farmer/deliveries",
      icon: "🚜",
    },
    {
      name: "Payments",
      path: "/farmer/payments",
      icon: "💸",
    },
    {
      name: "Wallet Balance",
      path: "/farmer/wallet",
      icon: "💳",
    },
    {
      name: "Apply Loan",
      path: "/farmer/loans",
      icon: "🏦",
      badge: "New",
    },
    {
      name: "Notifications",
      path: "/farmer/notifications",
      icon: "📣",
    },
    {
      name: "Profile",
      path: "/farmer/profile",
      icon: "🧑‍🌾",
    },
    {
      name: "AuditLogs",
      path: "/farmer/auditLogs",
      icon: "📜",
    },
  ];

  {
    isMenuOpen && (
      <div
        onClick={() => setIsMenuOpen(false)}
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
      />
    );
  }

  return (
    <div
      className={`
    fixed md:static top-0 left-0 z-50
    w-64 bg-slate-950 border-r border-slate-900 text-slate-200
    min-h-screen flex flex-col justify-between shrink-0
    transition-transform duration-300

    ${isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
    >
      {/* Brand & Identity Segment */}
      <div className="flex flex-col flex-1">
        <div className="p-5 border-b border-slate-900 flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 w-9 h-9 rounded-xl flex items-center justify-center text-base font-black shadow-md shadow-emerald-500/10">
            🌿
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none">
              ShambaTrack
            </h1>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5 block">
              Farmer Dashboard
            </span>
          </div>
        </div>

        {/* Updated Navigation Block: Spreads menus evenly down to the footer */}
        <nav className="p-4 flex-1 flex flex-col justify-between my-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-600 border border-emerald-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-80 group-hover:scale-110 transition duration-200">
                  {menu.icon}
                </span>
                <span>{menu.name}</span>
              </div>

              {/* Conditional Highlight Notification Pill */}
              {menu.badge && (
                <span className="bg-amber-400 border border-amber-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs animate-bounce">
                  {menu.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Persistent Help & Regulatory System Info Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-900/20">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Need Support?
          </p>
          <span className="block text-xs font-black text-white">
            0800-SHAMBA-HELP
          </span>
          <span className="block text-[8px] font-medium text-slate-500">
            v2.4.1 • Secure Core Endpoint
          </span>
        </div>
      </div>
    </div>
  );
};

export default FarmerSidebar;
