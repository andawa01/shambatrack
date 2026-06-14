import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Cooperatives() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [cooperatives, setCooperatives] = useState([]);

  // State to manage showing/hiding the form
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });

  const fetchCooperatives = async () => {
    try {
      setTableLoading(true);
      const { data } = await api.get("/system/cooperatives");
      setCooperatives(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cooperatives");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

    if (!formData.name || !formData.email || !formData.contact) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/system/cooperatives", formData);

      toast.success(data.message || "Cooperative created successfully!");

      setFormData({
        name: "",
        email: "",
        contact: "",
      });

      setShowForm(false); // Hide form after successful creation
      fetchCooperatives();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to create cooperative",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Section Header with Responsive Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cooperatives Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register new cooperatives and supervise current listings.
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Cooperative</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Form Card */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-6 max-w-4xl mx-auto transition-all duration-300 animate-slideDown">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              New Cooperative Registration
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5"
          >
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Cooperative Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Highland Coffee Union"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g., contact@highland.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                name="contact"
                placeholder="e.g., +254 700 000 000"
                value={formData.contact}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition duration-150"
              />
            </div>

            <div className="md:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[160px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 transition shadow-sm text-sm sm:text-base"
              >
                {loading ? "Registering..." : "Save Cooperative"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table Segment */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">
            Active Cooperatives
          </h2>
        </div>

        <div className="overflow-x-auto">
          {/* Main Table Structure */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                <th className="py-4 px-4 sm:px-6">Name</th>
                <th className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                  Email
                </th>
                <th className="py-4 px-4 sm:px-6 hidden md:table-cell">
                  Contact Details
                </th>
                <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">
                  Registered Date
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
                        Fetching cooperatives list...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : cooperatives.length > 0 ? (
                cooperatives.map((coop) => (
                  <tr
                    key={coop.id}
                    className="hover:bg-slate-50/80 transition-colors flex flex-col sm:table-row p-4 sm:p-0 border-b sm:border-b-0 border-slate-100 gap-1 sm:gap-0"
                  >
                    {/* Primary data context displayed everywhere */}
                    <td className="py-0 sm:py-4 px-0 sm:px-6 font-semibold text-slate-900 text-sm sm:text-base">
                      {coop.name}
                    </td>

                    {/* Secondary values display stacked layout elements on tiny screens */}
                    <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-600 font-normal sm:table-cell">
                      <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                        Email:
                      </span>
                      {coop.email}
                    </td>

                    <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-600 font-normal md:table-cell">
                      <span className="inline md:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                        Contact:
                      </span>
                      {coop.contact}
                    </td>

                    <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-500 font-normal lg:table-cell">
                      <span className="inline lg:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                        Registered:
                      </span>
                      {coop.created_at
                        ? new Date(coop.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "—"}
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
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4m-8 0H4"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">
                        No cooperatives available on system records.
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
