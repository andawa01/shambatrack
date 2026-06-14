import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering states mapping straight to your controller
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  // Tracking expanded JSON logs individually
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Constructing search params based on user filters
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;

      const { data } = await api.get("/audit-logs", { params });
      setLogs(data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      toast.error("Failed to synchronize administrative activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [actionFilter, entityFilter]);

  // Helper to visually flag unsafe vs safe methods or actions
  const getActionStyles = (action) => {
    const act = action?.toUpperCase() || "";
    if (act.includes("CREATE") || act.includes("POST") || act.includes("ADD")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (
      act.includes("DELETE") ||
      act.includes("REMOVE") ||
      act.includes("REJECT")
    ) {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }
    if (
      act.includes("UPDATE") ||
      act.includes("PUT") ||
      act.includes("PATCH") ||
      act.includes("EDIT")
    ) {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System Audit Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable ledger tracking security operations, updates, and
            configuration adjustments.
          </p>
        </div>

        {/* Dynamic Log Count Badge */}
        {!loading && (
          <div className="self-start sm:self-auto bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
            Showing Last {logs.length} Operations
          </div>
        )}
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Action Filter
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE / ADD</option>
            <option value="UPDATE">UPDATE / EDIT</option>
            <option value="DELETE">DELETE / REMOVE</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Entity Target
          </label>
          <input
            type="text"
            placeholder="e.g., COOP_ADMIN, COOPERATIVE"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition"
          />
        </div>

        <div className="sm:col-span-2 md:col-span-1 flex justify-end">
          <button
            onClick={() => {
              setActionFilter("");
              setEntityFilter("");
            }}
            className="w-full text-center text-xs font-semibold tracking-wide text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table Layer */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70 hidden sm:table-row">
                <th className="py-4 px-6 w-1/5">Timestamp</th>
                <th className="py-4 px-6">Action Flag</th>
                <th className="py-4 px-6">Entity Context</th>
                <th className="py-4 px-6">Author Ref</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700 flex flex-col sm:table-row-group">
              {loading ? (
                <tr className="w-full">
                  <td
                    colSpan="5"
                    className="py-16 text-center text-slate-400 w-full"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-6 w-6 text-green-600"
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
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        Querying immutable logs database...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const logId = log._id || log.id;
                  const isExpanded = expandedLogId === logId;

                  return (
                    <React.Fragment key={logId}>
                      <tr className="hover:bg-slate-50/50 transition-colors group flex flex-col sm:table-row p-4 sm:p-0 border-b sm:border-b-0 border-slate-100 gap-2 sm:gap-0">
                        {/* Timestamp */}
                        <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-500 font-normal whitespace-nowrap">
                          <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                            Timestamp:
                          </span>
                          {new Date(log.createdAt).toLocaleDateString()}{" "}
                          &middot;{" "}
                          <span className="text-xs text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Action Badge */}
                        <td className="py-0 sm:py-4 px-0 sm:px-6">
                          <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5 align-middle">
                            Action:
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold tracking-wide border ${getActionStyles(log.action)}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Entity Target */}
                        <td className="py-0 sm:py-4 px-0 sm:px-6 text-slate-800 font-semibold sm:font-bold">
                          <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5">
                            Target:
                          </span>
                          {log.entity}
                        </td>

                        {/* Author Ref */}
                        <td className="py-0 sm:py-4 px-0 sm:px-6">
                          <span className="inline sm:hidden text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1.5 align-middle">
                            Author:
                          </span>
                          <span className="font-mono text-[10px] sm:text-xs text-slate-600 bg-slate-100 px-2 py-0.5 sm:py-1 rounded border border-slate-200">
                            {log.user_id
                              ? String(log.user_id).slice(-8)
                              : "SYSTEM"}
                          </span>
                        </td>

                        {/* Details Control Action */}
                        <td className="py-0 sm:py-4 px-0 sm:px-6 text-left sm:text-right mt-1 sm:mt-0">
                          <button
                            onClick={() => toggleExpandLog(logId)}
                            className="w-full sm:w-auto text-xs font-bold inline-flex items-center justify-center gap-1 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition"
                          >
                            <span>
                              {isExpanded ? "Hide Details" : "View Details"}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-3.5 w-3.5 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View Payload Inspector Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-t border-b border-slate-100 flex flex-col sm:table-row w-full">
                          <td colSpan="5" className="p-3 sm:p-6 w-full">
                            <div className="bg-slate-900 rounded-xl p-3 sm:p-4 shadow-inner max-w-4xl mx-auto border border-slate-800 w-full overflow-hidden">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[10px] sm:text-xs text-slate-400 font-mono gap-1">
                                <span className="truncate">
                                  Full Metadata Payload (ID: {logId})
                                </span>
                                <span className="text-emerald-400 self-start sm:self-auto">
                                  application/json
                                </span>
                              </div>
                              <div className="overflow-x-auto w-full">
                                <pre className="text-[11px] sm:text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed break-all sm:break-normal">
                                  {JSON.stringify(
                                    log.details || {
                                      message:
                                        "No supplementary tracking data available.",
                                    },
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr className="w-full">
                  <td
                    colSpan="5"
                    className="py-16 text-center text-slate-400 font-normal w-full"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5 p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 012-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-slate-500">
                        No operations matched your parameters.
                      </span>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Try resetting your Action or Entity criteria filters
                        above to pull historical system data.
                      </p>
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
