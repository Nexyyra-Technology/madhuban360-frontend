/**
 * EndUserTasksList – List of assigned tasks for end user
 * -----------------------------------------------------------------------
 * - Fetches tasks via getMyTasks from backend
 * - Task cards show title, subtitle, description, due time, status
 * - Click navigates to /mobile/task/:id
 * - Route: /mobile/tasks (protected)
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import { getMyAssignedTasks, formatTaskDuration, formatTaskEndTime } from "./endUserService";

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
                <span className="task-due">🕐 End time: {formatTaskEndTime(t.dueTime || t.dueDate) ?? "—"}</span>
                <span className="task-due task-duration">⏱ Task duration: {formatTaskDuration(t.durationMinutes) ?? "—"}</span>
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
