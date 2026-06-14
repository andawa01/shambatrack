import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AuditLogsCoop = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    action: "",
    entity: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.action) params.action = filters.action;
      if (filters.entity) params.entity = filters.entity;

      const { data } = await api.get("/coop-admin/audit-logs", { params });
      setLogs(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load ecosystem audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [filters]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadge = (action) => {
    const styles = {
      RECORD_DELIVERY: "bg-blue-50 text-blue-700 border-blue-200",
      PROCESS_PAYMENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CREATE_FARMER: "bg-purple-50 text-purple-700 border-purple-200",
      CREATE_PRODUCT: "bg-amber-50 text-amber-700 border-amber-200",
      SEND_NOTIFICATION: "bg-indigo-50 text-indigo-700 border-indigo-200",
      default: "bg-slate-50 text-slate-600 border-slate-200",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wide border uppercase inline-block ${
          styles[action] || styles.default
        }`}
      >
        {action?.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Recompiling platform system records...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* Structural Action Control Header Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            System Audit Engine
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Immutable operation logging logs verifying actions executed by
            authorized system cooperative operators.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="w-full sm:w-auto bg-slate-800 border border-slate-900 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-slate-900 shadow-sm transition text-center whitespace-nowrap"
        >
          Refresh Activity Stream
        </button>
      </div>

      {/* Grid Alignment Inline Parameter Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Action Class Scope
            </label>
            <div className="relative">
              <select
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-slate-400 bg-white appearance-none"
              >
                <option value="">All Filter Actions Available</option>
                <option value="RECORD_DELIVERY">🚜 Record Delivery</option>
                <option value="PROCESS_PAYMENT">💸 Process Payment</option>
                <option value="CREATE_FARMER">🧑‍🌾 Create Farmer</option>
                <option value="CREATE_PRODUCT">📦 Create Product</option>
                <option value="SEND_NOTIFICATION">📣 Send Notification</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Database Entity Context
            </label>
            <div className="relative">
              <select
                value={filters.entity}
                onChange={(e) =>
                  setFilters({ ...filters, entity: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-slate-400 bg-white appearance-none"
              >
                <option value="">All Entities Backlog</option>
                <option value="delivery">Delivery Indexes</option>
                <option value="payment">Payment Invoices</option>
                <option value="farmer">Farmer Profiles</option>
                <option value="product">Product Batches</option>
                <option value="notification">Broadcast Pipelines</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary History Logs Table System Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-sm">
            System Operations Stream
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-6 py-4">Timestamp String (EAT)</th>
                <th className="px-6 py-4">Account Actor User</th>
                <th className="px-6 py-4">Operation Method</th>
                <th className="px-6 py-4">Target Context</th>
                <th className="px-6 py-4">Client IP Route</th>
                <th className="px-6 py-4 text-right">Payload Manifest</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-600 flex flex-col md:table-row-group">
              {logs.length === 0 ? (
                <tr className="flex w-full justify-center text-center">
                  <td
                    colSpan="6"
                    className="text-center py-16 text-slate-400 font-medium w-full"
                  >
                    No corresponding platform state changes logged inside query
                    indexes.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id || log.id}
                    className="hover:bg-slate-50/40 transition flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0 border-b md:border-b-0 border-slate-100"
                  >
                    {/* Timestamp */}
                    <td className="px-0 md:px-6 md:py-4 font-semibold text-slate-500 text-xs whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Timestamp (EAT):
                      </span>
                      {formatDate(log.createdAt)}
                    </td>

                    {/* Actor User */}
                    <td className="px-0 md:px-6 md:py-4 font-bold text-slate-800 whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Actor User:
                      </span>
                      {log.user_name || log.user_id || "System Instance"}
                    </td>

                    {/* Action Badge */}
                    <td className="px-0 md:px-6 md:py-4 whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Operation Method:
                      </span>
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entity Context */}
                    <td className="px-0 md:px-6 md:py-4 font-mono text-xs whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Target Context:
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold uppercase text-[10px] inline-block">
                        {log.entity}
                      </span>
                    </td>

                    {/* IP Address */}
                    <td className="px-0 md:px-6 md:py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                      <span className="inline md:hidden text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                        Client IP Route:
                      </span>
                      {log.ip_address || "Internal Core Server Route"}
                    </td>

                    {/* Button Action */}
                    <td className="px-0 md:px-6 md:py-4 text-left md:text-right whitespace-nowrap pt-2 md:pt-0">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="w-full md:w-auto text-center text-xs font-bold uppercase tracking-wider px-3 py-2.5 md:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition"
                      >
                        Inspect Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Detailed JSON Inspector Modal Screen */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-800">
                  Operational Log Entry Analysis
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Comprehensive relational transaction tracking data output.
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Action Execution Tag
                  </span>
                  <span className="block font-bold text-slate-800 break-all">
                    {selectedLog.action}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Target Key Registry
                  </span>
                  <span className="block font-bold text-slate-800 capitalize">
                    {selectedLog.entity} Structure
                  </span>
                </div>
                <div className="space-y-1 pt-2 border-t sm:border-t border-slate-200/60">
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Identified Entity Primary Key
                  </span>
                  <span className="block font-mono font-medium text-slate-600 break-all">
                    {selectedLog.entity_id || "N/A Instance"}
                  </span>
                </div>
                <div className="space-y-1 pt-2 border-t sm:border-t-0 md:border-t-0 border-slate-200/60 sm:pt-2">
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Authenticated Account Actor
                  </span>
                  <span className="block font-bold text-slate-800 break-all">
                    {selectedLog.user_name || selectedLog.user_id}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Database Snapshot Timestamp
                </span>
                <p className="text-xs font-semibold text-slate-600">
                  {formatDate(selectedLog.createdAt)} (East Africa Standard
                  Time)
                </p>
              </div>

              <div className="space-y-2">
                <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  System State Change Manifest JSON Payload
                </span>
                <div className="relative rounded-xl overflow-hidden border border-slate-800">
                  <div className="bg-slate-900 px-4 py-1.5 text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 select-none">
                    Object View Mode
                  </div>
                  <pre className="bg-slate-950 text-emerald-400 p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-64 shadow-inner">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="w-full sm:w-auto text-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-5 py-3 sm:py-2.5 rounded-xl transition"
                >
                  Terminate Analysis View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsCoop;
