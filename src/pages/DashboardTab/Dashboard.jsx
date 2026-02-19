import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getDashboardMetrics,
  getSalesPipeline,
  getRevenue,
  getAlerts,
  getActivity,
} from "./dashboardService";
import { Link } from "react-router-dom";

function getFormattedDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Dashboard() {
  const [date] = useState(new Date());
  const [metrics, setMetrics] = useState(null);
  const [salesPipeline, setSalesPipeline] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pipelinePeriod, setPipelinePeriod] = useState("6m");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [m, sp, rev, a, act] = await Promise.all([
          getDashboardMetrics(),
          getSalesPipeline(pipelinePeriod),
          getRevenue(),
          getAlerts(),
          getActivity(),
        ]);
        if (!cancelled) {
          setMetrics(m);
          setSalesPipeline(sp);
          setRevenue(rev);
          setAlerts(a);
          setActivity(act);
        }
      } catch (e) {
        if (!cancelled) {
          setMetrics(null);
          setSalesPipeline(null);
          setRevenue(null);
          setAlerts([]);
          setActivity([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pipelinePeriod]);

  const urgentCount = alerts.filter((a) => a.urgency === "URGENT").length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <div className="dashboard-search-wrap">
          <span className="dashboard-search-icon" aria-hidden>🔍</span>
          <input
            type="text"
            placeholder="Search properties, transactions, tasks..."
            className="dashboard-search-input"
          />
        </div>
        <div className="dashboard-top-actions">
          <button type="button" className="dashboard-btn dashboard-btn-refresh" title="Refresh">↻</button>
          <button type="button" className="dashboard-btn dashboard-btn-icon" title="Notifications">🔔</button>
          <div className="dashboard-avatar-small" title="Profile" />
        </div>
      </div>

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">
            System metrics for today, {getFormattedDate(date)}
          </p>
        </div>
        <div className="dashboard-add-buttons">
          <Link to="/tasks" className="dashboard-add-btn">
            <span className="dashboard-add-btn-icon">+</span>
            <span>Add Task</span>
          </Link>
          <Link to="/users" className="dashboard-add-btn dashboard-add-btn-light">
            <span className="dashboard-add-btn-icon">+</span>
            <span>Add User</span>
          </Link>
          <Link to="/properties" className="dashboard-add-btn dashboard-add-btn-light">
            <span className="dashboard-add-btn-icon">+</span>
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon dashboard-stat-icon-building">🏢</div>
          <div className="dashboard-stat-content">
            <h4>Total Properties</h4>
            <h2>{loading ? "—" : (metrics?.totalProperties ?? 124)}</h2>
            <p className="dashboard-stat-detail">
              {loading ? "—" : `${metrics?.activeProperties ?? 110} Active / ${metrics?.inactiveProperties ?? 14} Inactive`}
            </p>
            <span className="dashboard-trend dashboard-trend-up">
              {loading ? "—" : (metrics?.propertiesTrend != null ? `+${metrics.propertiesTrend}%` : "+4.2%")}
            </span>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon dashboard-stat-icon-users">👥</div>
          <div className="dashboard-stat-content">
            <h4>Total Users</h4>
            <h2>{loading ? "—" : (metrics?.totalUsers ?? 45)}</h2>
            <p className="dashboard-stat-detail">
              {loading ? "—" : `${metrics?.admins ?? 5} Admins / ${metrics?.staff ?? 40} Staff`}
            </p>
            <span className="dashboard-trend dashboard-trend-neutral">
              {loading ? "—" : (metrics?.usersTrend ?? "Stable")}
            </span>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon dashboard-stat-icon-tasks">📋</div>
          <div className="dashboard-stat-content">
            <h4>Open Tasks</h4>
            <h2>{loading ? "—" : (metrics?.openTasks ?? 18)}</h2>
            {metrics?.dueToday > 0 && (
              <span className="dashboard-due-tag">{metrics.dueToday} Due Today</span>
            )}
          </div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon dashboard-stat-icon-attendance">✓</div>
          <div className="dashboard-stat-content">
            <h4>Today&apos;s Attendance</h4>
            <h2>{loading ? "—" : `${metrics?.attendancePercent ?? 92}%`}</h2>
            <div className="dashboard-progress">
              <div
                className="dashboard-progress-bar"
                style={{ width: `${metrics?.attendancePercent ?? 92}%` }}
              />
            </div>
            <span className="dashboard-trend dashboard-trend-up">
              {loading ? "—" : (metrics?.attendanceTrend != null ? `+${metrics.attendanceTrend}%` : "+2%")}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-chart-row">
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <h3>Sales Pipeline Snapshot</h3>
            <span className="dashboard-info-icon" title="Info">ⓘ</span>
            <select
              value={pipelinePeriod}
              onChange={(e) => setPipelinePeriod(e.target.value)}
              className="dashboard-select"
            >
              <option value="6m">Last 6 Months</option>
              <option value="3m">Last 3 Months</option>
              <option value="12m">Last 12 Months</option>
            </select>
          </div>
          <div className="dashboard-chart-inner">
            {salesPipeline?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart
                  data={salesPipeline.data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip formatter={(v) => [v, "Value"]} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-chart-placeholder">Loading chart…</div>
            )}
          </div>
          <div className="dashboard-chart-summary">
            <strong>{salesPipeline?.summary ? formatCurrency(salesPipeline.summary.value) : "$42,000"}</strong>
            <span className="dashboard-trend-up">
              +{salesPipeline?.summary?.trend ?? 12.5}% {salesPipeline?.summary?.label ?? "from last month"}
            </span>
          </div>
        </div>
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <h3>Revenue Overview</h3>
            <span className="dashboard-info-icon" title="Info">ⓘ</span>
            <span className="dashboard-legend">
              <span className="dashboard-legend-dot" /> Revenue
            </span>
          </div>
          <div className="dashboard-chart-inner">
            {revenue?.data?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart
                  data={revenue.data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip formatter={(v) => [formatCurrency(v), "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-chart-placeholder">Loading chart…</div>
            )}
          </div>
          <div className="dashboard-chart-summary">
            <strong>{revenue?.summary ? formatCurrency(revenue.summary.value) : "$128,500"}</strong>
            <span className="dashboard-trend-up">
              +{revenue?.summary?.trend ?? 8.2}% {revenue?.summary?.label ?? "Year-to-date"}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        <div className="dashboard-alerts-card">
          <div className="dashboard-alerts-header">
            <h3>Facility Issue Alerts</h3>
            {urgentCount > 0 && <span className="dashboard-urgent-badge">{urgentCount} URGENT</span>}
            <a href="#view-all" className="dashboard-link">View All Tickets</a>
          </div>
          <ul className="dashboard-alerts-list">
            {alerts.length === 0 && !loading ? (
              <li className="dashboard-alert-item">No alerts</li>
            ) : (
              alerts.map((alert) => (
                <li key={alert.id} className={`dashboard-alert-item dashboard-alert-${alert.urgency.toLowerCase()}`}>
                  <span className="dashboard-alert-icon">
                    {alert.icon === "building" ? "🏢" : alert.icon === "light" ? "💡" : "💧"}
                  </span>
                  <div>
                    <p className="dashboard-alert-title">{alert.title}</p>
                    <p className="dashboard-alert-meta">Reported by: {alert.reportedBy} • {alert.timeAgo}</p>
                  </div>
                  <span className={`dashboard-alert-tag dashboard-alert-tag-${alert.urgency.toLowerCase()}`}>
                    {alert.urgency}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="dashboard-activity-card">
          <h3>Recent Activity</h3>
          <ul className="dashboard-activity-list">
            {activity.length === 0 && !loading ? (
              <li>No recent activity</li>
            ) : (
              activity.map((item) => (
                <li key={item.id} className="dashboard-activity-item">
                  <span className="dashboard-activity-dot" />
                  <div>
                    <p className="dashboard-activity-text">{item.text}</p>
                    <p className="dashboard-activity-meta">{item.source} • {item.timeAgo}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
