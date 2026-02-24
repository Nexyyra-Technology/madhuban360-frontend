/**
 * View Details Pop up – Figma: Task Details modal (tags, assignee, time, location)
 */
import { useState, useEffect } from "react";
import { getSupervisorTaskById } from "./supervisorService";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDuration(startIso, endIso) {
  if (!startIso) return "—";
  const s = new Date(startIso).getTime();
  const e = endIso ? new Date(endIso).getTime() : Date.now();
  const m = Math.floor((e - s) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
}

export default function TaskDetailsPopup({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    setLoading(true);
    getSupervisorTaskById(taskId)
      .then((t) => {
        if (!cancelled) setTask(t);
      })
      .catch(() => {
        if (!cancelled) setTask(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [taskId]);

  const isUrgent = (task?.priority || "").toUpperCase() === "HIGH" || (task?.priority || "").toUpperCase() === "URGENT";
  const startTime = task?.startedAt ?? task?.updatedAt ?? task?.dueDate;
  const endTime = task?.completedAt ?? task?.dueDate;
  const duration = formatDuration(startTime, endTime);

  return (
    <div className="supervisor-popup-overlay" onClick={onClose} role="presentation">
      <div className="supervisor-popup" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="task-details-title">
        <div className="supervisor-popup-handle" />
        <header className="supervisor-popup-header">
          <h2 id="task-details-title" className="supervisor-popup-title">Task Details</h2>
          <button type="button" className="supervisor-popup-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {loading && <p className="manager-loading">Loading…</p>}
        {!loading && task && (
          <div className="supervisor-popup-body">
            <div className="supervisor-popup-tags">
              {isUrgent && <span className="supervisor-tag urgent">URGENT</span>}
              <span className="supervisor-tag maintenance">Maintenance</span>
            </div>
            <h3 className="supervisor-popup-task-title">{task.title ?? task.taskName ?? "Untitled Task"}</h3>

            <div className="supervisor-popup-assignee">
              <div className="supervisor-popup-avatar" />
              <div>
                <strong>{task.assignee?.name ?? task.assigneeName ?? task.supervisor ?? "Unassigned"}</strong>
                <p className="supervisor-popup-role">Housekeeping</p>
              </div>
              <div className="supervisor-popup-contact-icons">
                <button type="button" className="supervisor-contact-icon" aria-label="Message">💬</button>
                <button type="button" className="supervisor-contact-icon" aria-label="Call">📞</button>
              </div>
            </div>

            <div className="supervisor-popup-time-grid">
              <div>
                <span className="supervisor-popup-label">START TIME</span>
                <p>{formatTime(startTime)}</p>
              </div>
              <div>
                <span className="supervisor-popup-label">END TIME</span>
                <p>{formatTime(endTime)}</p>
              </div>
              <div>
                <span className="supervisor-popup-label">DURATION</span>
                <p>{duration}</p>
              </div>
            </div>

            <div className="supervisor-popup-location">
              <span className="supervisor-popup-label">EXACT LOCATION</span>
              <p>📍 {task.location ?? task.locationFloor ?? task.roomNumber ?? "—"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
