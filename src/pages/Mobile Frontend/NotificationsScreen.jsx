/**
 * NotificationsScreen – Notification list for mobile (staff & manager)
 * -----------------------------------------------------------------------
 * - Figma design: header with back, filters (All | Unread), grouped list (Today | Earlier)
 * - Data from backend: getNotifications(isManager)
 * - Route: /mobile/notifications (staff) | /mobile/manager/notifications
 * - Linked from notification bell on dashboard pages
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileBottomNav from "./End user screen/MobileBottomNav";
import ManagerBottomNav from "./manager Screen/ManagerBottomNav";
import SupervisorBottomNav from "./Supervisor Screen/SupervisorBottomNav";
import { getNotifications } from "./notificationService";

const NOTIFICATION_ICONS = {
  task_assigned: { icon: "✓", bg: "#dbeafe", color: "#1d4ed8" },
  critical: { icon: "!", bg: "#fff7ed", color: "#ea580c", border: "#fdba74" },
  verification: { icon: "✓", bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
  maintenance: { icon: "🕐", bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" },
  task_completed: { icon: "✓", bg: "#dbeafe", color: "#1d4ed8" },
  default: { icon: "•", bg: "#f3f4f6", color: "#6b7280" },
};

function getIconConfig(type) {
  return NOTIFICATION_ICONS[type] ?? NOTIFICATION_ICONS.default;
}

function formatRelativeTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24 && notifDay.getTime() === today.getTime()) return `${diffH}h ago`;
  if (notifDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function groupByDate(notifications) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = [];
  const earlier = [];

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    if (d >= todayStart) {
      today.push(n);
    } else {
      earlier.push(n);
    }
  });

  return { today, earlier };
}

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupervisor = location.pathname.startsWith("/mobile/supervisor/");
  const isManager = location.pathname.startsWith("/mobile/manager/");
  const backPath = isSupervisor ? "/mobile/supervisor/dashboard" : isManager ? "/mobile/manager/dashboard" : "/mobile/dashboard";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  useEffect(() => {
    getNotifications(isManager)
      .then(({ list }) => setNotifications(Array.isArray(list) ? list : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [isManager, isSupervisor]);

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const { today, earlier } = groupByDate(filtered);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const BottomNav = isSupervisor ? SupervisorBottomNav : isManager ? ManagerBottomNav : MobileBottomNav;

  return (
    <div className={`mobile-end-user-screen ${isManager || isSupervisor ? "manager-screen" : ""}`}>
      <header className="notifications-header">
        <button type="button" className="notifications-back" onClick={() => navigate(backPath)} aria-label="Back">
          ←
        </button>
        <h1 className="notifications-title">Notifications</h1>
      </header>

      {isManager && <span className="notifications-subtitle">Supervisor Notifications</span>}

      <div className="notifications-filters">
        <button
          type="button"
          className={`notifications-filter-pill ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`notifications-filter-pill ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>
      </div>

      <div className="notifications-list">
        {loading ? (
          <p className="notifications-loading">Loading notifications...</p>
        ) : filtered.length === 0 ? (
          <p className="notifications-empty">No notifications</p>
        ) : (
          <>
            {today.length > 0 && (
              <section className="notifications-group">
                <div className="notifications-group-head">
                  <h3>Today</h3>
                  <span className="notifications-group-badge">{today.length} Active</span>
                </div>
                {today.map((n) => (
                  <NotificationItem key={n.id} notification={n} config={getIconConfig(n.type)} isManager={isManager} isSupervisor={isSupervisor} onNavigate={navigate} />
                ))}
              </section>
            )}
            {earlier.length > 0 && (
              <section className="notifications-group">
                <div className="notifications-group-head">
                  <h3>Earlier</h3>
                </div>
                {earlier.map((n) => (
                  <NotificationItem key={n.id} notification={n} config={getIconConfig(n.type)} isManager={isManager} isSupervisor={isSupervisor} onNavigate={navigate} />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function NotificationItem({ notification, config, isManager, isSupervisor, onNavigate }) {
  const { id, title, description, createdAt, read, entityType, entityId } = notification;
  const style = {
    backgroundColor: config.bg,
    color: config.color,
    border: config.border ? `2px solid ${config.border}` : "none",
  };

  const isTaskNotification = entityType === "task" || ["task_completed", "task_assigned"].includes(notification.type || "");
  const canNavigate = (isManager || isSupervisor) && isTaskNotification && entityId;
  const handleClick = () => {
    if (canNavigate) {
      onNavigate(isSupervisor ? "/mobile/supervisor/tasks" : "/mobile/manager/tasks");
    }
  };

  return (
    <div
      className={`notification-item ${read ? "read" : ""} ${canNavigate ? "notification-item-clickable" : ""}`}
      role={canNavigate ? "button" : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => canNavigate && (e.key === "Enter" || e.key === " ") && handleClick()}
    >
      <div className="notification-icon" style={style}>
        {config.icon}
      </div>
      <div className="notification-body">
        <strong>{title}</strong>
        <p>{description}</p>
        <span className="notification-time">{formatRelativeTime(createdAt)}</span>
      </div>
      {!read && <span className="notification-unread-dot" aria-hidden />}
    </div>
  );
}
