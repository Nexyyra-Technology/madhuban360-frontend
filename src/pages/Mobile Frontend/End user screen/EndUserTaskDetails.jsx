/**
 * EndUserTaskDetails – Single task view
 * -----------------------------------------------------------------------
 * - Fetches task via getTaskById
 * - Shows location, due time, guest request
 * - Start Task calls updateTaskStatus IN_PROGRESS, navigates to completion
 * - Route: /mobile/task/:id (protected)
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";
import { getTaskById, updateTaskStatus, formatTaskEndTime, formatTaskDuration } from "./endUserService";

export default function EndUserTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTaskById(id)
      .then(setTask)
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStartTask() {
    if (!id) return;
    setStarting(true);
    try {
      await updateTaskStatus(id, "IN_PROGRESS");
      navigate(`/mobile/task/${id}/complete`);
    } catch (e) {
      navigate(`/mobile/task/${id}/complete`);
    } finally {
      setStarting(false);
    }
  }

  if (loading || !task) {
    return (
      <div className="mobile-end-user-screen">
        <button type="button" className="mobile-back-btn" onClick={() => navigate("/mobile/dashboard")}>←</button>
        <p>Loading task...</p>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="mobile-end-user-screen mobile-task-details">
      <header className="end-user-page-header">
        <button type="button" className="mobile-back-btn" onClick={() => navigate("/mobile/dashboard")}>←</button>
        <h1>Task Details</h1>
      </header>

      <div className="task-detail-card">
        <h2>📍 {task.title}</h2>
        <p className="task-location">📍 {task.location || task.subtitle || "3rd Floor - Deluxe Suite"}</p>
        <h3>{task.description || "Deep Clean & Linen Change"}</h3>
        <p className="task-due">🕐 End time: {formatTaskEndTime(task.dueTime || task.dueDate || task.dueBy) ?? "—"}</p>
        <p className="task-due">⏱ Task duration: {formatTaskDuration(task.durationMinutes) ?? "10 min"}</p>
      </div>

      {task.guestRequest && (
        <div className="task-guest-request">
          <span>⚠️ Guest Request</span>
          <p>{task.guestRequest}</p>
        </div>
      )}

      <div className="task-actions-row">
        <button
          type="button"
          className="end-user-primary-btn"
          onClick={handleStartTask}
          disabled={starting}
        >
          ▶ Start Task
        </button>
      </div>

      <MobileBottomNav />
    </div>
  );
}
