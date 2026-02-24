/**
 * Supervisor Task Verification – List of tasks to verify (Approve/Reject)
 * Route: /mobile/supervisor/task-verification
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupervisorBottomNav from "./SupervisorBottomNav";
import { getSupervisorTasks, approveTask, rejectTask } from "./supervisorService";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function SupervisorTaskVerification() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const list = await getSupervisorTasks({});
      const review = (list || []).filter((t) => {
        const s = (t.rawStatus || t.status || "").toUpperCase().replace(/\s/g, "_");
        return ["REVIEW", "PENDING_APPROVAL"].includes(s);
      });
      setTasks(review);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleApprove(taskId) {
    if (!taskId) return;
    setApprovingId(taskId);
    try {
      await approveTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(taskId) {
    if (!taskId) return;
    setRejectingId(taskId);
    try {
      await rejectTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <span className="supervisor-breadcrumb">Supervisor Task Verification</span>
        <div className="supervisor-header-bar">
          <button type="button" className="supervisor-back-btn" onClick={() => navigate("/mobile/supervisor/tasks")} aria-label="Back">
            ←
          </button>
          <h1 className="supervisor-page-title">Supervisor Task Verification</h1>
        </div>
      </header>

      <section className="manager-section">
        <div className="supervisor-tabs supervisor-tabs-inline">
          <button
            type="button"
            className="supervisor-tab"
            onClick={() => navigate("/mobile/supervisor/tasks")}
          >
            On Going Task
          </button>
          <button type="button" className="supervisor-tab active">
            Task Verification
          </button>
        </div>
      </section>

      {loading && <p className="manager-loading">Loading…</p>}
      {!loading && (
        <section className="manager-section">
          <div className="supervisor-task-list">
            {tasks.length === 0 ? (
              <p className="manager-empty">No tasks pending verification.</p>
            ) : (
              tasks.map((t) => (
                <div key={t.id ?? t._id} className="supervisor-verify-card">
                  <div className="supervisor-verify-head">
                    <h3 className="supervisor-verify-title">{t.title}</h3>
                    <span className="supervisor-pill urgent">URGENT</span>
                  </div>
                  <p className="supervisor-verify-completed">Completed By: {t.supervisor}</p>
                  <div className="supervisor-verify-meta">
                    <div>
                      <span className="supervisor-meta-label">DURATION TAKEN</span>
                      <p>🕐 9 Min</p>
                    </div>
                    <div>
                      <span className="supervisor-meta-label">LOCATION</span>
                      <p>📍 {t.location}</p>
                    </div>
                  </div>
                  <div className="supervisor-verify-time-row">
                    <span>START TIME: {formatTime(t.updatedAt)}</span>
                    <span>END TIME: {formatTime(t.completedAt)}</span>
                    <span>DURATION: 10:00 Min</span>
                  </div>
                  <div className="supervisor-verify-actions">
                    <button
                      type="button"
                      className="supervisor-link-btn"
                      onClick={() => navigate(`/mobile/supervisor/task-verification/${t.id ?? t._id}`)}
                    >
                      VIEW DETAILS
                    </button>
                    <button
                      type="button"
                      className="supervisor-btn-reject"
                      onClick={() => handleReject(t.id ?? t._id)}
                      disabled={rejectingId === (t.id ?? t._id)}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="supervisor-btn-approve"
                      onClick={() => handleApprove(t.id ?? t._id)}
                      disabled={approvingId === (t.id ?? t._id)}
                    >
                      {approvingId === (t.id ?? t._id) ? "Approving…" : "Approve"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <SupervisorBottomNav />
    </div>
  );
}
