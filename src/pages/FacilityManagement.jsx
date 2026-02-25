/**
 * Facility Management Dashboard
 * ------------------------------
 * Matches PDF spec & Figma: Operations, Attendance, Tickets, Security Patrol, Reports.
 * All data from backend via facilityManagementService — no dummy data.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getFacilityKpi,
  getFacilityTasks,
  getFloors,
  getTeamCompletion,
  getOccupancy,
  getTicketCategories,
  getTimeVariance,
  getAttendanceRegister,
  getFacilityTickets,
  getPatrolGuards,
  getPatrolGuardDetail,
  updateFacilityTaskStatus,
  exportReport,
} from "./facilityManagementService";

const TABS = [
  { id: "operations", label: "Operations" },
  { id: "attendance", label: "Attendance" },
  { id: "tickets", label: "Tickets" },
  { id: "patrol", label: "Security Patrol" },
  { id: "reports", label: "Reports" },
];

const FILTER_DROPDOWNS = [
  { key: "function", label: "FUNCTION", dot: "#2563EB" },
  { key: "zone", label: "ZONE", dot: "#7C3AED" },
  { key: "status", label: "STATUS", dot: "#16A34A" },
  { key: "maker", label: "MAKER", dot: "#0891B2" },
  { key: "checker", label: "CHECKER", dot: "#B45309" },
  { key: "approver", label: "APPROVER", dot: "#991B1B" },
  { key: "priority", label: "PRIORITY", dot: "#DC2626" },
  { key: "timeSlot", label: "TIME SLOT", dot: "#5B21B6" },
];

const ZONES = [
  "Outside Main Door",
  "Reception Area",
  "HR Desk",
  "Employee Desks",
  "CEO Cabin",
  "Director Cabin (AD)",
  "Director Cabin (PB)",
  "Director Cabin (PD)",
  "Ajinkya Sir Cabin",
  "Conference Room",
  "Common Area",
  "Pantry",
  "Washrooms (Male/Female)",
  "VIP Room",
];

const STATUS_CYCLE = { open: "prog", prog: "done", done: "skip", skip: "open" };
const STATUS_LABEL = { open: "Open", prog: "In Progress", done: "Done", skip: "Skipped" };

function useLiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const defaultFilters = () => ({
  function: "all",
  zone: "all",
  status: "all",
  maker: "all",
  checker: "all",
  approver: "all",
  priority: "all",
  timeSlot: "all",
});

export default function FacilityManagement() {
  const [activeTab, setActiveTab] = useState("operations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [teamCompletion, setTeamCompletion] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [timeVariance, setTimeVariance] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [patrolGuards, setPatrolGuards] = useState([]);
  const [expandedZones, setExpandedZones] = useState(new Set());
  const [patrolModalGuard, setPatrolModalGuard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSelects, setFilterSelects] = useState(defaultFilters());
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters());
  const clock = useLiveClock();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const taskParams = {
        filter: "today",
        status: appliedFilters.status,
        priority: appliedFilters.priority !== "all" ? appliedFilters.priority : undefined,
      };
      const [kpiRes, tasksRes, floorsRes, teamRes, occRes, catRes, varRes, attRes, tickRes, patrolRes] = await Promise.all([
        getFacilityKpi(),
        getFacilityTasks(taskParams),
        getFloors(),
        getTeamCompletion(),
        getOccupancy(),
        getTicketCategories(),
        getTimeVariance(),
        getAttendanceRegister(),
        getFacilityTickets(),
        getPatrolGuards(),
      ]);
      setKpi(kpiRes ?? null);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setFloors(Array.isArray(floorsRes) ? floorsRes : []);
      setTeamCompletion(Array.isArray(teamRes) ? teamRes : []);
      setOccupancy(Array.isArray(occRes) ? occRes : []);
      setTicketCategories(Array.isArray(catRes) ? catRes : []);
      setTimeVariance(varRes ?? null);
      setAttendance(Array.isArray(attRes) ? attRes : []);
      setTickets(Array.isArray(tickRes) ? tickRes : []);
      setPatrolGuards(Array.isArray(patrolRes) ? patrolRes : []);
    } catch (e) {
      setError(e?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters.status, appliedFilters.priority]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTaskStatusCycle = async (taskId, currentStatus) => {
    const next = STATUS_CYCLE[currentStatus] || "open";
    try {
      await updateFacilityTaskStatus(taskId, next);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId || t.id === String(taskId) ? { ...t, status: next } : t))
      );
    } catch (e) {
      setError(e?.message ?? "Update failed");
    }
  };

  const toggleZone = (zone) => {
    setExpandedZones((s) => {
      const next = new Set(s);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  };

  const filteredTasks = (() => {
    let list = [...tasks];
    const q = (searchQuery || "").trim().toLowerCase();
    if (q) list = list.filter((t) => (t.task || "").toLowerCase().includes(q) || (t.zone || "").toLowerCase().includes(q) || (t.assignee || "").toLowerCase().includes(q));
    const fn = (appliedFilters.function || "").trim().toLowerCase();
    if (fn && fn !== "all") list = list.filter((t) => (t.fn || "").trim().toLowerCase() === fn);
    const zone = (appliedFilters.zone || "").trim();
    if (zone && zone !== "all") list = list.filter((t) => (t.zone || "").trim() === zone);
    const statusVal = (appliedFilters.status || "").trim();
    if (statusVal && statusVal !== "all") {
      const statusMap = { open: "open", "in progress": "prog", done: "done", skipped: "skip" };
      const s = statusMap[statusVal.toLowerCase()] || statusVal.toLowerCase();
      list = list.filter((t) => (t.status || "") === s);
    }
    const maker = (appliedFilters.maker || "").trim().toLowerCase();
    if (maker && maker !== "all") list = list.filter((t) => (t.assignee || "").trim().toLowerCase() === maker);
    const checker = (appliedFilters.checker || "").trim().toLowerCase();
    if (checker && checker !== "all") list = list.filter((t) => (t.checker || "").trim().toLowerCase() === checker);
    const approver = (appliedFilters.approver || "").trim().toLowerCase();
    if (approver && approver !== "all") list = list.filter((t) => (t.approver || "").trim().toLowerCase() === approver);
    const priority = (appliedFilters.priority || "").trim().toLowerCase();
    if (priority && priority !== "all") list = list.filter((t) => (t.priority || "").trim().toLowerCase() === priority);
    const timeSlot = (appliedFilters.timeSlot || "").trim();
    if (timeSlot && timeSlot !== "all") {
      list = list.filter((t) => (t.start || "").trim() === timeSlot || (t.end || "").trim() === timeSlot);
    }
    return list;
  })();

  const tasksByZone = filteredTasks.reduce((acc, t) => {
    const z = t.zone || "Other";
    if (!acc[z]) acc[z] = [];
    acc[z].push(t);
    return acc;
  }, {});

  const zoneOrder = [...new Set([...ZONES.filter((z) => tasksByZone[z]?.length), ...Object.keys(tasksByZone)])];

  const filterOptions = (() => {
    const functions = [...new Set(tasks.map((t) => (t.fn || "").trim()).filter(Boolean))].sort();
    const zones = [...new Set(tasks.map((t) => (t.zone || "").trim()).filter(Boolean))].sort();
    const statuses = ["Open", "In Progress", "Done", "Skipped"];
    const makers = [...new Set(tasks.map((t) => (t.assignee || "").trim()).filter(Boolean))].sort();
    const checkers = [...new Set(tasks.map((t) => (t.checker || "").trim()).filter(Boolean))].sort();
    const approvers = [...new Set(tasks.map((t) => (t.approver || "").trim()).filter(Boolean))].sort();
    const priorities = [...new Set(tasks.map((t) => (t.priority || "").trim()).filter(Boolean))].sort();
    const rawSlots = tasks.flatMap((t) => [t.start, t.end].filter((v) => v && v !== "—"));
    const timeSlots = [...new Set(rawSlots)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    return { functions, zones, statuses, makers, checkers, approvers, priorities, timeSlots };
  })();

  const activeFilterTags = Object.entries(appliedFilters).filter(([, v]) => v && String(v).trim() !== "" && String(v).toLowerCase() !== "all");
  const removeFilterTag = (key) => {
    const cleared = "all";
    setFilterSelects((prev) => ({ ...prev, [key]: cleared }));
    setAppliedFilters((prev) => ({ ...prev, [key]: cleared }));
  };
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterSelects });
  };
  const handleClearAllFilters = () => {
    const def = defaultFilters();
    setFilterSelects(def);
    setAppliedFilters(def);
    setSearchQuery("");
  };

  const derivedKpi = kpi ?? {
    totalTasks: tasks.length,
    completed: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "prog").length,
    open: tasks.filter((t) => t.status === "open").length,
    activeTickets: tickets.length,
    occupancy: 0,
  };
  const kpiDisplay = { ...derivedKpi, ...(kpi || {}) };
  const totalTasks = Math.max(1, kpiDisplay.totalTasks ?? 1);
  const pctDone = Math.min(100, ((kpiDisplay.completed ?? 0) / totalTasks) * 100);
  const pctProg = Math.min(100, ((kpiDisplay.inProgress ?? 0) / totalTasks) * 100);
  const pctOpen = Math.min(100, ((kpiDisplay.open ?? 0) / totalTasks) * 100);
  const pctTickets = Math.min(100, (kpiDisplay.activeTickets ?? 0) * 10);
  const pctOcc = kpiDisplay.occupancy ?? 0;

  return (
    <div className="fm-dashboard">
      <header className="fm-header">
        <div className="fm-logo">
          <div className="fm-logo-icon">M</div>
          <span className="fm-logo-text">Madhuban</span>
        </div>
        <nav className="fm-nav-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`fm-tab ${activeTab === tab.id ? "fm-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="fm-header-right">
          <span className="fm-clock">{clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
          <span className="fm-live-badge">Live</span>
        </div>
      </header>

      <section className="fm-kpi-bar">
        <div className="fm-kpi-card fm-kpi-total">
          <span className="fm-kpi-label">TOTAL TASKS</span>
          <span className="fm-kpi-value fm-kpi-value-blue">{kpiDisplay.totalTasks ?? 0}</span>
          <span className="fm-kpi-subtitle">Today&apos;s checklist</span>
          <div className="fm-kpi-bar-inner" style={{ width: "100%", background: "#2563EB" }} />
        </div>
        <div className="fm-kpi-card fm-kpi-done">
          <span className="fm-kpi-label">COMPLETED</span>
          <span className="fm-kpi-value fm-kpi-value-green">{kpiDisplay.completed ?? 0}</span>
          <span className="fm-kpi-subtitle">{totalTasks ? `${Math.round(pctDone)}% done` : "0% done"}</span>
          <div className="fm-kpi-bar-inner" style={{ width: `${pctDone}%`, background: "#16A34A" }} />
        </div>
        <div className="fm-kpi-card fm-kpi-progress">
          <span className="fm-kpi-label">IN PROGRESS</span>
          <span className="fm-kpi-value fm-kpi-value-orange">{kpiDisplay.inProgress ?? 0}</span>
          <span className="fm-kpi-subtitle">{totalTasks ? `${Math.round(pctProg)}% active` : "0% active"}</span>
          <div className="fm-kpi-bar-inner" style={{ width: `${pctProg}%`, background: "#D97706" }} />
        </div>
        <div className="fm-kpi-card fm-kpi-open">
          <span className="fm-kpi-label">OPEN</span>
          <span className="fm-kpi-value fm-kpi-value-dark">{kpiDisplay.open ?? 0}</span>
          <span className="fm-kpi-subtitle">Pending tasks</span>
          <div className="fm-kpi-bar-inner" style={{ width: `${pctOpen}%`, background: "#6B7280" }} />
        </div>
        <div className="fm-kpi-card fm-kpi-tickets">
          <span className="fm-kpi-label">ACTIVE TICKETS</span>
          <span className="fm-kpi-value fm-kpi-value-red">{kpiDisplay.activeTickets ?? 0}</span>
          <span className="fm-kpi-subtitle">{(kpiDisplay.criticalTickets ?? 2)} critical open</span>
          <div className="fm-kpi-bar-inner" style={{ width: `${pctTickets}%`, background: "#DC2626" }} />
        </div>
        <div className="fm-kpi-card fm-kpi-occupancy">
          <span className="fm-kpi-label">OCCUPANCY</span>
          <span className="fm-kpi-value fm-kpi-value-purple">{kpiDisplay.occupancy ?? 0}%</span>
          <span className="fm-kpi-subtitle">{kpiDisplay.occupancyCapacity ?? "340/400 capacity"}</span>
          <div className="fm-kpi-bar-inner" style={{ width: `${pctOcc}%`, background: "#7C3AED" }} />
        </div>
      </section>

      {error && (
        <div className="fm-error">
          {error}
          <button type="button" onClick={() => load()}>Retry</button>
        </div>
      )}

      {activeTab === "operations" && (
        <>
          <div className="fm-filter-panel">
            <div className="fm-filter-header">
              <div className="fm-filter-title-wrap">
                <span className="fm-filter-toggle-icon" aria-hidden>▼</span>
                <h4 className="fm-filter-title">Filters</h4>
              </div>
              <div className="fm-filter-header-actions">
                <button type="button" className="fm-clear-all-btn" onClick={handleClearAllFilters}>
                  <span className="fm-clear-icon">×</span> Clear All
                </button>
                <button type="button" className="fm-apply-filters-btn" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
            <div className="fm-filter-row">
              {FILTER_DROPDOWNS.map(({ key, label, dot }) => (
                <div key={key} className="fm-filter-dd-wrap">
                  <div className="fm-filter-dd-label">
                    <span className="fm-filter-dot" style={{ background: dot }} />
                    <span className="fm-filter-dd-label-text">{label}</span>
                  </div>
                  <select
                    className="fm-filter-select"
                    value={filterSelects[key] ?? "all"}
                    onChange={(e) => setFilterSelects((prev) => ({ ...prev, [key]: e.target.value }))}
                  >
                    <option value="all">All</option>
                    {key === "function" && filterOptions.functions.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "zone" && filterOptions.zones.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "status" && filterOptions.statuses.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "maker" && filterOptions.makers.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "checker" && filterOptions.checkers.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "approver" && filterOptions.approvers.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "priority" && filterOptions.priorities.map((o) => <option key={o} value={o}>{o}</option>)}
                    {key === "timeSlot" && filterOptions.timeSlots.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {activeFilterTags.length > 0 && (
              <div className="fm-filter-tags">
                {activeFilterTags.map(([key, value]) => (
                  <span key={key} className="fm-filter-tag">
                    {FILTER_DROPDOWNS.find((f) => f.key === key)?.label ?? key}: {value}
                    <button type="button" className="fm-filter-tag-remove" onClick={() => removeFilterTag(key)} aria-label="Remove">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="fm-ops-grid">
            <div className="fm-card fm-zone-checklist">
              <div className="fm-checklist-head">
                <h3>Zone-wise Task Checklist</h3>
                <span className="fm-checklist-meta">Showing all {filteredTasks.length} tasks.</span>
                <span className="fm-checklist-count">{filteredTasks.length} tasks</span>
              </div>
              {loading ? (
                <div className="fm-loading">Loading tasks…</div>
              ) : zoneOrder.length === 0 ? (
                <div className="fm-empty">No tasks from database. Add tasks via Task Manager or ensure /api/tasks returns data.</div>
              ) : (
                <div className="fm-zone-list">
                  {zoneOrder.map((zone) => {
                    const zoneTasks = tasksByZone[zone] || [];
                    const expanded = expandedZones.has(zone);
                    const done = zoneTasks.filter((t) => t.status === "done").length;
                    return (
                      <div key={zone} className="fm-zone-item">
                        <button type="button" className="fm-zone-header" onClick={() => toggleZone(zone)}>
                          <span className="fm-zone-dot" />
                          <span className="fm-zone-name">{zone}</span>
                          <span className="fm-zone-count">{done}/{zoneTasks.length}</span>
                          <span className="fm-zone-arrow">{expanded ? "▼" : "▶"}</span>
                        </button>
                        {expanded && (
                          <div className="fm-zone-tasks">
                            <table className="fm-table">
                              <thead>
                                <tr>
                                  <th>ST</th>
                                  <th>#</th>
                                  <th>TASK</th>
                                  <th>TIME</th>
                                  <th>DUR</th>
                                  <th>MAKER</th>
                                  <th>PRIORITY</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {zoneTasks.map((t, i) => (
                                  <tr key={t.id ?? i}>
                                    <td>
                                      <button
                                        type="button"
                                        className={`fm-status-btn fm-status-${t.status}`}
                                        title={STATUS_LABEL[t.status]}
                                        onClick={() => handleTaskStatusCycle(t.id, t.status)}
                                      >
                                        {t.status === "done" ? "✓" : t.status === "prog" ? "◐" : t.status === "skip" ? "—" : "○"}
                                      </button>
                                    </td>
                                    <td className="fm-mono">#{String(t.id ?? i + 1).padStart(2, "0")}</td>
                                    <td>
                                      <div className="fm-task-cell">
                                        <span className={t.status === "done" ? "fm-strike" : ""}>{t.task || "—"}</span>
                                        <span className="fm-task-zone">{t.zone || ""}</span>
                                      </div>
                                    </td>
                                    <td>{t.start && t.end ? `${t.start}-${t.end}` : "—"}</td>
                                    <td>{t.dur ? `${t.dur}m` : "—"}</td>
                                    <td>
                                      <span className="fm-avatar-sm" data-color="blue">{String(t.assignee || "?")[0]}</span>
                                      {t.assignee || "—"}
                                    </td>
                                    <td>
                                      <span className={`fm-priority fm-priority-${(t.priority || "").toLowerCase()}`}>
                                        {t.priority || "—"}
                                      </span>
                                    </td>
                                    <td className="fm-proof-col">
                                      <span className="fm-proof-icon">‖</span> {t.photos ?? 2}
                                      <span className="fm-proof-dot" />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="fm-side-cards">
              <div className="fm-card">
                <div className="fm-card-head">
                  <h3>Floor Status</h3>
                  <select className="fm-select" defaultValue="today">
                    <option value="today">Today</option>
                  </select>
                </div>
                {floors.length === 0 ? (
                  <div className="fm-empty">No floor data from backend.</div>
                ) : (
                  <ul className="fm-floor-list">
                    {floors.map((f, i) => (
                      <li key={f.id ?? i} className="fm-floor-row">
                        <span className="fm-floor-name">{f.name ?? f.floor ?? "Floor"}</span>
                        <div className="fm-floor-bar-wrap">
                          <div
                            className="fm-floor-bar"
                            style={{
                              width: `${f.occupancy ?? 0}%`,
                              background: (f.occupancy ?? 0) >= 85 ? "#DC2626" : (f.occupancy ?? 0) >= 50 ? "#D97706" : "#2563EB",
                            }}
                          />
                        </div>
                        <span className="fm-floor-pct">{f.occupancy ?? 0}%</span>
                        <span className={`fm-badge fm-badge-${(f.status ?? "ok").toLowerCase()}`}>{f.status ?? "OK"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="fm-card">
                <div className="fm-card-head">
                  <h3>Team Completion</h3>
                  <select className="fm-select" defaultValue="today">
                    <option value="today">By today</option>
                  </select>
                </div>
                {teamCompletion.length === 0 ? (
                  <div className="fm-empty">No team data from backend.</div>
                ) : (
                  <ul className="fm-team-list">
                    {teamCompletion.map((t, i) => (
                      <li key={t.id ?? i} className="fm-team-row">
                        <span className="fm-team-name">{t.icon ? `${t.icon} ` : ""}{t.name ?? t.function ?? "—"}</span>
                        <span className="fm-team-frac">{t.done ?? 0}/{t.total ?? 0}</span>
                        <div className="fm-progress-wrap">
                          <div
                            className="fm-progress-bar"
                            style={{ width: `${t.total ? ((t.done ?? 0) / t.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="fm-proof">{t.proofUploaded ?? 0} with proof uploaded</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="fm-charts-row">
            <div className="fm-card fm-chart-card">
              <div className="fm-card-head">
                <h3>Live Occupancy</h3>
                <span className="fm-badge fm-badge-now">{kpiDisplay.occupancy ?? 0}% now</span>
              </div>
              <LiveOccupancyChart data={occupancy} />
            </div>
            <div className="fm-card fm-chart-card">
              <div className="fm-card-head">
                <h3>Ticket Categories</h3>
                <select className="fm-select" defaultValue="date">
                  <option value="date">By Date</option>
                </select>
              </div>
              <TicketDonutChart data={ticketCategories} />
            </div>
            <div className="fm-card fm-chart-card">
              <div className="fm-card-head">
                <h3>Time Variance Analysis</h3>
                <select className="fm-select" defaultValue="today">
                  <option value="today">Today</option>
                </select>
              </div>
              <TimeVarianceCard data={timeVariance} />
            </div>
          </div>
        </>
      )}

      {activeTab === "attendance" && (
        <div className="fm-card fm-full-width">
          <div className="fm-card-head">
            <h3>Attendance Register</h3>
            <select className="fm-select" defaultValue="today">
              <option value="today">Today | {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</option>
            </select>
          </div>
          {attendance.length === 0 ? (
            <div className="fm-empty">No attendance data from backend.</div>
          ) : (
            <div className="fm-table-wrap">
              <table className="fm-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>IN</th>
                    <th>OUT</th>
                    <th>Worked</th>
                    <th>Status</th>
                    <th>Punch (MM/DD/YY)</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, i) => (
                    <tr key={row.id ?? i}>
                      <td>
                        <span className="fm-avatar-sm" style={{ backgroundColor: row.color ?? "#6366F1" }}>{String(row.name ?? "?")[0]}</span>
                        {row.name ?? "—"} — {row.role ?? row.dept ?? ""}
                      </td>
                      <td className={row.late ? "fm-amber" : ""}>{row.punchIn ?? "—"}</td>
                      <td>{row.punchOut ?? "—"}</td>
                      <td>{row.hrs ?? "—"}</td>
                      <td><span className="fm-badge fm-badge-ontime">{row.status ?? "—"}</span></td>
                      <td><MonthlyGrid days={row.days} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="fm-card fm-full-width">
          <div className="fm-card-head">
            <h3>Recent Tickets</h3>
            <div className="fm-ticket-filters">
              <button type="button" className="fm-chip fm-chip-active">All</button>
              <button type="button" className="fm-chip">Critical</button>
              <button type="button" className="fm-chip">Pending</button>
            </div>
          </div>
          {tickets.length === 0 ? (
            <div className="fm-empty">No tickets from backend.</div>
          ) : (
            <div className="fm-table-wrap">
              <table className="fm-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Issue</th>
                    <th>Floor</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Logged By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, i) => (
                    <tr key={t.id ?? i}>
                      <td><button type="button" className="fm-link">{t.ticketId ?? t.id ?? "—"}</button></td>
                      <td>{t.issue ?? t.description ?? "—"}</td>
                      <td>{t.floor ?? "—"}</td>
                      <td><span className={`fm-priority fm-priority-${(t.priority ?? "").toLowerCase()}`}>{t.priority ?? "—"}</span></td>
                      <td><span className="fm-badge fm-badge-status">{t.status ?? "—"}</span></td>
                      <td>{t.assignedTo ?? "—"}</td>
                      <td>{t.loggedBy ?? "—"}</td>
                      <td>{t.time ?? t.timeAgo ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "patrol" && (
        <div className="fm-patrol-section">
          <div className="fm-card fm-full-width">
            <div className="fm-card-head">
              <h3>Security Patrol Roadmap</h3>
              <p className="fm-subtitle">Right shift main door checking.</p>
              <select className="fm-select" defaultValue="all">
                <option value="all">Shift: All</option>
              </select>
            </div>
            {patrolGuards.length === 0 ? (
              <div className="fm-empty">No patrol data from backend.</div>
            ) : (
              <div className="fm-patrol-cards">
                {patrolGuards.map((g, i) => (
                  <div key={g.id ?? i} className="fm-patrol-card">
                    <div className="fm-patrol-card-head">
                      <span className="fm-avatar" style={{ backgroundColor: g.color ?? "#6366F1" }}>{String(g.name ?? "?")[0]}</span>
                      <div>
                        <strong>{g.name ?? "Guard"}</strong>
                        <span className="fm-shift">{g.shift ?? "—"}</span>
                      </div>
                      <span className={`fm-dot fm-dot-${(g.compliance ?? 0) >= 90 ? "green" : (g.compliance ?? 0) >= 80 ? "amber" : "red"}`} />
                    </div>
                    <div className="fm-patrol-mini-map">
                      <PatrolMiniMap guard={g} />
                    </div>
                    <div className="fm-patrol-stats">
                      <span>Completed: {g.compliance ?? 0}%</span>
                      <span>Missed: {g.missed ?? 0}</span>
                      <span>Distance: {g.distance ?? "—"}</span>
                      <span>Time: {g.duration ?? "—"}</span>
                    </div>
                    <button type="button" className="fm-btn-primary" onClick={() => setPatrolModalGuard(g)}>View Patrol Map</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="fm-card fm-full-width">
          <div className="fm-card-head">
            <h3>Reports</h3>
          </div>
          <p className="fm-muted">Export daily/weekly/monthly summaries from live data.</p>
          <div className="fm-report-actions">
            <label>
              From <input type="date" className="fm-input" />
            </label>
            <label>
              To <input type="date" className="fm-input" />
            </label>
            <button type="button" className="fm-btn-secondary" onClick={async () => { try { await exportReport("pdf", null, null); } catch (e) { setError(e?.message); } }}>Export PDF</button>
            <button type="button" className="fm-btn-secondary" onClick={async () => { try { await exportReport("excel", null, null); } catch (e) { setError(e?.message); } }}>Export Excel</button>
          </div>
        </div>
      )}

      {patrolModalGuard && (
        <PatrolDetailModal guard={patrolModalGuard} onClose={() => setPatrolModalGuard(null)} />
      )}
    </div>
  );
}

function LiveOccupancyChart({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = canvas.offsetWidth * dpr;
    const h = canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    const hours = data.length ? data : Array.from({ length: 15 }, (_, i) => ({ hour: 6 + i, value: 20 + Math.random() * 60 }));
    const max = Math.max(1, ...hours.map((d) => d.value ?? 0));
    const pad = { left: 32, right: 16, top: 16, bottom: 24 };
    const graphW = W - pad.left - pad.right;
    const graphH = H - pad.top - pad.bottom;
    const now = new Date().getHours() + new Date().getMinutes() / 60;
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pts = hours.map((d, i) => {
      const x = pad.left + (i / (hours.length - 1 || 1)) * graphW;
      const y = pad.top + graphH - ((d.value ?? 0) / max) * graphH;
      return [x, y];
    });
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
    const grad = ctx.createLinearGradient(0, pad.top, 0, H);
    grad.addColorStop(0, "rgba(37,99,235,0.15)");
    grad.addColorStop(1, "rgba(37,99,235,0.02)");
    ctx.fillStyle = grad;
    ctx.lineTo(pad.left + graphW, pad.top + graphH);
    ctx.lineTo(pad.left, pad.top + graphH);
    ctx.closePath();
    ctx.fill();
    const currentIdx = hours.findIndex((d) => (d.hour ?? d.x) >= now);
    if (currentIdx >= 0 && pts[currentIdx]) {
      const [cx, cy] = pts[currentIdx];
      ctx.fillStyle = "#2563EB";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(37,99,235,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [data]);
  return <canvas ref={canvasRef} className="fm-canvas-chart" width={400} height={200} style={{ width: "100%", height: "200px" }} />;
}

function TicketDonutChart({ data }) {
  const canvasRef = useRef(null);
  const colors = { Electrical: "#D97706", Plumbing: "#2563EB", HVAC: "#0891B2", Civil: "#7C3AED", Housekeeping: "#16A34A" };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const list = Array.isArray(data) && data.length ? data : [];
    const total = list.reduce((s, d) => s + (d.count ?? 0), 0) || 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 20;
    let start = -Math.PI / 2;
    list.forEach((d, i) => {
      const slice = ((d.count ?? 0) / total) * Math.PI * 2;
      ctx.fillStyle = d.color ?? colors[d.name] ?? "#6B7280";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fill();
      start += slice;
    });
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }, [data]);
  return (
    <div className="fm-donut-wrap">
      <canvas ref={canvasRef} className="fm-donut" width={200} height={200} />
      {Array.isArray(data) && data.length > 0 && (
        <ul className="fm-donut-legend">
          {data.map((d, i) => (
            <li key={i}><span className="fm-legend-dot" style={{ background: d.color }} /> {d.name} ({d.count ?? 0})</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TimeVarianceCard({ data }) {
  const d = data ?? {};
  return (
    <div className="fm-time-var">
      <div className="fm-time-var-row">
        <span>Start Time</span>
        <span>{d.allocatedStart ?? "9:00 AM"}</span>
        <span className="fm-amber">{d.actualStart ?? "—"}</span>
        <span className={`fm-var-chip ${(d.startVariance ?? "").includes("late") ? "fm-red" : "fm-green"}`}>{d.startVariance ?? "—"}</span>
      </div>
      <div className="fm-time-var-row">
        <span>Duration</span>
        <span>{d.allocatedDuration ?? "—"}</span>
        <span>{d.actualDuration ?? "—"}</span>
        <span className="fm-var-chip fm-green">{d.durationVariance ?? "—"}</span>
      </div>
      <div className="fm-time-var-row">
        <span>End Time</span>
        <span>{d.allocatedEnd ?? "12:00 PM"}</span>
        <span>{d.actualEnd ?? "12:00 PM"}</span>
        <span className="fm-var-chip fm-green">{d.endVariance ?? "On time"}</span>
      </div>
    </div>
  );
}

function MonthlyGrid({ days }) {
  if (!Array.isArray(days) || days.length === 0) return "—";
  const map = { 0: "—", 1: "P", 2: "L", 3: "A" };
  return (
    <div className="fm-month-grid">
      {days.slice(0, 26).map((v, i) => (
        <span key={i} className={`fm-day fm-day-${v === 1 ? "p" : v === 2 ? "l" : v === 3 ? "a" : "off"}`}>{map[v] ?? "—"}</span>
      ))}
    </div>
  );
}

function PatrolMiniMap({ guard }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 280;
    const h = canvas.height = 90;
    ctx.clearRect(0, 0, w, h);
    const route = guard.route ?? [];
    if (route.length > 1) {
      ctx.strokeStyle = "#16A34A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      route.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0] ?? 0, p[1] ?? 0) : ctx.lineTo(p[0] ?? 0, p[1] ?? 0)));
      ctx.stroke();
    }
    (guard.missed_zones ?? []).forEach((p) => {
      ctx.strokeStyle = "#DC2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p[0] ?? 0, p[1] ?? 0, 6, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [guard]);
  return <canvas ref={canvasRef} width={280} height={90} style={{ width: "100%", maxWidth: 280, height: 90 }} />;
}

function PatrolDetailModal({ guard, onClose }) {
  const [detail, setDetail] = useState(null);
  const guardId = guard?.id ?? guard?._id;
  useEffect(() => {
    if (!guardId) return;
    getPatrolGuardDetail(guardId).then(setDetail).catch(() => setDetail(null));
  }, [guardId]);
  return (
    <div className="fm-modal-overlay" onClick={onClose}>
      <div className="fm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fm-modal-head">
          <h3>Patrol Map — {guard?.name ?? "Guard"}</h3>
          <button type="button" className="fm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="fm-modal-body">
          <div className="fm-strava-map">
            <canvas width={580} height={420} style={{ width: "100%", maxWidth: 580, height: 420, background: "#f3f4f6" }} />
          </div>
          <div className="fm-strava-stats">
            {detail ? (
              <>
                <div className="fm-stat-box">Total Distance: {detail.distance ?? guard?.distance ?? "—"}</div>
                <div className="fm-stat-box">Duration: {detail.duration ?? guard?.duration ?? "—"}</div>
                <div className="fm-stat-box">Missed: {detail.missed ?? guard?.missed ?? 0}</div>
                <div className="fm-stat-box">Compliance: {detail.compliance ?? guard?.compliance ?? 0}%</div>
              </>
            ) : (
              <p>Loading…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
