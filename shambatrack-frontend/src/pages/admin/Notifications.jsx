import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    channel: "sms",
    farmer_ids: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifRes, farmerRes] = await Promise.all([
        api.get("/notifications/coop"),
        api.get("/coop-admin/farmers"),
      ]);

      setNotifications(notifRes.data || []);
      setFarmers(farmerRes.data.farmers || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load historical communications broadcast log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);

    const request = api.post("/notifications/send", form);

    toast.promise(request, {
      loading: "Broadcasting communication payload to network routes...",
      success: () => {
        setShowModal(false);
        setForm({
          title: "",
          message: "",
          channel: "sms",
          farmer_ids: [],
        });
        fetchData();
        setSending(false);
        return "Communications dispatched successfully";
      },
      error: (err) => {
        setSending(false);
        return err.response?.data?.message || "Transmission interface error";
      },
    });
  };

  const toggleFarmer = (id) => {
    setForm((prev) => {
      const exists = prev.farmer_ids.includes(id);
      return {
        ...prev,
        farmer_ids: exists
          ? prev.farmer_ids.filter((f) => f !== id)
          : [...prev.farmer_ids, id],
      };
    });
  };

  const selectAllFarmers = () => {
    setForm((prev) => ({
      ...prev,
      farmer_ids: farmers.map((f) => f.id),
    }));
  };

  const clearAllFarmers = () => {
    setForm((prev) => ({ ...prev, farmer_ids: [] }));
  };

  const getChannelBadge = (channel) => {
    const ch = channel?.toLowerCase() || "";
    if (ch === "sms") return "bg-sky-50 text-sky-700 border-sky-100";
    if (ch === "app") return "bg-purple-50 text-purple-700 border-purple-100";
    return "bg-indigo-50 text-indigo-700 border-indigo-100";
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Syncing distribution dispatch protocols...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Banner Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Broadcast & Notifications
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Transmit real-time alerts, market valuation changes, or weather
            warnings to cooperative members.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-green-600 border border-green-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-green-700 shadow-sm transition text-center whitespace-nowrap"
        >
          ＋ Create Outbound Broadcast
        </button>
      </div>

      {/* Historic Logs Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-700 text-sm">
            Historical Broadcast Ledger
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-6 py-4">Subject Title</th>
                <th className="px-6 py-4">Message Content Snippet</th>
                <th className="px-6 py-4">Route Channel</th>
                <th className="px-6 py-4 text-emerald-600">Dispatched</th>
                <th className="px-6 py-4 text-rose-600">Failed</th>
                <th className="px-6 py-4 text-blue-600">Acknowledged</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
              {notifications.length === 0 ? (
                <tr className="flex w-full justify-center text-center">
                  <td
                    colSpan="6"
                    className="text-center py-16 text-slate-400 font-medium w-full"
                  >
                    No historical logs captured inside outbox context registry.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr
                    key={n._id || n.id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100"
                  >
                    {/* Subject Title */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-slate-800 text-sm md:text-base whitespace-normal md:whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Subject Title:
                      </span>
                      {n.title}
                    </td>

                    {/* Message Content Snippet */}
                    <td
                      className="px-0 md:px-6 md:py-4 text-slate-500 max-w-xs truncate whitespace-normal md:whitespace-nowrap"
                      title={n.message}
                    >
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Message Content:
                      </span>
                      {n.message}
                    </td>

                    {/* Route Channel */}
                    <td className="px-0 md:px-6 md:py-4 whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Route Channel:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-block ${getChannelBadge(n.channel)}`}
                      >
                        {n.channel === "both" ? "📱 SMS + 🖥️ App" : n.channel}
                      </span>
                    </td>

                    {/* Dispatched */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-emerald-600">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Dispatched lines:
                      </span>
                      {n.stats?.sent || 0} lines
                    </td>

                    {/* Failed */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-rose-500">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Failed lines:
                      </span>
                      {n.stats?.failed || 0} lines
                    </td>

                    {/* Acknowledged */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-blue-600">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Acknowledged users:
                      </span>
                      {n.stats?.read || 0} users
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Composition Modal Sheet Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-800">
                  Compose Network Broadcast
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Specify criteria parameters to deliver dynamic gateway
                  updates.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Broadcast Header Subject Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Emergency Fertilizer Subsidy Pickup Alert"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-green-600 bg-white transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Transmission Medium Route
                  </label>
                  <div className="relative">
                    <select
                      value={form.channel}
                      onChange={(e) =>
                        setForm({ ...form, channel: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-green-600 bg-white appearance-none"
                    >
                      <option value="sms">📱 SMS Cellular Route</option>
                      <option value="app">🖥️ In-App Panel Feed</option>
                      <option value="both">⚡ Direct Dual Route (Both)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Notification Body Message Payload
                </label>
                <textarea
                  placeholder="Draft your communication bulletin parameters here explicitly..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-green-600 bg-white transition"
                  rows="3"
                  maxLength="160"
                  required
                />
                <div className="text-right text-[10px] font-bold text-slate-400">
                  {form.message.length}/160 Characters Max Standard Limit
                </div>
              </div>

              {/* Target Demographic Section */}
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                <div className="p-3 bg-slate-100/50 border-b border-slate-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">
                      Target Demographic Segment Routing
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      Leave unselected to push pipeline updates to all system
                      operators.
                    </p>
                  </div>

                  <div className="flex gap-1.5 text-[10px] font-bold uppercase tracking-wide w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={selectAllFarmers}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 transition"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllFarmers}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-rose-600 hover:bg-rose-50 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="p-3 max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {farmers.map((f) => {
                    const isChecked = form.farmer_ids.includes(f.id);
                    return (
                      <label
                        key={f.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer select-none text-xs font-semibold transition ${
                          isChecked
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                            : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFarmer(f.id)}
                          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-slate-300 accent-green-600"
                        />
                        <div className="truncate">
                          <span className="block font-bold truncate">
                            {f.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {f.phone || "No Mobile Attached"}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions Footer Panel */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto text-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 px-4 py-3 sm:py-2.5 rounded-xl transition"
                >
                  Close Panel
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-green-600 border border-green-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 sm:py-2.5 rounded-xl hover:bg-green-700 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>Transmit Broadcast Outbound</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
