import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const FarmerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications/my");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load your notification stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  // 2. Mark as read
  const markAsRead = async (notificationId) => {
    if (!notificationId) return;
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.notification_id?._id === notificationId
            ? { ...item, is_read: true }
            : item,
        ),
      );
      toast.success("Notification cleared");
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error("Failed to update message state");
    }
  };

  // 3. Mark all as read helper
  const markAllAsRead = async () => {
    const unreadItems = notifications.filter((item) => !item.is_read);
    if (unreadItems.length === 0) return;

    try {
      // Loop through unread notifications sequentially or parallel depending on backend support
      await Promise.all(
        unreadItems.map((item) => {
          if (item.notification_id?._id) {
            return api.patch(`/notifications/${item.notification_id._id}/read`);
          }
          return Promise.resolve();
        }),
      );

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      toast.error("Could not batch clear notifications");
    }
  };

  // Utility helper to inject dynamic situational context icons based on keywords
  const getNotificationIcon = (title, message) => {
    const context = `${title} ${message}`.toLowerCase();
    if (
      context.includes("payment") ||
      context.includes("kes") ||
      context.includes("disbursement") ||
      context.includes("paid")
    ) {
      return {
        icon: "💸",
        bg: "bg-emerald-50 border-emerald-100 text-emerald-600",
      };
    }
    if (
      context.includes("delivery") ||
      context.includes("weigh") ||
      context.includes("kg") ||
      context.includes("quantity")
    ) {
      return { icon: "⚖️", bg: "bg-blue-50 border-blue-100 text-blue-600" };
    }
    if (
      context.includes("quality") ||
      context.includes("grade") ||
      context.includes("reject")
    ) {
      return { icon: "🔬", bg: "bg-amber-50 border-amber-100 text-amber-600" };
    }
    return { icon: "📢", bg: "bg-slate-50 border-slate-100 text-slate-600" };
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Syncing interactive communications...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 transition-all duration-300">
      {/* CONTEXT AREA TITLE BANNER */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wide">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Stay updated with harvesting logs, dynamic grade metrics, payment
            confirmations, and system alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full sm:w-auto text-center px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            🔄 Refresh Feed
          </button>
        </div>
      </div>

      {/* NOTIFICATION FEED WRAPPER */}
      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl mx-auto border border-slate-100">
            📭
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-700">Inbox Is Clear</h3>
            <p className="text-xs text-slate-400 font-medium">
              You do not have any incoming alerts or transactional records
              assigned to your index at this moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {notifications.map((item) => {
            const n = item.notification_id;
            const contextStyle = getNotificationIcon(
              n?.title || "",
              n?.message || "",
            );

            return (
              <div
                key={item._id}
                className={`group border rounded-2xl p-4 flex gap-4 items-start transition-all duration-200 relative overflow-hidden ${
                  item.is_read
                    ? "bg-slate-50/60 border-slate-100/80 opacity-75"
                    : "bg-white border-slate-200/80 shadow-xs hover:border-slate-300"
                }`}
              >
                {/* Active/Unread Highlight Indicator Strip */}
                {!item.is_read && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500" />
                )}

                {/* Left Side Icon Hex Ring Block */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base font-bold shrink-0 shadow-xs ${contextStyle.bg}`}
                >
                  {contextStyle.icon}
                </div>

                {/* Central Main Messaging Block */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3
                      className={`text-sm tracking-tight truncate ${item.is_read ? "font-semibold text-slate-600" : "font-extrabold text-slate-800"}`}
                    >
                      {n?.title || "System Bulletin"}
                    </h3>

                    {/* Timestamp Tag Placeholder - Formats from _id if explicit date key is not mapped */}
                    <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Recently"}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed max-w-2xl break-words ${item.is_read ? "text-slate-400 font-medium" : "text-slate-500 font-medium"}`}
                  >
                    {n?.message}
                  </p>

                  {/* Footing Operations Panel */}
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-100/60">
                    <span
                      className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider ${
                        item.is_read ? "text-slate-400" : "text-emerald-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_read ? "bg-slate-300" : "bg-emerald-500 animate-ping"}`}
                      />
                      {item.is_read ? "Archived Logs" : "Action Required"}
                    </span>

                    {!item.is_read && n?._id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n._id);
                        }}
                        className="text-[10px] font-bold tracking-wider bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all uppercase cursor-pointer transform active:scale-95"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmerNotifications;
