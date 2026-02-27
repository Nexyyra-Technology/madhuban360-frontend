/**
 * Task Details (Figma layout)
 * ---------------------------
 * Modal-style view: header, two-column body (assignment, priority, description, timeline, activity log), footer.
 * Data from backend: getTaskById()
 */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTaskById, updateTaskStatus } from "./taskService";
import EditTaskModal from "./EditTaskModal";
import SuccessToast from "./SuccessToast";

const STATUS_LABELS = { TO_DO: "To Do", IN_PROGRESS: "In Progress", REVIEW: "Review", COMPLETED: "Completed" };
const PRIORITY_RATIONALE = {
  HIGH: "Risk of equipment failure and potential downtime. Immediate inspection required.",
  URGENT: "Urgent attention required to prevent escalation.",
  MEDIUM: "Standard priority task requiring timely completion.",
  LOW: "Low priority. Complete when capacity allows.",
  NORMAL: "Normal priority task.",
};

function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = `${months[d.getMonth()]} ${d.getDate()}`;
  if (timeStr) {
    const t = String(timeStr).trim();
    if (/^\d{1,2}:\d{2}$/.test(t)) {
      const [h, m] = t.split(":").map(Number);
      const hour = h % 12 || 12;
      const amPm = h >= 12 ? "PM" : "AM";
      return `${date}, ${hour}:${String(m).padStart(2, "0")} ${amPm}`;
    }
    return `${date}, ${t}`;
  }
  return date;
}

