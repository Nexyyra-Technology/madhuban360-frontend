/**
 * Edit Task Modal (Figma: Edit Task)
 * ----------------------------------
 * Same sections as Create Task, pre-filled with task data.
 * Backend: PUT /api/tasks/:id - updates task; data saved to backend/database
 */
import { useState, useEffect } from "react";
import { updateTask } from "./taskService";
import { getUsers } from "../UserTab/userService";
import ModalWrapper from "../UserTab/ModalWrapper";

const CATEGORIES = ["Maintenance", "Cleaning", "Inspection", "Preventive Maintenance", "Repair"];
const LOCATIONS = ["East Wing, Ground Floor", "North Tower, Floor 4, Server Room B", "North Tower > Floor 4 > Server Room B", "West Building"];

export default function EditTaskModal({ task, onClose, onSuccess }) {
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("Maintenance");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [propertyRoom, setPropertyRoom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("02:00 PM");
  const [staff, setStaff] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTaskName(task.title || "");
      setCategory(task.category || "Maintenance");
      setDescription(task.description || "");
      setAssigneeId(task.assigneeId || "");
      setPriority(task.priority || "HIGH");
      setPropertyRoom(task.location || "North Tower > Floor 4 > Server Room B");
      const d = task.dueDate || "";
      setDueDate(d.includes("-") ? d : d ? d.replace(/\//g, "-").split("-").reverse().join("-") : "");
      setDueTime(task.dueTime || "14:00");
    }
  }, [task]);

  // Backend: fetch users for assignee dropdown
  useEffect(() => {
    getUsers().then((users) => setStaff(Array.isArray(users) ? users : []));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!task?._id || !taskName.trim()) {
      setError("Task name is required");
      return;
    }
    try {
      setSaving(true);
      // Backend: PUT /api/tasks/:id - changes saved to backend/database
      const res = await updateTask(task._id, {
        title: taskName.trim(),
        description: description.trim() || undefined,
        category,
        assigneeId: assigneeId || undefined,
        assignee: staff.find((u) => u._id === assigneeId) ? { name: staff.find((u) => u._id === assigneeId).name } : task.assignee,
        priority,
        location: propertyRoom,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
      });
      const updated = res?.data ?? res ?? { ...task, title: taskName.trim(), description, category, priority, location: propertyRoom, dueDate };
      onSuccess?.(updated);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  if (!task) return null;

  return (
    <ModalWrapper widthClass="w-[640px] max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Edit Task</h2>
          <span className="text-sm text-gray-500">#{task._id}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* BASIC INFO */}
        <section>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">BASIC INFO</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Task Name</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ASSIGNMENT & PRIORITY */}
        <section>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">ASSIGNMENT & PRIORITY</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="">Select staff member...</option>
                {staff.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Priority</label>
              <div className="flex gap-2">
                {["HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      priority === p ? "bg-[#1f2a44] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION & SCHEDULE */}
        <section>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">LOCATION & SCHEDULE</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Property/Room</label>
              <select
                value={propertyRoom}
                onChange={(e) => setPropertyRoom(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full border px-4 py-2 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}
        <section>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">DESCRIPTION</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </section>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#1f2a44] text-white rounded-lg disabled:opacity-60 flex items-center gap-2"
          >
            💾 Save Changes
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
