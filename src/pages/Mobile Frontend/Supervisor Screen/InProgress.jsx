/**
 * In Progress – List of in-progress tasks (Figma: Elevator B Repair, Door Cleaning, Emergency Leak Fix)
 * Route: /mobile/supervisor/in-progress
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorBottomNav from "./SupervisorBottomNav";
import TaskDetailsPopup from "./TaskDetailsPopup";
import { getSupervisorTasks } from "./supervisorService";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function elapsed(startIso, estimatedMinutes) {
  if (!startIso) return { text: "—", percent: 0, overdue: false };
  const start = new Date(startIso).getTime();
  const now = Date.now();
  const elapsedMs = now - start;
  const elapsedM = Math.floor(elapsedMs / 60000);
  const est = estimatedMinutes || 120;
  const overdue = elapsedM > est;
  const percent = Math.min(100, (elapsedM / est) * 100);
  const h = Math.floor(elapsedM / 60);
  const m = elapsedM % 60;
  const eh = Math.floor(est / 60);
  const em = est % 60;
  const text = overdue
    ? `${h}h ${m}m / ${eh}h`
    : `${h}h ${m}m / ${eh}h${em ? ` ${em}m` : ""}`;
  return { text, percent: Math.min(100, percent), overdue };
}

export default function InProgress() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailsTask, setDetailsTask] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await getSupervisorTasks({});
        if (!cancelled) {
          const inProgress = (list || []).filter(
            (t) => (t.rawStatus || "").toUpperCase() === "IN_PROGRESS"
          );
          setTasks(inProgress);
        }
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.location && t.location.toLowerCase().includes(q)) ||
      (t.supervisor && t.supervisor.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <span className="supervisor-breadcrumb">In Progress</span>
        <div className="supervisor-header-bar">
          <button type="button" className="supervisor-back-btn" onClick={() => navigate("/mobile/supervisor/dashboard")} aria-label="Back">
            ←
          </button>
          <h1 className="supervisor-page-title">In Progress</h1>
          <button type="button" className="supervisor-search-icon-btn" aria-label="Search">🔍</button>
        </div>
      </header>

      <section className="manager-section">
        {loading && <p className="manager-loading">Loading…</p>}
        {!loading && (
          <div className="supervisor-task-list">
            {filtered.length === 0 ? (
              <p className="manager-empty">No in-progress tasks.</p>
            ) : (
              filtered.map((t) => {
                const startAt = t.startedAt || t.updatedAt || t.updated_at;
                const est = t.estimatedMinutes ?? 120;
                const prog = elapsed(startAt, est);
                const isPriority = (t.priority || "").toUpperCase() === "HIGH" || (t.priority || "").toUpperCase() === "URGENT";
                return (
                  <div key={t.id ?? t._id} className={`supervisor-inprogress-card ${prog.overdue ? "overdue" : ""}`}>
                    <div className="supervisor-inprogress-head">
                      <h3 className="supervisor-inprogress-title">{t.title}</h3>
                      <span className={`supervisor-pill ${isPriority ? "priority" : "in-progress"}`}>
                        {isPriority ? "PRIORITY" : "IN PROGRESS"}
                      </span>
                    </div>
                    <p className="supervisor-inprogress-location">📍 {t.location}</p>
                    <div className="supervisor-inprogress-meta">
                      <div>
                        <span className="supervisor-meta-label">ASSIGNED STAFF</span>
                        <p>👤 {t.supervisor}</p>
                      </div>
                      <div>
                        <span className="supervisor-meta-label">STARTED AT</span>
                        <p>🕐 {formatTime(startAt)}</p>
                      </div>
                    </div>
                    <div className="supervisor-progress-row">
                      <div className="supervisor-progress-bar-wrap">
                        <div
                          className={`supervisor-progress-bar-fill ${prog.overdue ? "overdue" : ""}`}
                          style={{ width: `${prog.percent}%` }}
                        />
                      </div>
                      <span className={`supervisor-progress-text ${prog.overdue ? "overdue" : ""}`}>
                        {prog.overdue ? "Overdue" : ""} {prog.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="supervisor-view-details-link"
                      onClick={() => setDetailsTask(t)}
                    >
                      View Details &gt;
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

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
