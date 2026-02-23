/**
 * ManagerDashboard – Main dashboard for facility managers
 * -----------------------------------------------------------------------
 * - Header: profile pic, greeting, location, notification bell
 * - Task summary cards: Total (128), Completed (92, 72%), Pending (24), Overdue (12)
 * - Supervisor Performance: progress bars with percentages
 * - Recent Activity: list with status icons
 * - Route: /mobile/manager/dashboard
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerBottomNav from "./ManagerBottomNav";
import { useAuth } from "../../../context/AuthContext";
import logoIcon from "../../../assets/logo-icon.png";

const TASK_STATS = [
  { label: "Total tasks", value: 128, icon: "📄", iconBg: "bg-blue-100" },
  { label: "Completed", value: 92, icon: "✓", iconBg: "bg-green-100", badge: "72%" },
  { label: "Pending", value: 24, icon: "⏱", iconBg: "bg-amber-100" },
  { label: "Overdue", value: 12, icon: "⚠", iconBg: "bg-red-100" },
];

const SUPERVISORS = [
  { name: "Marcus Chen", percent: 88, color: "bg-blue-500" },
  { name: "Elena Rodriguez", percent: 94, color: "bg-green-500" },
  { name: "David Miller", percent: 62, color: "bg-amber-500" },
];

const RECENT_ACTIVITY = [
  { title: "Elevator B2 Fixed", sub: "Completed by Maintenance Team A", time: "12m ago", icon: "✓", type: "success" },
  { title: "Overdue: Floor 4 Cleaning", sub: "Supervisor Marcus Chen notified", time: "45m ago", icon: "⚠", type: "warning" },
  { title: "New Task Created", sub: "Lobby glass replacement (High Priority)", time: "1h ago", icon: "✓", type: "info" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getUserDisplayName(user) {
  if (!user) return "Alex";
  if (user.fullName) return user.fullName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.name) return user.name;
  return "Alex";
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="mobile-end-user-screen manager-screen">
      <header className="manager-header">
        <div className="manager-greeting-block">
          <div className="manager-avatar-wrap">
            <img src={logoIcon} alt="" className="manager-avatar" style={{ objectFit: "cover" }} />
          </div>
          <div className="manager-greeting-text">
            <h1 className="manager-greeting">{getGreeting()}, {getUserDisplayName(user)}</h1>
            <p className="manager-location">📍 Madhuban Group</p>
          </div>
          <button type="button" className="manager-notify" aria-label="Notifications" onClick={() => navigate("/mobile/manager/notifications")}>🔔</button>
        </div>
      </header>

      <section className="manager-section">
        <div className="manager-task-grid">
          {TASK_STATS.map((stat) => (
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
          {SUPERVISORS.map((s) => (
            <div key={s.name} className="manager-supervisor-row">
              <div className="manager-supervisor-avatar" />
              <div className="manager-supervisor-info">
                <span className="manager-supervisor-name">{s.name}</span>
                <div className="manager-progress-wrap">
                  <div className="manager-progress-track">
                    <div
                      className={`manager-progress-fill ${s.color}`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className="manager-supervisor-percent">{s.percent}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="manager-section">
        <h3 className="manager-section-title">Recent Activity</h3>
        <div className="manager-activity-list">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className={`manager-activity-item ${a.type}`}>
              <span className="manager-activity-icon">{a.icon}</span>
              <div className="manager-activity-text">
                <strong>{a.title}</strong>
                <span>{a.sub}</span>
              </div>
              <span className="manager-activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </section>

      <ManagerBottomNav />
    </div>
  );
}
