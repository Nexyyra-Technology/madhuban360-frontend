/**
 * Supervisor Dashboard – Figma: greeting, In Progress / Pending cards, Staff Online list
 * Route: /mobile/supervisor/dashboard
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getSupervisorTasks, getSupervisorStaff, getSupervisorDashboardStats } from "./supervisorService";
import { getNotifications } from "../notificationService";
import { getUserDisplayName, getGreeting } from "../../../lib/userUtils";
import logoIcon from "../../../assets/logo-icon.png";

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [staffOnline, setStaffOnline] = useState([]);
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
        const tasks = await getSupervisorTasks({});
        if (cancelled) return;
        const stats = getSupervisorDashboardStats(tasks);
        setInProgressCount(stats.inProgress ?? 0);
        setPendingCount(stats.pending ?? 0);
        const staff = await getSupervisorStaff(tasks);
        if (!cancelled) setStaffOnline(Array.isArray(staff) ? staff.slice(0, 8) : []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to fetch tasks");
          setInProgressCount(0);
          setPendingCount(0);
          setStaffOnline([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="supervisor-dashboard-page">
      <p className="supervisor-screen-title">Supervisor Dashboard</p>
      <header className="supervisor-dashboard-header">
        <div className="manager-avatar-wrap">
          <img src={logoIcon} alt="" className="manager-avatar" style={{ objectFit: "cover" }} />
        </div>
        <div className="manager-greeting-text">
          <h1 className="manager-greeting">
            {getGreeting()}, {getUserDisplayName(user, "Alex")}
          </h1>
          <p className="manager-location">📍 Madhuban Group</p>
        </div>
        <button
          type="button"
          className="manager-notify"
          aria-label="Notifications"
          onClick={() => navigate("/mobile/supervisor/notifications")}
        >
          🔔
          {unreadCount > 0 && (
            <span className="manager-notify-badge" aria-label={`${unreadCount} unread`}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      {loading && (
        <section className="manager-section">
          <p className="manager-loading">Loading dashboard…</p>
        </section>
      )}

      {error && !loading && (
        <section className="manager-section">
          <p className="manager-error manager-error-banner">{error} Showing offline view.</p>
        </section>
      )}

      {!loading && (
        <>
          <section className="manager-section supervisor-summary-section">
            <div className="manager-task-grid supervisor-summary-cards">
              <button
                type="button"
                className="supervisor-summary-card"
                onClick={() => navigate("/mobile/supervisor/in-progress")}
              >
                <div className="supervisor-summary-icon supervisor-summary-icon-blue">📄</div>
                <span className="manager-stat-value">{inProgressCount}</span>
                <span className="manager-stat-label">In Progress</span>
              </button>
              <button
                type="button"
                className="supervisor-summary-card"
                onClick={() => navigate("/mobile/supervisor/pending-tasks")}
              >
                <div className="supervisor-summary-icon supervisor-summary-icon-orange">⏱</div>
                <span className="manager-stat-value">{pendingCount}</span>
                <span className="manager-stat-label">Pending</span>
              </button>
            </div>
          </section>

          <section className="manager-section">
            <div className="supervisor-staff-online-head">
              <h3 className="manager-section-title">Staff Online</h3>
              <span className="supervisor-staff-active">
                <span className="supervisor-dot-green" /> {staffOnline.length} Team Members Active
              </span>
            </div>
            <div className="supervisor-staff-actions">
              <span className="supervisor-staff-avatar-placeholder">A</span>
              <button type="button" className="supervisor-search-btn" aria-label="Search">🔍</button>
            </div>
            <div className="manager-supervisor-list supervisor-staff-list">
              {staffOnline.length === 0 ? (
                <p className="manager-empty">No staff online.</p>
              ) : (
                staffOnline.map((s, i) => (
                  <div key={s.id ?? i} className="supervisor-staff-card">
                    <div className="manager-supervisor-card-avatar-wrap">
                      <div className="manager-supervisor-card-avatar" />
                      <span className="manager-status-dot" />
                    </div>
                    <div className="manager-supervisor-card-info">
                      <span className="manager-supervisor-card-name">{s.name}</span>
                      <span className="manager-supervisor-card-location">📍 {s.location || "Zone A: Lobby"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
