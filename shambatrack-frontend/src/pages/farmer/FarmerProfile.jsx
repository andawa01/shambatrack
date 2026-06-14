import { useEffect, useState } from "react";
import api from "../../api/axios";

const FarmerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/farmer/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to synchronize profile records from secure node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Decrypting identity ledger keys...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-lg font-bold">
          ⚠️
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Sync Failure</h3>
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        </div>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 text-xs font-bold bg-white border border-rose-200 text-slate-700 rounded-xl shadow-xs hover:bg-rose-100 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-16 text-center text-sm font-semibold text-slate-400">
        No historic profile index found for this route.
      </div>
    );
  }

  // Get generic initial character for fallback avatar icon graphic
  const profileInitial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "F";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 transition-all duration-300">
      {/* IDENTITY OVERVIEW CARD */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        {/* Subtle abstract background accent decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />

        {/* Dynamic Stylized Monogram Avatar Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 text-emerald-400 border border-slate-800 flex items-center justify-center text-2xl font-black shadow-md shrink-0">
          {profileInitial}
        </div>

        <div className="text-center sm:text-left space-y-1 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {profile.name}
            </h1>
            <span className="self-center sm:self-auto bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">
              {profile.role || "Member Farmer"}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            @{profile.username} • Account ID:{" "}
            <span className="font-mono font-bold text-slate-600">
              {profile.farmer_id?.substring(0, 8) || "N/A"}
            </span>
          </p>
        </div>

        <button
          onClick={fetchProfile}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition shrink-0 cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* OPERATIONAL FINANCIAL METRIC NODES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Metric Card: Wallet Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Liquid Account Capital
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              <span className="text-xs font-bold text-emerald-400 mr-0.5">
                KES
              </span>
              {Number(profile.wallet_balance || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 text-base flex items-center justify-center font-bold shadow-inner">
            💸
          </div>
        </div>

        {/* Metric Card: Loan Balance */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:border-rose-200 transition">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Outstanding Liability
            </span>
            <h2 className="text-2xl font-black text-rose-600 tracking-tight">
              <span className="text-xs font-bold text-rose-400 mr-0.5">
                KES
              </span>
              {Number(profile.loan_balance || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 text-base flex items-center justify-center font-bold">
            💳
          </div>
        </div>

        {/* Metric Card: Credit Loan Limit */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:border-emerald-200 transition sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Approved Credit Ceiling
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              <span className="text-xs font-bold text-slate-400 mr-0.5">
                KES
              </span>
              {Number(profile.loan_limit || 0).toLocaleString()}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-base flex items-center justify-center font-bold">
            🛡️
          </div>
        </div>
      </div>

      {/* STRUCTURAL INFORMATION REGISTRY */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Registry File Identity Matrix
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Primary Phone Line */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Primary Communications Terminal
            </label>
            <div className="bg-slate-50/60 border border-slate-100 px-4 py-3 rounded-xl font-mono font-bold text-slate-800 flex items-center justify-between">
              <span>{profile.phone || "No Number Linked"}</span>
              <span className="text-xs">📞</span>
            </div>
          </div>

          {/* Assigned Cooperative Hub */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Cooperative Hub
            </label>
            <div className="bg-slate-50/60 border border-slate-100 px-4 py-3 rounded-xl font-semibold text-slate-700 flex items-center justify-between">
              <span className="truncate">
                {profile.cooperative_name || "Independent Terminal Node"}
              </span>
              <span className="text-xs">🏢</span>
            </div>
          </div>

          {/* Access Security Token Role Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Node Permission Level
            </label>
            <div className="bg-slate-50/60 border border-slate-100 px-4 py-3 rounded-xl font-bold text-slate-600 uppercase text-xs tracking-wider">
              🛡️ {profile.role || "Standard Profile"}
            </div>
          </div>

          {/* Core System Verification Indicator */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Ledger Cryptographic Attestation
            </label>
            <div className="bg-emerald-50/40 border border-emerald-100 px-4 py-3 rounded-xl font-bold text-emerald-700 text-xs tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Core Network Node
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
