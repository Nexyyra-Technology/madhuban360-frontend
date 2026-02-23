/**
 * Task Manager (Figma: Full Task Manager)
 * --------------------------------------
 * Kanban board with TO-DO, IN PROGRESS, REVIEW, COMPLETED columns.
 * Filters: Priority, Staff, Due Date.
 * Backend: Tasks loaded via getTasks(), refreshed on create/update/delete.
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
  HIGH: "bg-red-100 text-red-700 border-red-200",
  URGENT: "bg-orange-100 text-orange-700 border-orange-200",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
  LOW: "bg-sky-100 text-sky-700 border-sky-200",
  NORMAL: "bg-gray-100 text-gray-700 border-gray-200",
};

function TaskCard({ task, onClick }) {
  const priorityClass = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.NORMAL;
  const assigneeName = task.assignee?.name || "Unassigned";
  const initials = assigneeName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      onClick={() => onClick(task)}
      className="task-card bg-white rounded-lg border shadow-sm p-4 cursor-pointer hover:shadow-md transition mb-3"
    >
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityClass}`}>
        {task.priority}
      </span>
      <h4 className="font-medium text-gray-900 mt-2">{task.title}</h4>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          {initials}
        </div>
        {task.progress != null && (
          <span className="text-xs text-gray-500">{task.progress}%</span>
        )}
        {task.dueDate && <span className="text-xs text-gray-500">{task.dueDate}</span>}
        {task.completedAt && <span className="text-xs text-green-600">{task.completedAt}</span>}
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

  async function refreshTasks() {
    setLoading(true);
    try {
      // Backend: pass filters when API supports them
      const data = await getTasks({ priority: priorityFilter !== "All" ? priorityFilter : undefined });
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshTasks(); }, []);

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

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">
      {/* Header - Figma: Task Manager, Create Task button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1f2937]">Task Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track daily tasks across users.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1f2a44] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
        >
          + Create Task
        </button>
      </div>

      {/* Filters - Figma: Priority, Staff, Due Date */}
      <div className="flex gap-3 mb-6 items-center">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white text-sm"
        >
          <option>All</option>
          <option>HIGH</option>
          <option>MEDIUM</option>
          <option>LOW</option>
        </select>
        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white text-sm"
        >
          <option>All Assigned</option>
        </select>
        <select
          value={dueFilter}
          onChange={(e) => setDueFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white text-sm"
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>Overdue</option>
        </select>
        <span className="text-xs text-gray-500 ml-auto">Last updated: 2 mins ago</span>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading tasks...</div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="kanban-column flex-shrink-0 w-[320px] bg-gray-100 rounded-xl p-4 min-h-[400px]"
            >
              <h3 className="font-semibold text-gray-700 mb-4">
                {col.label} ({tasksByColumn[col.key]?.length ?? 0})
              </h3>
              {(tasksByColumn[col.key] || []).map((task) => (
                <TaskCard key={task._id} task={task} onClick={handleTaskClick} />
              ))}
            </div>
          ))}
          <div className="flex-shrink-0 w-[320px] flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 min-h-[400px] text-gray-400 text-sm">
            + Add Column
          </div>
        </div>
      )}

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
