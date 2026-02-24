/**
 * Supervisor Task Verification (detail) – Evidence, geo-tag, comments, Reject & Reassign / Verify & Close
 * Route: /mobile/supervisor/task-verification/:id
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSupervisorTaskById, approveTask, rejectTask } from "./supervisorService";

export default function SupervisorTaskVerificationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getSupervisorTaskById(id)
      .then((t) => { if (!cancelled) setTask(t); })
      .catch(() => { if (!cancelled) setTask(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleVerify() {
    if (!id) return;
    setActionLoading(true);
    try {
      await approveTask(id);
      navigate("/mobile/supervisor/task-verification", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectAndReassign() {
    if (!id) return;
    setActionLoading(true);
    try {
      await rejectTask(id, comments);
      navigate("/mobile/supervisor/task-verification", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <div className="supervisor-header-bar">
          <button type="button" className="supervisor-back-btn" onClick={() => navigate("/mobile/supervisor/task-verification")} aria-label="Back">
            ←
          </button>
          <h1 className="supervisor-page-title">Task Verification</h1>
        </div>
      </header>

      {loading && <p className="manager-loading">Loading…</p>}
      {!loading && task && (
        <>
          <section className="manager-section">
            <div className="supervisor-verify-detail-card">
              <p className="supervisor-verify-detail-location">📍 Block C - 123 Business Park</p>
              <h2 className="supervisor-verify-detail-title">{task.title ?? task.taskName} #{task.id ?? task._id}</h2>
              <p>Completed by: {task.assignee?.name ?? task.supervisor ?? "—"}</p>
              <p>Time taken: 45m</p>
            </div>
          </section>

          <section className="manager-section">
            <div className="supervisor-section-head">
              <h3 className="manager-section-title">Evidence</h3>
              <span className="supervisor-badge-green">2 Photos attached</span>
            </div>
            <div className="supervisor-evidence-grid">
              <div className="supervisor-evidence-item">
                <div className="supervisor-evidence-img before" />
                <span className="supervisor-evidence-label before">Before</span>
                <p className="supervisor-evidence-time">Today, 1:00 PM</p>
              </div>
              <div className="supervisor-evidence-item">
                <div className="supervisor-evidence-img after" />
                <span className="supervisor-evidence-label after">After</span>
                <p className="supervisor-evidence-time">Today, 1:00 PM</p>
              </div>
            </div>
          </section>

          <section className="manager-section">
            <h3 className="manager-section-title">Geo-tag: 123 Business Park, Block C</h3>
            <p className="supervisor-geo-text">📍 19.07 N, 72.87 E * +5m Accuracy</p>
          </section>

          <section className="manager-section">
            <h3 className="manager-section-title">Supervisor Comments</h3>
            <textarea
              className="supervisor-comments-input"
              placeholder="Add notes... (Required for rejection)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </section>

          <section className="manager-section supervisor-verify-detail-actions">
            <button
              type="button"
              className="supervisor-btn-reject-outline"
              onClick={handleRejectAndReassign}
              disabled={actionLoading}
            >
              Reject & Reassign
            </button>
            <button
              type="button"
              className="supervisor-btn-verify-close"
              onClick={handleVerify}
              disabled={actionLoading}
            >
              Verify & Close
            </button>
          </section>
        </>
      )}

    </div>
  );
}
