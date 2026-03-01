/**
 * EndUserTasksList – List of assigned tasks for end user (My Tasks page)
 * -----------------------------------------------------------------------
 * - On load: GET /api/staff/tasks (http://localhost:5173/api/staff/tasks in dev)
 *   via getMyAssignedTasks() with Authorization: Bearer <staff token>
 * - Task cards show title, subtitle, description, due time, status
 * - Click navigates to /mobile/task/:id
 * - Route: /mobile/tasks (protected; requires token or redirect to /mobile/login)
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import { getMyAssignedTasks, formatTaskDuration, formatTaskEndTime, formatTaskTime } from "./endUserService";

export default function EndUserTasksList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssignedTasks()
      .then((t) => setTasks(Array.isArray(t) ? t : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const statusStyle = (s) => {
    const status = (s || "").toUpperCase();
    if (status === "COMPLETED") return "completed";
    if (status === "OVERDUE") return "overdue";
    if (status === "IN_PROGRESS") return "in-progress";
    return "pending";
  };

  return (
    <div className="mobile-end-user-screen">
      <header className="end-user-page-header">
        <h1>My Tasks</h1>
      </header>
      <div className="end-user-task-list">
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks assigned</p>
        ) : (
          tasks.map((t) => (
            <button
              key={t._id}
              type="button"
              className={`end-user-task-card ${statusStyle(t.status)}`}
              onClick={() => navigate(`/mobile/task/${t._id}`)}
            >
              <div className="task-card-left">
                <strong>{t.title}</strong>
                <span>{t.subtitle || t.category}</span>
                <p>{t.description}</p>
                <div className="task-card-times" role="grid" aria-label="Task schedule">
                  <div className="task-time-col">
                    <span className="task-time-label">Start</span>
                    <span className="task-time-value">{formatTaskTime(t.startTime) ?? formatTaskEndTime(t.dueDate) ?? "—"}</span>
                  </div>
                  <div className="task-time-col">
                    <span className="task-time-label">End</span>
                    <span className="task-time-value">{formatTaskTime(t.endTime) ?? formatTaskEndTime(t.dueTime || t.dueDate) ?? "—"}</span>
                  </div>
                  <div className="task-time-col">
                    <span className="task-time-label">Duration</span>
                    <span className="task-time-value">{formatTaskDuration(t.durationMinutes) ?? "—"}</span>
                  </div>
                </div>
              </div>
              <span className={`task-tag ${statusStyle(t.status)}`}>
                {t.status?.replace(/_/g, " ") || "Pending"}
              </span>
              <span className="task-arrow">→</span>
            </button>
          ))
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
