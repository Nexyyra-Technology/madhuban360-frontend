/**
 * Pending Tasks – List of pending tasks (Figma: HVAC Maintenance, Elevator Inspection, Fire Alarm System)
 * Route: /mobile/supervisor/pending-tasks
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorBottomNav from "./SupervisorBottomNav";
import TaskDetailsPopup from "./TaskDetailsPopup";
import { getSupervisorTasks } from "./supervisorService";

export default function PendingTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsTask, setDetailsTask] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await getSupervisorTasks({});
        if (!cancelled) {
          const pending = (list || []).filter((t) => {
            const s = (t.rawStatus || t.status || "").toUpperCase().replace(/\s/g, "_");
            return ["TO_DO", "PENDING"].includes(s);
          });
          setTasks(pending);
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

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <span className="supervisor-breadcrumb">Pending Tasks</span>
        <div className="supervisor-header-bar">
          <button type="button" className="supervisor-back-btn" onClick={() => navigate("/mobile/supervisor/dashboard")} aria-label="Back">
            ←
          </button>
          <h1 className="supervisor-page-title">Pending Tasks</h1>
          <button type="button" className="supervisor-search-icon-btn" aria-label="Search">🔍</button>
        </div>
      </header>

      <section className="manager-section">
        {loading && <p className="manager-loading">Loading…</p>}
        {!loading && (
          <div className="supervisor-task-list">
            {tasks.length === 0 ? (
              <p className="manager-empty">No pending tasks.</p>
            ) : (
              tasks.map((t, i) => {
                const isUrgent = (t.priority || "").toUpperCase() === "HIGH" || (t.priority || "").toUpperCase() === "URGENT";
                return (
                  <div
                    key={t.id ?? t._id}
                    className={`supervisor-pending-card ${isUrgent ? "has-accent" : ""}`}
                    onClick={() => setDetailsTask(t)}
                    onKeyDown={(e) => e.key === "Enter" && setDetailsTask(t)}
                    role="button"
                    tabIndex={0}
                  >
                    {isUrgent && <div className="supervisor-pending-accent-bar" />}
                    <div className="supervisor-pending-body">
                      <h3 className="supervisor-pending-title">{t.title}</h3>
                      <p className="supervisor-pending-location">🏢 {t.location}</p>
                      <div className="supervisor-pending-footer">
                        <div className="supervisor-pending-avatar-wrap">
                          <div className="supervisor-pending-avatar" />
                          <span>{t.supervisor}</span>
                        </div>
                        <span className="supervisor-pill pending">PENDING</span>
                      </div>
                    </div>
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
