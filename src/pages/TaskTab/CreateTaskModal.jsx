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

const CATEGORIES = ["Cleaning", "Housekeeping"];
const ZONES = [
  "Outside main door",
  "Reception Area HR Desk Employee Desk",
  "CEO Cabin",
  "Director Cabin AD",
  "Director Cabin PB",
  "Director Cabin PD",
  "Conference room",
  "common Area",
  "pantry",
  "Washroom Male/Female",
  "VIP room",
  "Ajinkya Sir Cabin",
];

export default function CreateTaskModal({ onClose, onSuccess }) {
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("Cleaning");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [propertyRoom, setPropertyRoom] = useState(ZONES[0]);
  const [dueDate, setDueDate] = useState("");
  const [startTimeHour, setStartTimeHour] = useState("9");
  const [startTimeMin, setStartTimeMin] = useState("00");
  const [startTimeAmPm, setStartTimeAmPm] = useState("AM");
  const [endTimeHour, setEndTimeHour] = useState("5");
  const [endTimeMin, setEndTimeMin] = useState("00");
  const [endTimeAmPm, setEndTimeAmPm] = useState("PM");
  const [staff, setStaff] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Backend: fetch users for assignee dropdown
  useEffect(() => {
    getUsers().then((users) => setStaff(Array.isArray(users) ? users : []));
  }, []);

  // Task duration (auto-calculated from start and end time)
  const taskDuration = (() => {
    const toMinutes = (h, m, amPm) => {
      let hour = parseInt(h, 10) || 0;
      const min = parseInt(m, 10) || 0;
      if (amPm === "PM" && hour !== 12) hour += 12;
      if (amPm === "AM" && hour === 12) hour = 0;
      return hour * 60 + min;
    };
    const startM = toMinutes(startTimeHour, startTimeMin, startTimeAmPm);
    const endM = toMinutes(endTimeHour, endTimeMin, endTimeAmPm);
    let diff = endM - startM;
    if (diff <= 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  })();

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
      // Convert assigneeId to number (backend expects numeric id)
      const numericAssigneeId = assigneeId ? parseInt(assigneeId, 10) : undefined;
      const assigneeName = staff.find((u) => u._id === assigneeId)?.name;
      
      const startTime = `${startTimeHour}:${String(startTimeMin).padStart(2, "0")} ${startTimeAmPm}`;
      const endTime = `${endTimeHour}:${String(endTimeMin).padStart(2, "0")} ${endTimeAmPm}`;
      await createTask({
        taskName: taskName.trim(),
        description: description.trim() || undefined,
        category,
        assigneeId: numericAssigneeId,
        assigneeName: assigneeName || undefined,
        priority,
        roomNumber: propertyRoom,
        dueDate: dueDate || undefined,
        startTime,
        endTime,
        status: "pending",
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
              <label className="block text-sm text-gray-600 mb-1">Zones</label>
              <select
                value={propertyRoom}
                onChange={(e) => setPropertyRoom(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
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
            {/* Start time & End time - hour, min, AM/PM */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 mb-1">Start time</label>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={startTimeHour}
                    onChange={(e) => setStartTimeHour(e.target.value)}
                    className="border px-3 py-2 rounded-lg min-w-[4rem]"
                    aria-label="Start hour"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={String(h)}>{h}</option>
                    ))}
                  </select>
                  <span className="text-gray-500">:</span>
                  <select
                    value={startTimeMin}
                    onChange={(e) => setStartTimeMin(e.target.value)}
                    className="border px-3 py-2 rounded-lg min-w-[4rem]"
                    aria-label="Start minute"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={startTimeAmPm}
                    onChange={(e) => setStartTimeAmPm(e.target.value)}
                    className="border px-3 py-2 rounded-lg min-w-[4.5rem]"
                    aria-label="Start AM/PM"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 mb-1">End time</label>
                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={endTimeHour}
                    onChange={(e) => setEndTimeHour(e.target.value)}
                    className="border px-3 py-2 rounded-lg min-w-[4rem]"
                    aria-label="End hour"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={String(h)}>{h}</option>
                    ))}
                  </select>
                  <span className="text-gray-500">:</span>
                  <select
                    value={endTimeMin}
                    onChange={(e) => setEndTimeMin(e.target.value)}
                    className="border px-3 py-2 rounded-lg min-w-[4rem]"
                    aria-label="End minute"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={endTimeAmPm}
                    onChange={(e) => setEndTimeAmPm(e.target.value)}
                    className="border px-3 py-2 rounded-lg min-w-[4.5rem]"
                    aria-label="End AM/PM"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Task Duration</label>
              <div className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium">
                {taskDuration}
              </div>
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
