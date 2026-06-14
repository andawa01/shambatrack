import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function CoopAdmins() {
  const [admins, setAdmins] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  // State to handle form expansion toggle
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    coop_id: "",
  });

  const fetchAdmins = async () => {
    try {
      setTableLoading(true);
      const { data } = await api.get("/system/coop-admins");
      setAdmins(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cooperative administrators");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCooperatives = async () => {
    try {
      const { data } = await api.get("/system/cooperatives/options");
      setCooperatives(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmins();
    fetchCooperatives();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.username ||
      !formData.password ||
      !formData.coop_id
    ) {
      toast.error("Please fill in all configuration fields.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/system/coop-admin", formData);

      toast.success(data.message || "Cooperative admin created successfully!");

      setFormData({
        name: "",
        username: "",
        password: "",
        coop_id: "",
      });

      setShowForm(false); // Close form container cleanly
      fetchAdmins();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create coop admin",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Section Header with Action Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cooperative Admins
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provision and audit system authorization credentials for branch
            managers.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 shadow-sm ${
            showForm
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow"
          }`}
        >
          {showForm ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Add Coop Admin</span>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Administrative Form Card */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-6 max-w-5xl mx-auto transition-all duration-300 animate-slideDown">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              Assign New Cooperative Administrator
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5"
          >
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Jane Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="e.g., janedoe_coop"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Assigned Cooperative
              </label>
              <select
                name="coop_id"
                value={formData.coop_id}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150 appearance-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1.25rem",
                }}
              >
                <option value="">Select Option</option>
                {cooperatives.map((coop) => (
                  <option key={coop.id} value={coop.id}>
                    {coop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[180px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 transition shadow-sm text-sm sm:text-base"
              >
                {loading ? "Creating..." : "Save Administrator"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Infrastructure Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">
            System Management Registries
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                <th className="py-4 px-4 sm:px-6">Name</th>
                <th className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                  Username
                </th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">
                  Assigned Location
                </th>
                <th className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                  Account Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
              {tableLoading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        Fetching system accounts...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : admins.length > 0 ? (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-slate-50/80 transition-colors flex flex-col sm:table-row p-4 sm:p-0 border-b sm:border-b-0 border-slate-100 gap-1.5 sm:gap-0"
                  >
                    <td className="py-0 sm:py-4 px-0 sm:px-6 font-semibold text-slate-900 text-sm sm:text-base">
                      {admin.name}
                    </td>

                    <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-600 font-normal sm:table-cell">
                      <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                        Username:
                      </span>
                      {admin.username}
                    </td>

                    <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-700 md:table-cell">
                      <span className="inline md:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                        Location:
                      </span>
                      <div className="inline-flex sm:flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 hidden sm:inline-block"></span>
                        {admin.cooperative_name || "Unassigned"}
                      </div>
                    </td>

                    <td className="py-0 sm:py-4 px-0 sm:px-6 sm:table-cell mt-1 sm:mt-0">
                      <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5 align-middle">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide ${
                          admin.status?.toLowerCase() === "active" ||
                          !admin.status
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {admin.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-slate-400 font-normal"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        No cooperative administrators configured.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
