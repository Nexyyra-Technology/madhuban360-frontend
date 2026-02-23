/**
 * Task Manager (Figma: Full Task Manager) – Image 2 redesign
 * ----------------------------------------------------------
 * Kanban board with TO-DO, IN PROGRESS, REVIEW, COMPLETED columns.
 * Filters: Priority, Staff, Due Date.
 * Backend: Tasks loaded via getTasks(), refreshed on create/update/delete.
 * UI only – no backend/API changes.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTasks } from "./taskService";
import CreateTaskModal from "./CreateTaskModal";
import SuccessToast from "./SuccessToast";

const COLUMNS = [
  { key: "TO_DO", label: "TO-DO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "REVIEW", label: "REVIEW" },
  { key: "COMPLETED", label: "COMPLETED" },
];

const PRIORITY_STYLES = {
  HIGH: "task-priority-high",
  URGENT: "task-priority-urgent",
  MEDIUM: "task-priority-medium",
  LOW: "task-priority-low",
  NORMAL: "task-priority-normal",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatShortDate(str) {
  if (!str) return "";
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${MONTHS[parseInt(m[2], 10) - 1]} ${parseInt(m[3], 10)}`;
  return str;
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 11-9-9 9 0 019 9z" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
function IconMoreVert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  );
}
function IconFlag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
function IconVisibility() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconDocument() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TaskCard({ task, onClick, onMenuClick, isCompleted }) {
  const status = (task.status || "TO_DO").replace(/ /g, "_");
  const priorityClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.NORMAL;
  const priorityLabel = task.priority === "HIGH" ? "HIGH PRIORITY" : task.priority;
  const assigneeName = task.assignee?.name || "Unassigned";
  const initials = assigneeName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleMenu = (e) => {
    e.stopPropagation();
    onMenuClick?.(e, task);
  };

  const renderStatusTag = () => {
    if (status === "TO_DO") {
      return task.dueDate ? (
        <span className="task-card-tag">{formatShortDate(task.dueDate)}</span>
      ) : (
        <span className="task-card-tag task-card-tag-required">Required</span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="task-card-tag task-card-tag-progress">
          <IconDocument />
          {task.progress != null ? `${task.progress}%` : "In progress"}
        </span>
      );
    }
    if (status === "REVIEW") {
      return (
        <span className="task-card-tag task-card-tag-proof">
          <IconCheck />
          Proof Ready
        </span>
      );
    }
    if (status === "COMPLETED") {
      const completedText = typeof task.completedAt === "string" && /ago|h|m|d/i.test(task.completedAt)
        ? `Finished ${task.completedAt}`
        : task.completedAt
          ? `Finished ${formatShortDate(task.completedAt)}`
          : "Completed";
      return (
        <span className="task-card-tag task-card-tag-finished">
          <IconCheck />
          {completedText}
        </span>
      );
    }
    return null;
  };

  const renderStatusIcon = () => {
    if (status === "IN_PROGRESS") return <IconFlag className="task-card-status-icon" />;
    if (status === "REVIEW") return <IconVisibility className="task-card-status-icon" />;
    if (status === "COMPLETED") return <IconCheck className="task-card-status-icon task-card-status-icon-success" />;
    return null;
  };

  return (
    <div
      onClick={() => onClick(task)}
      className={`task-manager-card ${isCompleted ? "task-manager-card-completed" : ""}`}
    >
      <div className="task-manager-card-header">
        <span className={`task-manager-priority-badge ${priorityClass}`}>{priorityLabel}</span>
        <div className="task-manager-card-actions">
          {renderStatusIcon()}
          <button type="button" className="task-manager-card-menu" onClick={handleMenu} aria-label="More options">
            <IconMoreVert />
          </button>
        </div>
      </div>
      <h4 className="task-manager-card-title">{task.title}</h4>
      <p className="task-manager-card-desc">{task.description || ""}</p>
      <div className="task-manager-card-footer">
        <div className="task-manager-assignee">
          <div className="task-manager-avatar">{initials}</div>
          <span className="task-manager-assignee-name">{assigneeName}</span>
        </div>
        {renderStatusTag()}
      </div>
    </div>
  );
}

export default function TaskManager() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [staffFilter, setStaffFilter] = useState("All Assigned");
  const [dueFilter, setDueFilter] = useState("This Week");
  const [toast, setToast] = useState(null);
  const [lastUpdated] = useState("2 mins ago");

  async function refreshTasks() {
    setLoading(true);
    try {
      const data = await getTasks({ priority: priorityFilter !== "All" ? priorityFilter : undefined });
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshTasks();
  }, []);

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => (t.status || "TO_DO").replace(/ /g, "_") === col.key);
    return acc;
  }, {});

  function handleCreateSuccess() {
    refreshTasks();
    setShowCreate(false);
    setToast({ title: "Success!", message: "Task created successfully." });
  }

  function handleTaskClick(task) {
    navigate(`/tasks/${task._id}`);
  }

  function handleRefresh() {
    refreshTasks();
  }

  return (
    <div className="task-manager-page">
      <div className="task-manager-content">
        {/* Page header – title, subtitle, Create Task */}
        <header className="task-manager-page-header">
          <div>
            <h1 className="task-manager-page-title">Task Manager</h1>
            <p className="task-manager-page-subtitle">Manage and track daily tasks across users.</p>
          </div>
          <button type="button" className="task-manager-create-btn" onClick={() => setShowCreate(true)}>
            <span>+</span> Create Task
          </button>
        </header>

        {/* Filters bar */}
        <div className="task-manager-filters">
          <div className="task-manager-filter-group">
            <div className="task-manager-filter-item">
              <span className="task-manager-filter-prefix">Priority: </span>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="task-manager-filter-btn">
                <option>All</option>
                <option>HIGH</option>
                <option>MEDIUM</option>
                <option>LOW</option>
              </select>
            </div>
            <div className="task-manager-filter-item">
              <span className="task-manager-filter-prefix">Staff: </span>
              <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} className="task-manager-filter-btn">
                <option>All Assigned</option>
              </select>
            </div>
            <div className="task-manager-filter-item">
              <span className="task-manager-filter-prefix">Due Date: </span>
              <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value)} className="task-manager-filter-btn">
                <option>This Week</option>
                <option>This Month</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
          <div className="task-manager-last-updated">
            <button type="button" className="task-manager-refresh-btn" onClick={handleRefresh} title="Refresh">
              <IconRefresh />
            </button>
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Horizontal task rows per status */}
        {loading ? (
          <div className="task-manager-loading">Loading tasks...</div>
        ) : (
          <div className="task-manager-board">
            {COLUMNS.map((col) => (
              <section key={col.key} className="task-manager-row">
                <div className="task-manager-row-header">
                  <h3 className={`task-manager-row-title task-manager-row-title-${col.key.toLowerCase()}`}>
                    {col.label}
                  </h3>
                  <span className={`task-manager-row-badge task-manager-row-badge-${col.key.toLowerCase()}`}>
                    {(tasksByColumn[col.key] || []).length}
                  </span>
                  <button type="button" className="task-manager-row-menu" aria-label="Options">
                    <IconMoreVert />
                  </button>
                </div>
                <div className="task-manager-row-cards">
                  {(tasksByColumn[col.key] || []).map((task) => (
                    <TaskCard key={task._id} task={task} onClick={handleTaskClick} isCompleted={col.key === "COMPLETED"} />
                  ))}
                </div>
              </section>
            ))}
            <div className="task-manager-add-column">
              <div className="task-manager-add-column-circle">
                <IconPlus />
              </div>
              <span>Add New Column</span>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {toast && (
        <SuccessToast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
