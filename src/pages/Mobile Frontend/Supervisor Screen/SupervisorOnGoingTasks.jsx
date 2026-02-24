/**
 * Supervisor On Going Tasks – Figma: Task Management tabs (On Going Task / Task Verification), Today's Tasks
 * Route: /mobile/supervisor/tasks
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorBottomNav from "./SupervisorBottomNav";
import TaskDetailsPopup from "./TaskDetailsPopup";
import { getSupervisorTasks } from "./supervisorService";

const TABS = [
  { key: "ongoing", label: "On Going Task" },
  { key: "verification", label: "Task Verification" },
];

export default function SupervisorOnGoingTasks() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ongoing");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsTask, setDetailsTask] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await getSupervisorTasks({});
        if (!cancelled) setTasks(list || []);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const todayTasks = tasks.filter((t) => {
    const raw = (t.rawStatus || t.status || "").toUpperCase().replace(/\s/g, "_");
    if (tab === "ongoing") {
      return ["IN_PROGRESS", "TO_DO", "PENDING"].includes(raw);
    }
    return ["REVIEW", "PENDING_APPROVAL"].includes(raw);
  });

  const statusPillClass = (t) => {
    const raw = (t.rawStatus || t.status || "").toUpperCase().replace(/\s/g, "_");
    if (raw === "OVERDUE") return "overdue";
    if (["REVIEW", "PENDING_APPROVAL"].includes(raw)) return "pending-approval";
    if (raw === "IN_PROGRESS") return "in-progress";
    return "pending";
  };

  const statusLabel = (t) => {
    const raw = (t.rawStatus || t.status || "").toUpperCase().replace(/\s/g, "_");
    if (raw === "OVERDUE") return "Overdue";
    if (["REVIEW", "PENDING_APPROVAL"].includes(raw)) return "PENDING APPROVAL";
    if (raw === "IN_PROGRESS") return "IN PROGRESS";
    return "PENDING";
  };

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <span className="supervisor-breadcrumb">Supervisor On Going Tasks</span>
        <h1 className="supervisor-main-title">Supervisor On Going Tasks</h1>
      </header>

      <section className="manager-section">
        <h3 className="manager-section-title">Task Management</h3>
        <div className="supervisor-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`supervisor-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "verification" ? (
        <div className="manager-section">
          <button
            type="button"
            className="supervisor-link-btn"
            onClick={() => navigate("/mobile/supervisor/task-verification")}
          >
            Open Task Verification list →
          </button>
        </div>
      ) : (
        <section className="manager-section">
          <div className="supervisor-today-head">
            <h3 className="manager-section-title">Today&apos;s Tasks</h3>
            <span className="supervisor-active-count">{todayTasks.length} Active</span>
          </div>
          {loading && <p className="manager-loading">Loading…</p>}
          {!loading && (
            <div className="supervisor-task-list">
              {todayTasks.length === 0 ? (
                <p className="manager-empty">No tasks for today.</p>
              ) : (
                todayTasks.map((t) => (
                  <div key={t.id ?? t._id} className={`supervisor-ongoing-card ${statusPillClass(t)}`}>
                    <div className="supervisor-ongoing-accent" />
                    <div className="supervisor-ongoing-body">
                      <div className="supervisor-ongoing-top">
                        <h3 className="supervisor-ongoing-title">{t.title}</h3>
                        <span className={`supervisor-pill ${statusPillClass(t)}`}>{statusLabel(t)}</span>
                      </div>
                      <p className="supervisor-ongoing-frequency">Daily</p>
                      <div className="supervisor-ongoing-meta">
                        <span>9:35 AM – 9:45 AM</span>
                        <span className="supervisor-ongoing-location">Outside Main Door</span>
                        <span className="supervisor-ongoing-duration">10 Mins</span>
                      </div>
                      <div className="supervisor-ongoing-footer">
                        <div className="supervisor-ongoing-assignee">
                          <div className="supervisor-pending-avatar" />
                          <span>Assigned to {t.supervisor}</span>
                        </div>
                        <button
                          type="button"
                          className="supervisor-view-details-btn"
                          onClick={() => setDetailsTask(t)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {detailsTask && (
        <TaskDetailsPopup
          taskId={detailsTask.id ?? detailsTask._id}
          onClose={() => setDetailsTask(null)}
        />
      )}

      <SupervisorBottomNav />
    </div>
  );
}
