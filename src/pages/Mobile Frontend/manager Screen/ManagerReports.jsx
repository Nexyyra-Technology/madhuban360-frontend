/**
 * ManagerReports – Reports & analytics for managers
 * -----------------------------------------------------------------------
 * - Data from /api/reports/analytics or derived from /api/tasks
 * - Route: /mobile/manager/reports
 */
import { useState, useEffect } from "react";
import ManagerBottomNav from "./ManagerBottomNav";
import {
  getManagerTasks,
  getManagerReportsData,
  computeReportsFromTasks,
} from "./managerService";
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

export default function ManagerReports() {
  const [period, setPeriod] = useState("Weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState([
    { label: "Total tasks", value: "0", trend: "", trendUp: true },
    { label: "Avg attendance", value: "—", trend: "", trendUp: false },
    { label: "Compliance Rate", value: "0%", trend: "", trendUp: false },
  ]);
  const [taskTrendData, setTaskTrendData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalTasksLabel, setTotalTasksLabel] = useState("0");
  const [verificationDigital, setVerificationDigital] = useState(null);
  const [verificationBreakdown, setVerificationBreakdown] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const periodParam =
          period === "Today" ? "today" : period === "Monthly" ? "monthly" : "weekly";
        const [tasks, reportsApi] = await Promise.all([
          getManagerTasks({}),
          getManagerReportsData(periodParam).catch(() => null),
        ]);

        if (cancelled) return;

        const derived = computeReportsFromTasks(tasks);

        const iconMap = [
          { icon: "📄", iconBg: "bg-blue-100" },
          { icon: "✓", iconBg: "bg-green-100" },
          { icon: "🛡", iconBg: "bg-purple-100" },
        ];
        if (reportsApi?.kpis?.length) {
          setMetrics(
            reportsApi.kpis.map((k, i) => ({
              label: k.label ?? ["Total tasks", "Avg attendance", "Compliance Rate"][i],
              value: k.value ?? "—",
              icon: iconMap[i]?.icon ?? "📊",
              iconBg: iconMap[i]?.iconBg ?? "bg-gray-100",
              trend: k.trend ?? "",
              trendUp: k.trendDown === false,
            }))
          );
        } else {
          setMetrics(derived.metrics ?? []);
        }

        if (reportsApi?.chartData?.taskTrends?.length) {
          setTaskTrendData(reportsApi.chartData.taskTrends);
        } else {
          setTaskTrendData(derived.taskTrendData ?? []);
        }

        if (reportsApi?.chartData?.attendanceTrends?.length) {
          setAttendanceData(reportsApi.chartData.attendanceTrends);
        } else {
          const td = derived.taskTrendData ?? [];
          setAttendanceData(
            td.map((d) => ({ day: d.day, value: (d.completed ?? 0) + (d.pending ?? 0) }))
          );
        }

        setTotalTasksLabel(String(derived.totalTasks ?? tasks?.length ?? 0));
        setVerificationDigital(reportsApi?.verificationDigital ?? null);
        setVerificationBreakdown(reportsApi?.verificationBreakdown ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load reports");
          setMetrics([]);
          setTaskTrendData([]);
          setAttendanceData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [period]);

  return (
    <div className="mobile-end-user-screen manager-screen manager-reports-screen">
      <header className="manager-reports-header">
        <h1>Manager Reports</h1>
      </header>

      {loading && (
        <section className="manager-section">
          <p className="manager-loading">Loading reports…</p>
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
              {metrics.map((m) => (
                <div key={m.label} className="manager-metric-card">
                  {m.icon && (
                    <div className={`manager-metric-icon ${m.iconBg || "bg-gray-100"}`}>
                      {m.icon}
                    </div>
                  )}
                  <span className="manager-metric-value">{m.value}</span>
                  <span className="manager-metric-label">{m.label}</span>
                  {m.trend && (
                    <span
                      className={
                        m.trendUp ? "manager-metric-trend up" : "manager-metric-trend down"
                      }
                    >
                      {m.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="manager-section">
            <div className="manager-chart-header">
              <h3 className="manager-section-title">Task Completion Trends</h3>
              <span className="manager-chart-summary">Total: {totalTasksLabel} Tasks</span>
              <button type="button" className="manager-period-tab active small">
                {period}
              </button>
            </div>
            <div className="manager-chart-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={taskTrendData.length ? taskTrendData : [{ day: "—", completed: 0, pending: 0 }]}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#0B1727" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#9ca3af" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="manager-legend">
              <span className="manager-legend-item">
                <span className="manager-legend-dot completed" /> Completed
              </span>
              <span className="manager-legend-item">
                <span className="manager-legend-dot pending" /> Pending
              </span>
            </div>
          </section>

          <section className="manager-section">
            <div className="manager-chart-header">
              <h3 className="manager-section-title">Attendance Trends</h3>
              <span className="manager-chart-summary">
                Avg: {attendanceData.reduce((s, d) => s + (d.value ?? 0), 0) || 0} Staff
              </span>
            </div>
            <div className="manager-chart-wrap">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart
                  data={
                    attendanceData.length
                      ? attendanceData
                      : [{ day: "—", value: 0 }]
                  }
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B1727" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0B1727" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0B1727"
                    fill="url(#attendanceGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {(verificationDigital != null || verificationBreakdown?.length > 0) && (
            <section className="manager-section">
              <h3 className="manager-section-title">Verification Methods</h3>
              <div className="manager-verification-card">
                {verificationDigital != null && (
                  <div className="manager-verification-main">
                    <span className="manager-verification-value">{verificationDigital}%</span>
                    <span className="manager-verification-label">Digital</span>
                  </div>
                )}
                {verificationBreakdown?.length > 0 && (
                  <div className="manager-verification-breakdown">
                    {verificationBreakdown.map((r, i) => (
                      <div key={i} className="manager-verification-row">
                        <span
                          className={`manager-verification-square ${r.dark ? "dark" : "light"}`}
                        />
                        <span>{r.label ?? "—"}</span>
                        <span className="manager-verification-count">{r.count ?? 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      <ManagerBottomNav />
    </div>
  );
}
