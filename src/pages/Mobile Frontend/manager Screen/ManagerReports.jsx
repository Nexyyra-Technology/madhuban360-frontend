/**
 * ManagerReports – Reports & analytics for managers
 * -----------------------------------------------------------------------
 * - Period selector: Today, Weekly, Monthly
 * - Metric cards: Total tasks, Avg attendance, Compliance Rate
 * - Task Completion Trends (bar chart)
 * - Attendance Trends (area chart)
 * - Verification Methods breakdown
 * - Route: /mobile/manager/reports
 */
import { useState } from "react";
import ManagerBottomNav from "./ManagerBottomNav";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

const PERIODS = ["Today", "Weekly", "Monthly"];

const METRICS = [
  { label: "Total tasks", value: "142", icon: "📄", iconBg: "bg-blue-100", trend: "+12%", trendUp: true },
  { label: "Avg attendance", value: "98%", icon: "✓", iconBg: "bg-green-100", trend: "-1%", trendUp: false },
  { label: "Compliance Rate", value: "95%", icon: "🛡", iconBg: "bg-purple-100", trend: "+4% vs last week", trendUp: true },
];

const TASK_TREND_DATA = [
  { day: "M", completed: 85, pending: 15 },
  { day: "T", completed: 120, pending: 20 },
  { day: "W", completed: 95, pending: 25 },
  { day: "T", completed: 140, pending: 10 },
  { day: "F", completed: 110, pending: 30 },
  { day: "S", completed: 80, pending: 20 },
  { day: "S", completed: 60, pending: 15 },
];

const ATTENDANCE_DATA = [
  { day: "M", value: 42 },
  { day: "T", value: 45 },
  { day: "W", value: 44 },
  { day: "T", value: 48 },
  { day: "F", value: 46 },
  { day: "S", value: 43 },
  { day: "S", value: 40 },
];

export default function ManagerReports() {
  const [period, setPeriod] = useState("Weekly");

  return (
    <div className="mobile-end-user-screen manager-screen manager-reports-screen">
      <header className="manager-reports-header">
        <h1>Manager Reports</h1>
      </header>

      <section className="manager-section">
        <h3 className="manager-section-title">Reports & Analytics</h3>
        <div className="manager-period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={`manager-period-tab ${period === p ? "active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="manager-metrics-grid">
          {METRICS.map((m) => (
            <div key={m.label} className="manager-metric-card">
              <div className={`manager-metric-icon ${m.iconBg}`}>{m.icon}</div>
              <span className="manager-metric-value">{m.value}</span>
              <span className="manager-metric-label">{m.label}</span>
              <span className={m.trendUp ? "manager-metric-trend up" : "manager-metric-trend down"}>
                {m.trend}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="manager-section">
        <div className="manager-chart-header">
          <h3 className="manager-section-title">Task Completion Trends</h3>
          <span className="manager-chart-summary">Total: 1,240 Tasks</span>
          <button type="button" className="manager-period-tab active small">Weekly</button>
        </div>
        <div className="manager-chart-wrap">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TASK_TREND_DATA} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="completed" stackId="a" fill="#0B1727" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="manager-legend">
          <span className="manager-legend-item"><span className="manager-legend-dot completed" /> Completed</span>
          <span className="manager-legend-item"><span className="manager-legend-dot pending" /> Pending</span>
        </div>
      </section>

      <section className="manager-section">
        <div className="manager-chart-header">
          <h3 className="manager-section-title">Attendance Trends</h3>
          <span className="manager-chart-summary">Avg: 45 Staff</span>
        </div>
        <div className="manager-chart-wrap">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={ATTENDANCE_DATA} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B1727" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0B1727" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#0B1727" fill="url(#attendanceGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="manager-legend">
          <span className="manager-legend-item"><span className="manager-legend-dot completed" /> Completed</span>
          <span className="manager-legend-item"><span className="manager-legend-dot pending" /> Pending</span>
        </div>
      </section>

      <section className="manager-section">
        <h3 className="manager-section-title">Verification Methods</h3>
        <div className="manager-verification-card">
          <div className="manager-verification-main">
            <span className="manager-verification-value">72%</span>
            <span className="manager-verification-label">Digital</span>
          </div>
          <div className="manager-verification-breakdown">
            <div className="manager-verification-row">
              <span className="manager-verification-square dark" />
              <span>Geo-Verified</span>
              <span className="manager-verification-count">892</span>
            </div>
            <div className="manager-verification-row">
              <span className="manager-verification-square light" />
              <span>Manual Upload</span>
              <span className="manager-verification-count">348</span>
            </div>
          </div>
          <p className="manager-verification-note">Geo-tagging improves compliance.</p>
        </div>
      </section>

      <ManagerBottomNav />
    </div>
  );
}
