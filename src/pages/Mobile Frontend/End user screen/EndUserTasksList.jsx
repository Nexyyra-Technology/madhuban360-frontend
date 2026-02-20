/**
 * End User Tasks List (navigated from bottom nav "Tasks")
 * Backend API: getMyTasks - fetches tasks from database
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import { getMyTasks } from "./endUserService";

export default function EndUserTasksList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTasks({})
      .then((t) => setTasks(Array.isArray(t) ? t : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const statusStyle = (s) => {
    if (s === "OVERDUE") return "overdue";
    if (s === "IN_PROGRESS") return "in-progress";
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
                <span className="task-due">🕐 Due: {t.dueTime || t.dueDate || "-"}</span>
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
