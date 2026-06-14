import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const FarmerAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/audit-logs/farmer");
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError("Failed to synchronize system security ledger data streams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionBadgeStyle = (action) => {
    if (!action) return "bg-slate-50 text-slate-500 border-slate-200";
    const act = action.toLowerCase();

    if (
      act.includes("create") ||
      act.includes("add") ||
      act.includes("submit")
    ) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (
      act.includes("update") ||
      act.includes("edit") ||
      act.includes("patch")
    ) {
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
    if (
      act.includes("delete") ||
      act.includes("remove") ||
      act.includes("reject")
    ) {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getActivityDescription = (log) => {
    switch (log.action) {
      case "LOGIN":
        return `${log.user_name} logged into the system`;
      case "CREATE_LOAN":
        return `${log.user_name} applied for a loan`;
      case "APPROVE_LOAN":
        return `Loan application was approved`;
      case "REJECT_LOAN":
        return `Loan application was rejected`;
      case "PAY_LOAN":
        return `Loan repayment was recorded`;
      case "SEND_NOTIFICATION":
        return `Notification was sent`;
      default:
        return `${log.user_name || "User"} performed ${log.action}`;
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          Ingesting secure audit trails...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-8 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-lg font-bold">
          ⚠️
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Sync Failure</h3>
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        </div>
        <button
          onClick={fetchLogs}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-white border border-rose-200 text-slate-700 rounded-xl shadow-xs hover:bg-rose-100 transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 transition-all duration-300">
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Security & Audit Registry
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1 sm:mt-0.5 max-w-2xl">
            Cryptographic log timeline reporting changes to your entities,
            transaction hashes, and systemic account adjustments.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-xs transition cursor-pointer text-center"
        >
          🔄 Refresh Activity Logs
        </button>
      </div>

      {/* AUDIT TABLE CONTAINER */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 text-xs tracking-tight uppercase">
            Immutable Core Node Logs
          </h2>
          <span className="bg-slate-900 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            SYS_LOG_ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider hidden md:table-row">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Trigger Action</th>
                <th className="px-5 py-3.5">System Entity Target</th>
                <th className="px-5 py-3.5">Activity Description</th>
                <th className="px-5 py-3.5 text-right">Structural Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 flex flex-col md:table-row-group">
              {logs.length === 0 ? (
                <tr className="flex w-full justify-center">
                  <td
                    colSpan="5"
                    className="text-center py-16 font-medium text-slate-400 w-full"
                  >
                    No security historical traces located within this node.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log._id;

                  return (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-slate-50/40 transition group flex flex-col md:table-row p-4 md:p-0 gap-2 md:gap-0">
                        {/* Timestamp Column */}
                        <td className="px-0 md:px-5 md:py-4 font-mono font-medium text-slate-400 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                            Timestamp:
                          </span>
                          {new Date(log.createdAt).toLocaleString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>

                        {/* Trigger Action Badge */}
                        <td className="px-0 md:px-5 md:py-4 whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                            Trigger Action:
                          </span>
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-black tracking-wide uppercase rounded-md border ${getActionBadgeStyle(log.action)}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Targeted Entity Model */}
                        <td className="px-0 md:px-5 md:py-4 font-bold text-slate-700 uppercase tracking-tight break-all">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                            System Entity Target:
                          </span>
                          {log.entity || "SYSTEM_NODE"}
                        </td>

                        {/* Description */}
                        <td className="px-0 md:px-5 md:py-4">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-0.5">
                            Activity Description:
                          </span>
                          <span className="font-semibold text-slate-700 block md:inline">
                            {getActivityDescription(log)}
                          </span>
                        </td>

                        {/* Structural Expand Metadata Details Button */}
                        <td className="px-0 md:px-5 md:py-4 text-left md:text-right whitespace-nowrap">
                          <span className="inline md:hidden font-bold text-slate-400 uppercase text-[9px] block mb-1">
                            Structural Specs:
                          </span>
                          {log.details &&
                          Object.keys(log.details).length > 0 ? (
                            <button
                              onClick={() => toggleExpandLog(log._id)}
                              className={`w-full md:w-auto px-3 py-1.5 md:py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border transition cursor-pointer text-center ${
                                isExpanded
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {isExpanded ? "Hide Metadata ▲" : "View Specs ▼"}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider select-none md:pr-3 block md:inline">
                              No Payload
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* CONDITIONAL METADATA NESTED JSON SECTION */}
                      {isExpanded && log.details && (
                        <tr className="bg-slate-50/50 flex flex-col md:table-row">
                          <td
                            colSpan="5"
                            className="px-4 sm:px-6 py-4 border-inner block md:table-cell"
                          >
                            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 shadow-inner space-y-2 max-w-full overflow-hidden">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2 gap-2">
                                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase font-mono text-slate-500 truncate">
                                  Decrypted Object Context Payload Matrix
                                </span>
                                <span className="text-[9px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-black shrink-0">
                                  JSON_UTF8
                                </span>
                              </div>
                              <pre className="text-[11px] font-mono font-semibold text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all sm:break-normal select-text">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmerAuditLogs;
