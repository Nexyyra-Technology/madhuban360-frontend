/**
 * Supervisor Task Verification (detail) – Evidence, geo-tag, comments, Reject & Reassign / Verify & Close
 * Route: /mobile/supervisor/task-verification/:id
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSupervisorTaskById, approveTask, rejectTask } from "./supervisorService";

function formatDurationMinutes(minutes) {
  if (minutes == null) return "—";
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return "—";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function formatAttachmentTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const dayPart = isToday ? "Today" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const timePart = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${dayPart}, ${timePart}`;
}

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
      navigate("/mobile/supervisor/tasks", { replace: true });
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
      navigate("/mobile/supervisor/tasks", { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  const isTaskCompleted = (t) => {
    if (!t) return false;
    const s = String(t.rawStatus ?? t.status ?? "").toUpperCase().replace(/\s/g, "_");
    return ["COMPLETED", "DONE", "APPROVED"].includes(s);
  };

  const completed = task ? isTaskCompleted(task) : false;

  // For now use static web images instead of API attachment images
  const photosCount = 2;
  const beforeUrl =
    "https://images.pexels.com/photos/3965520/pexels-photo-3965520.jpeg?auto=compress&cs=tinysrgb&w=800";
  const afterUrl =
    "https://images.pexels.com/photos/4108719/pexels-photo-4108719.jpeg?auto=compress&cs=tinysrgb&w=800";

  const locationLine =
    task?.locationFloor ||
    task?.propertyName ||
    task?.departmentName ||
    "Block C - 123 Business Park";

  const completedBy =
    task?.assigneeName ||
    task?.assignee?.name ||
    task?.supervisor ||
    "—";

  const timeTaken = formatDurationMinutes(task?.timeDuration);

  return (
    <div className="mobile-end-user-screen manager-screen supervisor-screen">
      <header className="supervisor-page-header">
        <div className="supervisor-header-bar">
          <button type="button" className="supervisor-back-btn" onClick={() => navigate("/mobile/supervisor/tasks")} aria-label="Back">
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
              {completed && (
                <div className="supervisor-verify-detail-approved-badge" style={{ marginBottom: 12 }}>
                  <span className="supervisor-pill approved">Approved</span>
                </div>
              )}
              <p className="supervisor-verify-detail-location">{locationLine}</p>
              <h2 className="supervisor-verify-detail-title">
                {task.taskName ?? task.title ?? "Task"} #{task.id ?? task._id}
              </h2>
              <p>Completed by: {completedBy}</p>
              <p>Time taken: {timeTaken}</p>
            </div>
          </section>

          <section className="manager-section">
            <div className="supervisor-section-head">
              <h3 className="manager-section-title">Evidence</h3>
              <span className="supervisor-badge-green">
                {photosCount || 0} {photosCount === 1 ? "Photo attached" : "Photos attached"}
              </span>
            </div>
            <div className="supervisor-evidence-grid">
              {beforeUrl && (
                <div className="supervisor-evidence-item">
                  <div className="supervisor-evidence-img before">
                    <img src={beforeUrl} alt="Before task evidence" />
                  </div>
                  <span className="supervisor-evidence-label before">Before</span>
                  <p className="supervisor-evidence-time">Today, 1:00 PM</p>
                </div>
              )}
              {afterUrl && (
                <div className="supervisor-evidence-item">
                  <div className="supervisor-evidence-img after">
                    <img src={afterUrl} alt="After task evidence" />
                  </div>
                  <span className="supervisor-evidence-label after">After</span>
                  <p className="supervisor-evidence-time">Today, 1:00 PM</p>
                </div>
              )}
            </div>
          </section>

          <section className="manager-section">
            <div
              style={{
                background: "#F9FAFB",
                borderRadius: 16,
                padding: "14px 16px",
                border: "1px solid #E5E7EB",
              }}
            >
              <h3
                className="manager-section-title"
                style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 4 }}
              >
                Geo-tag: {task.propertyName ?? "Property"}
                {task.locationFloor ? `, ${task.locationFloor}` : ""}
              </h3>
              <p
                className="supervisor-geo-text"
                style={{ margin: "6px 0 0 0", fontSize: 14, color: "#4B5563" }}
              >
                {task.departmentName ?? task.roomNumber ?? "Location details not available"}
              </p>
            </div>
          </section>

          <section className="manager-section">
            <div
              style={{
                background: "#F9FAFB",
                borderRadius: 16,
                padding: "14px 16px",
                border: "1px solid #E5E7EB",
              }}
            >
              <h3
                className="manager-section-title"
                style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 8 }}
              >
                Supervisor Comments
              </h3>
              <textarea
                className="supervisor-comments-input"
                placeholder="Add notes... (Required for rejection)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: 4,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  fontSize: 14,
                  resize: "vertical",
                  minHeight: 90,
                  outline: "none",
                }}
              />
            </div>
          </section>

          {!completed && (
            <section
              className="manager-section supervisor-verify-detail-actions"
              style={{ paddingTop: 4, paddingBottom: 24 }}
            >
              <div
                style={{
                  background: "#F9FAFB",
                  borderRadius: 16,
                  padding: "12px 14px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleRejectAndReassign}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      padding: "10px 18px",
                      borderRadius: 9999,
                      border: "1.5px solid #EF4444",
                      background: "#FFFFFF",
                      color: "#B91C1C",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: actionLoading ? "default" : "pointer",
                      opacity: actionLoading ? 0.7 : 1,
                    }}
                  >
                    Reject & Reassign
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      padding: "10px 18px",
                      borderRadius: 9999,
                      border: "none",
                      background: "#111827",
                      color: "white",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: actionLoading ? "default" : "pointer",
                      opacity: actionLoading ? 0.7 : 1,
                    }}
                  >
                    Verify & Close
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}
