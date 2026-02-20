/**
 * Create Task Modal (Figma: Create New Task)
 * ------------------------------------------
 * Sections: BASIC INFO, ASSIGNMENT & PRIORITY, LOCATION & SCHEDULE, ATTACHMENTS
 * Backend: POST /api/tasks - creates task, data saved to backend/database
 */
import { useState, useEffect } from "react";
import { createTask } from "./taskService";
import { getUsers } from "../UserTab/userService";
import ModalWrapper from "../UserTab/ModalWrapper";

const CATEGORIES = ["Maintenance", "Cleaning", "Inspection", "Preventive Maintenance", "Repair"];
const LOCATIONS = ["East Wing, Ground Floor", "North Tower, Floor 4, Server Room B", "West Building"];

export default function CreateTaskModal({ onClose, onSuccess }) {
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("Maintenance");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [propertyRoom, setPropertyRoom] = useState("East Wing, Ground Floor");
  const [dueDate, setDueDate] = useState("");
  const [staff, setStaff] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Backend: fetch users for assignee dropdown
  useEffect(() => {
    getUsers().then((users) => setStaff(Array.isArray(users) ? users : []));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }
    try {
      setSaving(true);
      // Backend: POST /api/tasks - payload saved to backend/database
      await createTask({
        title: taskName.trim(),
        description: description.trim() || undefined,
        category,
        assigneeId: assigneeId || undefined,
        assignee: staff.find((u) => u._id === assigneeId)?.name,
        priority,
        location: propertyRoom,
        dueDate: dueDate || undefined,
        status: "TO_DO",
      });
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper widthClass="w-[640px] max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold">Create New Task</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={handleCreate} className="mt-6 space-y-6">
        {/* BASIC INFO - Figma */}
        <section>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">BASIC INFO</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Task Name</label>
              <input
                type="text"
                placeholder="e.g. HVAC Filter Replacement"
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
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                placeholder="Describe the work to be performed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* ASSIGNMENT & PRIORITY - Figma */}
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
                      priority === p
                        ? p === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : p === "MEDIUM"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION & SCHEDULE - Figma */}
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
            <div>
              <label className="block text-sm text-gray-600 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* ATTACHMENTS - Figma */}
        <section>
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">ATTACHMENTS</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <div className="text-2xl mb-2">↑</div>
            <p className="text-sm">Click to upload or drag and drop</p>
            <p className="text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
            {/* Backend: file upload would POST to /api/tasks/:id/attachments */}
          </div>
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
            + Create Task
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
