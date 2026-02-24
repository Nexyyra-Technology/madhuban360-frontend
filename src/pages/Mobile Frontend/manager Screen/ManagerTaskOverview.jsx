/**
 * ManagerTaskOverview – Task list for managers
 * -----------------------------------------------------------------------
 * - Search, filters: All, Pending Approval, Overdue, In Progress, Completed
 * - Task cards from /api/tasks; Approve/Reject for REVIEW status
 * - Route: /mobile/manager/tasks
 */
import { useState, useEffect, useCallback } from "react";
import ManagerBottomNav from "./ManagerBottomNav";
import { getManagerTasks, approveTask, rejectTask } from "./managerService";

const FILTERS = ["All", "Pending Approval", "Overdue", "In Progress", "Completed"];

function statusClass(s) {
  const t = (s || "").toLowerCase();
  if (t === "overdue") return "overdue";
  if (t === "in progress") return "in-progress";
  if (t === "completed") return "completed";
  if (t === "pending approval") return "pending-approval";
  return "pending";
}

export default function ManagerTaskOverview() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getManagerTasks({});
      setTasks(list || []);
    } catch (err) {
      setError(err?.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (filter !== "All") {
      if (filter === "Pending Approval" && t.status !== "Pending Approval") return false;
      if (filter === "Overdue" && t.status !== "Overdue") return false;
      if (filter === "In Progress" && t.status !== "In Progress") return false;
      if (filter === "Completed" && t.status !== "Completed") return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q)) ||
        (t.supervisor && t.supervisor.toLowerCase().includes(q))
      );
    }
    return true;
  });

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

  const isPendingApproval = (t) =>
    t.status === "Pending Approval" ||
    ["REVIEW", "PENDING_APPROVAL"].includes((t.rawStatus || "").toUpperCase());

  return (
    <div className="mobile-end-user-screen manager-screen manager-task-screen">
      <header className="manager-task-header">
        <h1 className="manager-task-title">Task Overview</h1>
      </header>

      <section className="manager-section">
        <div className="manager-search-wrap">
          <span className="manager-search-icon">🔍</span>
          <input
            type="text"
            className="manager-search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="manager-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`manager-filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <section className="manager-section">
          <p className="manager-loading">Loading tasks…</p>
        </section>
      )}

      {error && !loading && (
        <section className="manager-section">
          <p className="manager-error">{error}</p>
        </section>
      )}

      {!loading && !error && (
        <section className="manager-section manager-task-list-wrap">
          <div className="manager-task-list">
            {filteredTasks.length === 0 ? (
              <p className="manager-empty">No tasks found.</p>
            ) : (
              filteredTasks.map((t) => (
                <div key={t.id ?? t._id} className={`manager-task-card ${statusClass(t.status)}`}>
                  <div className="manager-task-card-body">
                    <strong>{t.title}</strong>
                    <span>🏢 {t.location}</span>
                    <span>👤 Supervisor : {t.supervisor}</span>
                    <span>🕐 {t.due}</span>
                  </div>
                  <div className="manager-task-card-meta">
                    <span className={`manager-task-tag ${statusClass(t.status)}`}>
                      {t.status}
                    </span>
                    <span className="manager-task-category">🏛 {t.category}</span>
                  </div>
                  {isPendingApproval(t) && (
                    <div className="manager-task-approve-actions">
                      <button
                        type="button"
                        className="manager-btn-approve"
                        onClick={() => handleApprove(t.id ?? t._id)}
                        disabled={approvingId === (t.id ?? t._id)}
                      >
                        {approvingId === (t.id ?? t._id) ? "Approving…" : "✓ Approve"}
                      </button>
                      <button
                        type="button"
                        className="manager-btn-reject"
                        onClick={() => handleReject(t.id ?? t._id)}
                        disabled={rejectingId === (t.id ?? t._id)}
                      >
                        {rejectingId === (t.id ?? t._id) ? "Rejecting…" : "✕ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <ManagerBottomNav />
    </div>
  );
}
