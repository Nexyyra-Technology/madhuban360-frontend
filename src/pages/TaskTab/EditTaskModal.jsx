/**
 * Edit Task Modal (Figma: Edit Task)
 * ----------------------------------
 * Same sections as Create Task, pre-filled with task data.
 * Backend: PUT /api/tasks/:id - updates task; data saved to backend/database
 */
import { useState, useEffect } from "react";
import { updateTask } from "./taskService";
import { getUsersForAssignee, getDepartments } from "../UserTab/userService";
import ModalWrapper from "../UserTab/ModalWrapper";
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

export default function EditTaskModal({ task, onClose, onSuccess }) {
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [propertyRoom, setPropertyRoom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("02:00 PM");
  const [startTimeHour, setStartTimeHour] = useState("9");
  const [startTimeMin, setStartTimeMin] = useState("00");
  const [startTimeAmPm, setStartTimeAmPm] = useState("AM");
  const [endTimeHour, setEndTimeHour] = useState("5");
  const [endTimeMin, setEndTimeMin] = useState("00");
  const [endTimeAmPm, setEndTimeAmPm] = useState("PM");
  const [staff, setStaff] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Backend: fetch departments for Category dropdown (GET /api/departments)
  useEffect(() => {
    let cancelled = false;
    getDepartments()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setCategories(list);
      })
      .catch(() => { if (!cancelled) setCategories([]); })
      .finally(() => { if (!cancelled) setCategoriesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (task) {
      setTaskName(task.title || "");
      setCategory(task.category || "");
      setDescription(task.description || "");
      setAssigneeId(task.assigneeId || "");
      setPriority(task.priority || "HIGH");
      setPropertyRoom(task.location || ZONES[0]);
      const d = task.dueDate || "";
      setDueDate(d.includes("-") ? d : d ? d.replace(/\//g, "-").split("-").reverse().join("-") : "");
      setDueTime(task.dueTime || "14:00");
      // Parse startTime/endTime "H:MM AM/PM", "HH:MM AM/PM", or 24h "HH:MM"
      const parseTime = (str) => {
        if (!str || typeof str !== "string") return { hour: "9", min: "00", amPm: "AM" };
        const parts = str.trim().split(/\s+/);
        const timePart = parts[0] || "";
        let hour24 = parseInt(timePart.split(":")[0], 10);
        const m = (timePart.split(":")[1] || "0").trim();
        const min = m ? String(parseInt(m, 10)).padStart(2, "0") : "00";
        if (parts[1]) {
          const isPm = (parts[1] || "").toUpperCase() === "PM";
          hour24 = isPm && hour24 < 12 ? hour24 + 12 : !isPm && hour24 === 12 ? 0 : hour24;
        }
        const hour12 = hour24 % 12 || 12;
        const amPm = hour24 >= 12 ? "PM" : "AM";
        return { hour: String(hour12), min, amPm };
      };
      const start = parseTime(task.startTime);
      setStartTimeHour(start.hour);
      setStartTimeMin(start.min);
      setStartTimeAmPm(start.amPm);
      const end = parseTime(task.endTime);
      setEndTimeHour(end.hour);
      setEndTimeMin(end.min);
      setEndTimeAmPm(end.amPm);
    }
  }, [task]);

  // Backend: fetch users for assignee dropdown (GET /api/users?page=1&limit=10)
  useEffect(() => {
    getUsersForAssignee(1, 10).then((users) => setStaff(Array.isArray(users) ? users : []));
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
      const startTime = `${startTimeHour}:${String(startTimeMin).padStart(2, "0")} ${startTimeAmPm}`;
      const endTime = `${endTimeHour}:${String(endTimeMin).padStart(2, "0")} ${endTimeAmPm}`;
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
        startTime,
        endTime,
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
                disabled={categoriesLoading}
              >
                <option value="">Select category...</option>
                {categories
                  .filter((d) => (d.name ?? "").trim())
                  .map((d) => {
                    const name = (d.name ?? "").trim();
                    return (
                      <option key={d.id} value={name}>
                        {name}
                      </option>
                    );
                  })}
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
                  <option key={u._id} value={u._id}>{u.name || u.email}</option>
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
