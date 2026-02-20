/**
 * Task Details (Figma: Task Details)
 * ----------------------------------
 * Full task view: title, status, assigned by/to, priority rationale, description,
 * location, category, timeline, activity log. Actions: Edit, Share, Put on Hold, Complete.
 * Backend: Task loaded via getTaskById(); updates via updateTask/updateTaskStatus.
 */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTaskById, updateTaskStatus } from "./taskService";
import EditTaskModal from "./EditTaskModal";
import SuccessToast from "./SuccessToast";

const STATUS_LABELS = { TO_DO: "To Do", IN_PROGRESS: "In Progress", REVIEW: "Review", COMPLETED: "Completed" };

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    getTaskById(id).then((t) => setTask(t || null));
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
    setToast({ title: "Success!", message: "Updated Successfully" });
  }

  if (!task) return <div className="p-8">Loading...</div>;

  const statusLabel = STATUS_LABELS[task.status] || task.status;
  const assigneeName = task.assignee?.name || "Unassigned";
  const assigneeInitials = assigneeName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const assignedByName = task.assignedBy?.name || "—";

  return (
    <div className="p-8 bg-[#f5f7fb] min-h-screen">
      <button onClick={() => navigate("/tasks")} className="text-sm text-blue-600 mb-6">← Back</button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-6">
          {/* Task title and status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">{task.title} #{task._id}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{statusLabel}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">Updated 20 mins ago</span>
            </div>
          </div>

          {/* Assigned by / Assigned to */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">ASSIGNED BY</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">{assignedByName.slice(0, 2).toUpperCase()}</div>
                <div>
                  <p className="font-medium">{assignedByName}</p>
                  <p className="text-sm text-gray-500">Facility Manager</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">ASSIGNED TO</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">{assigneeInitials}</div>
                <div>
                  <p className="font-medium">{assigneeName}</p>
                  <p className="text-sm text-gray-500">Senior Technician</p>
                </div>
              </div>
            </div>
          </div>

          {/* High priority rationale - Figma */}
          {task.priority === "HIGH" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-700 flex items-center gap-2">! HIGH PRIORITY</p>
              <p className="text-sm text-gray-700 mt-2">
                Risk of equipment failure and potential downtime. Immediate inspection required.
              </p>
            </div>
          )}

          {/* Task Description - Figma */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Task Description</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          {/* Location & Category - Figma */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>📍</span>
              <span>{task.location || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>🏠</span>
              <span>{task.category || "—"}</span>
            </div>
          </div>
        </div>

        {/* Right column - Timeline & Activity */}
        <div className="w-full lg:w-[340px] space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline & Schedule</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">📅 START TIME: Oct 24, 08:00 AM</p>
              <p className="text-sm text-gray-600">✓ DUE DATE: {task.dueDate || "—"}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Log</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <div>
                  <p className="text-sm font-medium">In Progress</p>
                  <p className="text-xs text-gray-500">Mike Ross started work — Today, 08:45 AM</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                <div>
                  <p className="text-sm font-medium">Assigned</p>
                  <p className="text-xs text-gray-500">Assigned to Mike Ross — Today, 08:15 AM</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-gray-500">Ticket created by Alex Rivera — Today, 08:00 AM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer actions - Figma: Edit, Share, Put on Hold, Complete */}
      <div className="mt-8 pt-6 border-t flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 border rounded-lg flex items-center gap-2"
          >
            ✏️ Edit Task
          </button>
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
            Share
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-600 border rounded-lg">Put on Hold</button>
          <button
            onClick={handleComplete}
            disabled={task.status === "COMPLETED"}
            className="px-4 py-2 bg-[#1f2a44] text-white rounded-lg disabled:opacity-50"
          >
            Complete Task
          </button>
        </div>
      </div>

      {showEdit && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEdit(false)}
          onSuccess={handleEditSuccess}
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