function formatDuration(mins) {
  if (mins == null) return "—";
  const m = parseInt(mins, 10) || 0;
  if (m < 60) return `${m} Mins`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} Hr ${r} Mins` : `${h} Hr`;
}

function buildActivityLog(task) {
  const log = task.activityLog && Array.isArray(task.activityLog) ? [...task.activityLog] : [];
  if (log.length) return log;

  const assigneeName = task.assignee?.name || "Assignee";
  const assignedByName = task.assignedBy?.name || "Creator";
  const status = (task.status || "TO_DO").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  if (task.status === "COMPLETED") {
    log.push({ type: "completed", title: "Completed", desc: `${assigneeName} completed the task`, time: task.completedAt || "—", active: true });
  }
  if (task.status === "IN_PROGRESS" || task.status === "REVIEW" || task.status === "COMPLETED") {
    log.push({ type: "in_progress", title: "In Progress", desc: `${assigneeName} started work`, time: "—", active: task.status === "IN_PROGRESS" });
  }
  log.push({ type: "assigned", title: "Assigned", desc: `Assigned to ${assigneeName}`, time: "—", active: false });
  log.push({ type: "created", title: "Created", desc: `Ticket created by ${assignedByName}`, time: task.createdAt || "—", active: false });

  return log.reverse();
}

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTaskById(id)
      .then((t) => setTask(t || null))
      .catch(() => setTask(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleComplete() {
    if (!task?._id) return;
    try {
      await updateTaskStatus(task._id, "COMPLETED");
      setTask((prev) => (prev ? { ...prev, status: "COMPLETED" } : null));
      setToast({ title: "Success!", message: "Task completed successfully." });
    } catch (e) {
      console.error("Complete failed:", e);
    }
  }

  function handleEditSuccess(updated) {
    setTask(updated);
    setShowEdit(false);
    setToast({ title: "Success!", message: "Updated successfully." });
  }

  if (loading) {
    return (
      <div className="task-details-page">
        <div className="task-details-loading">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-details-page">
        <div className="task-details-loading">Task not found</div>
        <button type="button" onClick={() => navigate("/tasks")} className="task-details-back">
          ← Back to tasks
        </button>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[task.status] || task.status;
  const assigneeName = task.assignee?.name || "Unassigned";
  const assigneeRole = task.assignee?.jobTitle ?? task.assignee?.role ?? "Staff";
  const assigneeInitials = assigneeName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const assignedByName = task.assignedBy?.name || "—";
  const assignedByRole = task.assignedBy?.jobTitle ?? task.assignedBy?.role ?? "Manager";
  const assignedByInitials = assignedByName === "—" ? "—" : assignedByName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const instructions = task.instructions && Array.isArray(task.instructions) ? task.instructions : [];
  const locationDisplay = task.roomNumber || task.locationFloor || task.location || "—";
  const categoryDisplay = task.category || task.departmentName || "—";
  const priorityRationale = task.priorityRationale ?? PRIORITY_RATIONALE[task.priority] ?? "";
  const activityLog = buildActivityLog(task);
  const propertyName = task.propertyName || "—";
  const guestRequest = task.guestRequest || "";
  const attachments = task.attachments && Array.isArray(task.attachments) ? task.attachments : [];
  const frequency = task.frequency || "—";
  const startDateFormatted = task.startDate ? formatDateTime(task.startDate) : "—";
  const endDateFormatted = task.endDate ? formatDateTime(task.endDate) : "—";

  const startTimeFormatted = task.startTime ? formatDateTime(task.dueDate, task.startTime) : (task.dueDate ? formatDateTime(task.dueDate) : "—");
  const dueTimeFormatted = task.endTime ? formatDateTime(task.dueDate, task.endTime) : (task.dueDate ? formatDateTime(task.dueDate) : "—");
  const durationFormatted = formatDuration(task.timeDuration);

  return (
    <div className="task-details-page">
      <div className="task-details-modal">
        {/* Modal Header */}
        <header className="task-details-header">
          <div className="task-details-header-left">
            <div className="task-details-icon-wrap" />
            <div>
              <h1 className="task-details-title">{task.title}</h1>
              <div className="task-details-header-meta">
                <span className={`task-details-status-badge task-details-status-${(task.status || "").toLowerCase().replace("_", "-")}`}>
                  {statusLabel}
                </span>
                <span className="task-details-sep">•</span>
                <span className="task-details-updated">Updated 20 mins ago</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/tasks")} className="task-details-close" aria-label="Close">
            ✕
          </button>
        </header>

        {/* Modal Body - Scrollable */}
        <div className="task-details-body">
          {/* Left Column */}
          <div className="task-details-main">
            {/* Assignment Info */}
            <div className="task-details-assignment">
              <div className="task-details-card task-details-card-assign">
                <span className="task-details-label">ASSIGNED BY</span>
                <div className="task-details-user">
                  <div className="task-details-avatar">{assignedByInitials}</div>
                  <div>
                    <div className="task-details-user-name">{assignedByName}</div>
                    <div className="task-details-user-role">{assignedByRole}</div>
                  </div>
                </div>
              </div>
              <div className="task-details-card task-details-card-assign">
                <span className="task-details-label">ASSIGNED TO</span>
                <div className="task-details-user">
                  <div className="task-details-avatar">{assigneeInitials}</div>
                  <div>
                    <div className="task-details-user-name">{assigneeName}</div>
                    <div className="task-details-user-role">{assigneeRole}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Rationale */}
            {(task.priority === "HIGH" || task.priority === "URGENT") && (
              <div className="task-details-priority-rationale">
                <div className="task-details-priority-bar" />
                <div>
                  <div className="task-details-priority-title">{task.priority} PRIORITY</div>
                  <div className="task-details-priority-text">{priorityRationale}</div>
                </div>
              </div>
            )}

            {/* Task Description */}
            <div className="task-details-card task-details-description-card">
              <h3 className="task-details-section-title">
                <span className="task-details-section-icon" />
                Task Description
              </h3>
              <p className="task-details-desc">{task.description || "—"}</p>
              {instructions.length > 0 && (
                <ul className="task-details-instructions">
                  {instructions.map((inst, i) => (
                    <li key={i}>
                      <span className="task-details-bullet">•</span>
                      <span>{inst.title ? `${inst.title}: ${inst.description || ""}` : inst.description || inst}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Property Information */}
            <div className="task-details-tech-grid">
              <div className="task-details-tech-item">
                <span className="task-details-tech-icon">🏢</span>
                <div>
                  <span className="task-details-label">PROPERTY</span>
                  <span className="task-details-tech-value">{propertyName}</span>
                </div>
              </div>
              <div className="task-details-tech-item">
                <span className="task-details-tech-icon">📍</span>
                <div>
                  <span className="task-details-label">LOCATION</span>
                  <span className="task-details-tech-value">{locationDisplay}</span>
                </div>
              </div>
              <div className="task-details-tech-item">
                <span className="task-details-tech-icon">📋</span>
                <div>
                  <span className="task-details-label">CATEGORY</span>
                  <span className="task-details-tech-value">{categoryDisplay}</span>
                </div>
              </div>
              <div className="task-details-tech-item">
                <span className="task-details-tech-icon">🔄</span>
                <div>
                  <span className="task-details-label">FREQUENCY</span>
                  <span className="task-details-tech-value">{frequency}</span>
                </div>
              </div>
            </div>

            {/* Guest Request */}
            {guestRequest && (
              <div className="task-details-card task-details-description-card">
                <h3 className="task-details-section-title">
                  <span className="task-details-section-icon">👤</span>
                  Guest Request
                </h3>
                <p className="task-details-desc">{guestRequest}</p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <aside className="task-details-sidebar">
            {/* Timeline & Schedule */}
            <div className="task-details-card task-details-schedule-card">
              <h3 className="task-details-sidebar-title">Timeline & Schedule</h3>
              <div className="task-details-schedule-list">
                <div className="task-details-schedule-row">
                  <div>
                    <span className="task-details-label">START DATE</span>
                    <span className="task-details-schedule-value">{startDateFormatted}</span>
                  </div>
                  <span className="task-details-schedule-icon">📅</span>
                </div>
                <div className="task-details-schedule-row">
                  <div>
                    <span className="task-details-label">END DATE</span>
                    <span className="task-details-schedule-value">{endDateFormatted}</span>
                  </div>
                  <span className="task-details-schedule-icon">📅</span>
                </div>
                <div className="task-details-schedule-row">
                  <div>
                    <span className="task-details-label">START TIME</span>
                    <span className="task-details-schedule-value">{startTimeFormatted}</span>
                  </div>
                  <span className="task-details-schedule-icon">⏰</span>
                </div>
                <div className="task-details-schedule-row">
                  <div>
                    <span className="task-details-label">DUE TIME</span>
                    <span className="task-details-schedule-value">{dueTimeFormatted}</span>
                  </div>
                  <span className="task-details-schedule-icon">⏰</span>
                </div>
                <div className="task-details-schedule-row">
                  <div>
                    <span className="task-details-label">DURATION</span>
                    <span className="task-details-schedule-value">{durationFormatted}</span>
                  </div>
                  <span className="task-details-schedule-icon">⏱</span>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="task-details-card task-details-activity-card">
              <h3 className="task-details-sidebar-title">Activity Log</h3>
              <div className="task-details-activity-timeline">
                {activityLog.map((item, i) => (
                  <div key={i} className={`task-details-activity-item ${item.active ? "active" : ""}`}>
                    <div className="task-details-activity-dot" />
                    <div>
                      <div className="task-details-activity-title">{item.title}</div>
                      <div className="task-details-activity-desc">{item.desc}</div>
                      <div className="task-details-activity-time">{item.time || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Modal Footer */}
        <footer className="task-details-footer">
          <div className="task-details-footer-left">
            <button type="button" onClick={() => setShowEdit(true)} className="task-details-btn task-details-btn-secondary">
              ✏️ Edit Task
            </button>
            <button type="button" className="task-details-btn task-details-btn-secondary">
              Share
            </button>
          </div>
          <div className="task-details-footer-right">
            <button type="button" className="task-details-btn task-details-btn-ghost">
              Put on Hold
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={task.status === "COMPLETED"}
              className="task-details-btn task-details-btn-primary"
            >
              Complete Task
            </button>
          </div>
        </footer>
      </div>

      {showEdit && (
        <EditTaskModal task={task} onClose={() => setShowEdit(false)} onSuccess={handleEditSuccess} />
      )}

      {toast && (
        <SuccessToast title={toast.title} message={toast.message} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
