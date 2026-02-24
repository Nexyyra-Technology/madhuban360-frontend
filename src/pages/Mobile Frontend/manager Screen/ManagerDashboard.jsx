/**
 * ManagerDashboard – Main dashboard for facility managers
 * -----------------------------------------------------------------------
 * - Header: profile pic, greeting, location, notification bell
 * - Task summary cards: from backend /api/tasks
 * - Supervisor Performance: from /api/users/supervisors + task completion
 * - Recent Activity: derived from tasks
 * - Route: /mobile/manager/dashboard
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManagerBottomNav from "./ManagerBottomNav";
import { useAuth } from "../../../context/AuthContext";
import logoIcon from "../../../assets/logo-icon.png";
import {
  getManagerTasks,
  computeDashboardFromTasks,
  computeRecentActivity,
  getManagerSupervisors,
} from "./managerService";
import { getNotifications } from "../notificationService";
import { getUserDisplayName, getGreeting } from "../../../lib/userUtils";

const STAT_ICONS = [
  { label: "Total tasks", icon: "📄", iconBg: "bg-blue-100" },
  { label: "Completed", icon: "✓", iconBg: "bg-green-100" },
  { label: "Pending Approval", icon: "✓", iconBg: "bg-purple-100" },
  { label: "Pending", icon: "⏱", iconBg: "bg-amber-100" },
  { label: "Overdue", icon: "⚠", iconBg: "bg-red-100" },
];

const SUPERVISOR_COLORS = ["bg-blue-500", "bg-green-500", "bg-amber-500", "bg-purple-500"];

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    pendingApproval: 0,
    completedPct: 0,
  });
  const [supervisors, setSupervisors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotifications(true)
      .then(({ unreadCount: c }) => setUnreadCount(c ?? 0))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
        try {
        const tasks = await getManagerTasks({});
        const supList = await getManagerSupervisors(tasks).catch(() => []);
        if (cancelled) return;
        const stats = computeDashboardFromTasks(tasks);
        setTaskStats({
          total: stats.total,
          completed: stats.completed,
          pending: stats.pending,
          overdue: stats.overdue,
          pendingApproval: stats.pendingApproval ?? 0,
          completedPct: stats.completedPct,
        });
        setSupervisors(supList);
        setRecentActivity(computeRecentActivity(tasks));
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load dashboard");
          setTaskStats({ total: 0, completed: 0, pending: 0, overdue: 0, pendingApproval: 0, completedPct: 0 });
          setSupervisors([]);
          setRecentActivity([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const taskStatCards = [
    { ...STAT_ICONS[0], value: taskStats.total },
    {
      ...STAT_ICONS[1],
      value: taskStats.completed,
      badge: taskStats.total > 0 ? `${taskStats.completedPct}%` : null,
    },
    { ...STAT_ICONS[2], value: taskStats.pendingApproval },
    { ...STAT_ICONS[3], value: taskStats.pending },
    { ...STAT_ICONS[4], value: taskStats.overdue },
  ];

  return (
    <div className="mobile-end-user-screen manager-screen">
      <header className="manager-header">
        <div className="manager-greeting-block">
          <div className="manager-avatar-wrap">
            <img src={logoIcon} alt="" className="manager-avatar" style={{ objectFit: "cover" }} />
          </div>
          <div className="manager-greeting-text">
            <h1 className="manager-greeting">
              {getGreeting()}, {getUserDisplayName(user, "Manager")}
            </h1>
            <p className="manager-location">📍 Madhuban Group</p>
          </div>
          <button
            type="button"
            className="manager-notify"
            aria-label="Notifications"
            onClick={() => navigate("/mobile/manager/notifications")}
          >
            🔔
            {unreadCount > 0 && (
              <span className="manager-notify-badge" aria-label={`${unreadCount} unread`}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {loading && (
        <section className="manager-section">
          <p className="manager-loading">Loading dashboard…</p>
        </section>
      )}

      {error && !loading && (
        <section className="manager-section">
          <p className="manager-error">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="manager-section">
            <div className="manager-task-grid">
              {taskStatCards.map((stat) => (
                <div key={stat.label} className="manager-stat-card">
                  {stat.badge && (
                    <span className="manager-stat-badge">{stat.badge}</span>
                  )}
                  <div className={`manager-stat-icon ${stat.iconBg}`}>{stat.icon}</div>
                  <span className="manager-stat-value">{stat.value}</span>
                  <span className="manager-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="manager-section">
            <h3 className="manager-section-title">Supervisor Performance</h3>
            <div className="manager-supervisor-list">
              {supervisors.length === 0 ? (
                <p className="manager-empty">No supervisors found.</p>
              ) : (
                supervisors.map((s, i) => (
                  <div key={s.id ?? s.name ?? i} className="manager-supervisor-row">
                    <div className="manager-supervisor-avatar" />
                    <div className="manager-supervisor-info">
                      <span className="manager-supervisor-name">{s.name}</span>
                      <div className="manager-progress-wrap">
                        <div className="manager-progress-track">
                          <div
                            className={`manager-progress-fill ${SUPERVISOR_COLORS[i % SUPERVISOR_COLORS.length]}`}
                            style={{ width: `${s.taskCompletion ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="manager-supervisor-percent">
                      {s.taskCompletion ?? 0}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="manager-section">
            <h3 className="manager-section-title">Recent Activity</h3>
            <div className="manager-activity-list">
              {recentActivity.length === 0 ? (
                <p className="manager-empty">No recent activity.</p>
              ) : (
                recentActivity.map((a, i) => (
                  <div key={i} className={`manager-activity-item ${a.type}`}>
                    <span className="manager-activity-icon">{a.icon}</span>
                    <div className="manager-activity-text">
                      <strong>{a.title}</strong>
                      <span>{a.sub}</span>
                    </div>
                    <span className="manager-activity-time">{a.time}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      <ManagerBottomNav />
    </div>
  );
}
