import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Farmer = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    phone: "",
    email: "",
    nid: "",
    location: "",
  });

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coop-admin/farmers");
      setFarmers(res.data.farmers || []);
    } catch (err) {
      console.error("Error cataloging directory profiles:", err);
      toast.error("Failed to fetch fresh farmer records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenCreateForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      username: "",
      password: "",
      phone: "",
      email: "",
      nid: "",
      location: "",
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (farmer) => {
    setEditingId(farmer.id);
    setForm({
      name: farmer.name || "",
      username: farmer.username || "",
      password: "",
      phone: farmer.phone || "",
      email: farmer.email || "",
      nid: farmer.nid || "",
      location: farmer.location || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const actionToast = toast.loading(
      editingId
        ? "Synchronizing edits..."
        : "Provisioning new member profile...",
    );

    try {
      if (editingId) {
        const patchPayload = { ...form };
        if (!patchPayload.password) delete patchPayload.password;

        await api.put(`/coop-admin/farmers/${editingId}`, patchPayload);
        toast.success("Farmer profile updated successfully!", {
          id: actionToast,
        });
      } else {
        await api.post("/coop-admin/farmers", form);
        toast.success("New farmer registered successfully!", {
          id: actionToast,
        });
      }

      setShowForm(false);
      setEditingId(null);
      fetchFarmers();
    } catch (err) {
      console.error("Processing transaction failure event:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to process record update safely.";
      toast.error(errorMessage, { id: actionToast });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const statusPromise = api.patch(`/coop-admin/farmers/${id}/status`);

    toast.promise(statusPromise, {
      loading: "Modifying account access status...",
      success: (res) => {
        setFarmers((prev) => {
          return prev.map((f) => {
            if (f.id === id) {
              return {
                ...f,
                status:
                  currentStatus === "active" ? "inactive" : "active",
              };
            }
            return f;
          });
        });

        return `Farmer account marked ${
          currentStatus === "active" ? "inactive" : "active"
        }!`;
      },
      error: (err) =>
        err.response?.data?.message ||
        "Failed to update user security credentials status.",
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Upper Layout Heading Actions Banner Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Farmer Database Directory
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Manage and audit member registries, profiles, and systemic workflow accounts.
          </p>
        </div>

        <button
          onClick={showForm ? () => setShowForm(false) : handleOpenCreateForm}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight shadow-sm transition-all duration-150 flex items-center justify-center gap-2 border ${
            showForm
              ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              : "bg-green-600 border-green-700 text-white hover:bg-green-700"
          }`}
        >
          {showForm ? "Cancel Operation" : "＋ Add Farmer"}
        </button>
      </div>

      {/* Input Field Control Form Module Panel Grid Layout */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-md space-y-5 animate-slideDown"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-700">
              {editingId
                ? "Modify Existing Profile Parameters"
                : "Provision New Member Registration Profile"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill out administrative identification properties correctly below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Full Legal Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                System Username Identity
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="e.g. jdoe_coop"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            {!editingId && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Account Access Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Mobile Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="e.g. +254 712 345678"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Contact Info (Optional)
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. john@shambatrack.com"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                National ID Identification / Passport
              </label>
              <input
                name="nid"
                value={form.nid}
                onChange={handleChange}
                required
                disabled={!!editingId}
                placeholder="e.g. 34291048"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition disabled:opacity-50"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Geographic Station Area / Location Base Address
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Sector 4, Block B, Southern Hillside Plots"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-green-500 bg-white transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 border border-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
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
              )}
              <span>
                {editingId
                  ? "Save Profile Adjustments"
                  : "Build Farmer Profile Instance"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Main Core Registry Data Presentation Layer Section Wrapper */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-medium animate-pulse space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto"></div>
          <p>Compiling database workspace registries...</p>
        </div>
      ) : farmers.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-500">
            No records found within this cooperative group space.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click the button above to begin logging operational assets.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                  <th className="px-6 py-4">Farmer Details</th>
                  <th className="px-6 py-4">Account Identity</th>
                  <th className="px-6 py-4">National ID Record</th>
                  <th className="px-6 py-4">Location Sector</th>
                  <th className="px-6 py-4 text-center">Operational Status</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
                {farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100">
                    
                    {/* Farmer Details Column */}
                    <td className="px-0 md:px-6 md:py-4">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Farmer Details:</span>
                      <div className="font-bold text-slate-800 text-sm md:text-base">{f.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{f.phone}</div>
                    </td>

                    {/* Account Identity Column */}
                    <td className="px-0 md:px-6 md:py-4">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Account Identity:</span>
                      <div className="font-mono text-xs text-slate-600">@{f.username}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{f.email || "—"}</div>
                    </td>

                    {/* National ID Record Column */}
                    <td className="px-0 md:px-6 md:py-4 font-medium text-slate-700">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">National ID:</span>
                      {f.nid}
                    </td>

                    {/* Location Sector Column */}
                    <td className="px-0 md:px-6 md:py-4 text-xs text-slate-500 md:max-w-[180px] md:truncate">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Location:</span>
                      {f.location || "Not configured"}
                    </td>

                    {/* Operational Status Column */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-center">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-2">Status:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 md:py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          f.status === "active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>

                    {/* Administrative Actions Column */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-right space-x-2 whitespace-nowrap mt-2 md:mt-0">
                      <button
                        onClick={() => handleOpenEditForm(f)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-2 md:py-1.5 rounded-lg transition inline-block"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(f.id, f.status)}
                        className={`text-xs font-bold px-3 py-2 md:py-1.5 rounded-lg transition inline-block ${
                          f.status === "active"
                            ? "text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80"
                            : "text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100/80"
                        }`}
                      >
                        {f.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farmer;