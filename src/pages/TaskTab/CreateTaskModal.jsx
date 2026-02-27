/**
 * Create Task Modal
 * -----------------
 * Backend: POST /api/tasks (JSON or form-data when attachments are present)
 * Payload: taskName, departmentId, description, assigneeId, priority, propertyId,
 *          startDate, endDate, startTime, endTime, timeDuration, frequency,
 *          floorId, zoneId, instructions[], attachments (files)
 */
import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Building, User, FileText, Paperclip } from "lucide-react";
import { createTask } from "./taskService";
import { getUsersForAssignee, getDepartments } from "../UserTab/userService";
import { getProperties, getPropertyWithFloors } from "../PropertyTab/propertyService";
import ModalWrapper from "../UserTab/ModalWrapper";

const FREQUENCIES = [
  { value: "", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const ATTACH_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm";

function to24h(h, m, amPm) {
  let hour = parseInt(h, 10) || 0;
  const min = parseInt(m, 10) || 0;
  if (amPm === "PM" && hour !== 12) hour += 12;
  if (amPm === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function toMinutes(h, m, amPm) {
  let hour = parseInt(h, 10) || 0;
  const min = parseInt(m, 10) || 0;
  if (amPm === "PM" && hour !== 12) hour += 12;
  if (amPm === "AM" && hour === 12) hour = 0;
  return hour * 60 + min;
}

const STEP_TITLES = [
  "Basic info",
  "Assignment & priority",
  "Location (property, floor, zone)",
  "Schedule",
  "Instructions",
  "Attachments",
];

export default function CreateTaskModal({ onClose, onSuccess }) {
  const [taskName, setTaskName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [propertyId, setPropertyId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTimeHour, setStartTimeHour] = useState("9");
  const [startTimeMin, setStartTimeMin] = useState("00");
  const [startTimeAmPm, setStartTimeAmPm] = useState("AM");
  const [endTimeHour, setEndTimeHour] = useState("5");
  const [endTimeMin, setEndTimeMin] = useState("00");
  const [endTimeAmPm, setEndTimeAmPm] = useState("PM");
  const [instructions, setInstructions] = useState([{ title: "", description: "" }]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyFloors, setPropertyFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getUsersForAssignee().then((u) => (Array.isArray(u) ? u : [])),
      getDepartments().then((d) => (Array.isArray(d) ? d : [])),
      getProperties().then((p) => (Array.isArray(p) ? p : [])),
    ])
      .then(([users, depts, props]) => {
        if (cancelled) return;
        setStaff(users);
        setDepartments(depts);
        setProperties(props);
        if (depts.length) setDepartmentId((prev) => (prev ? prev : String(depts[0]?.id ?? depts[0]?._id ?? "")));
        if (props.length) setPropertyId((prev) => (prev ? prev : String(props[0]?.id ?? props[0]?._id ?? "")));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!propertyId) {
      setPropertyFloors([]);
      setFloorId("");
      setZoneId("");
      return;
    }
    getPropertyWithFloors(propertyId)
      .then((data) => {
        const floors = data?.floors ?? [];
        setPropertyFloors(Array.isArray(floors) ? floors : []);
        setFloorId("");
        setZoneId("");
      })
      .catch(() => setPropertyFloors([]));
  }, [propertyId]);

  const timeDurationMins = (() => {
    const startM = toMinutes(startTimeHour, startTimeMin, startTimeAmPm);
    const endM = toMinutes(endTimeHour, endTimeMin, endTimeAmPm);
    let diff = endM - startM;
    if (diff <= 0) diff += 24 * 60;
    return diff;
  })();

  const taskDurationLabel = (() => {
    const h = Math.floor(timeDurationMins / 60);
    const m = timeDurationMins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  })();

  const selectedFloor = propertyFloors.find((f) => String(f.id) === String(floorId));
  const zones = selectedFloor?.zones ?? [];

  function addInstruction() {
    setInstructions((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeInstruction(index) {
    setInstructions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function updateInstruction(index, field, value) {
    setInstructions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function handleAttachmentChange(e) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAttachmentFiles((prev) => [...prev, ...files]);
  }

  function removeAttachment(index) {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }
    const deptId = parseInt(departmentId, 10);
    const propId = parseInt(propertyId, 10);
    const asnId = assigneeId ? parseInt(assigneeId, 10) : null;
    const fId = floorId ? parseInt(floorId, 10) : undefined;
    const zId = zoneId ? parseInt(zoneId, 10) : undefined;
    if (!Number.isInteger(deptId) || deptId < 1) {
      setError("Please select a department");
      return;
    }
    if (!Number.isInteger(propId) || propId < 1) {
      setError("Please select a property");
      return;
    }
    if (!asnId || asnId < 1) {
      setError("Please select an assignee");
      return;
    }

    const startTime = to24h(startTimeHour, startTimeMin, startTimeAmPm);
    const endTime = to24h(endTimeHour, endTimeMin, endTimeAmPm);
    const validInstructions = instructions
      .filter((i) => (i.title ?? "").trim() || (i.description ?? "").trim())
      .map((i) => ({ title: (i.title ?? "").trim(), description: (i.description ?? "").trim() }));

    try {
      setSaving(true);

      if (attachmentFiles.length > 0) {
        const fd = new FormData();
        fd.append("taskName", taskName.trim());
        fd.append("departmentId", String(deptId));
        fd.append("description", description.trim());
        fd.append("assigneeId", String(asnId));
        fd.append("priority", priority.toUpperCase());
        fd.append("propertyId", String(propId));
        if (startDate) fd.append("startDate", startDate);
        if (endDate) fd.append("endDate", endDate);
        fd.append("startTime", startTime);
        fd.append("endTime", endTime);
        fd.append("timeDuration", String(timeDurationMins));
        if (frequency) fd.append("frequency", frequency);
        if (fId != null) fd.append("floorId", String(fId));
        if (zId != null) fd.append("zoneId", String(zId));
        fd.append("instructions", JSON.stringify(validInstructions));
        attachmentFiles.forEach((file) => fd.append("attachments", file));
        await createTask(fd);
      } else {
        await createTask({
          taskName: taskName.trim(),
          departmentId: deptId,
          description: description.trim(),
          assigneeId: asnId,
          priority: priority.toUpperCase(),
          propertyId: propId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          startTime,
          endTime,
          timeDuration: timeDurationMins,
          frequency: frequency || undefined,
          floorId: fId,
          zoneId: zId,
          instructions: validInstructions,
          attachments: [],
        });
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper widthClass="w-[640px] max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold">Create New Task</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <p className="text-sm text-gray-500 mt-1">Fill the steps below in order. Required fields are marked by the flow.</p>

      <form onSubmit={handleCreate} className="mt-6 space-y-6">
        {/* Step 1: Basic info */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">1</span>
            {STEP_TITLES[0]}
          </h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Task name
            </label>
            <input
              type="text"
              placeholder="e.g. HVAC Filter Replacement"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              disabled={loading}
              required
            >
              <option value="">Select department...</option>
              {departments.filter((d) => (d.name ?? "").trim()).map((d) => {
                const id = d.id ?? d._id ?? "";
                return <option key={id} value={String(id)}>{String(d.name ?? "").trim()}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              placeholder="Describe the work to be performed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            />
          </div>
        </section>

        {/* Step 2: Assignment & priority */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">2</span>
            {STEP_TITLES[1]}
          </h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              disabled={loading}
              required
            >
              <option value="">Select staff member...</option>
              {staff.map((u) => {
                const id = String(u.id ?? u._id ?? "");
                return (
                  <option key={id} value={id}>
                    {u.name || u.email || u.username || id || "—"}
                  </option>
                );
              })}
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
        </section>

        {/* Step 3: Location — property, floor, zone */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">3</span>
            {STEP_TITLES[2]}
          </h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Property
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              disabled={loading}
              required
            >
              <option value="">Select property...</option>
              {properties.map((p) => {
                const id = String(p.id ?? p._id ?? "");
                const label = (p.name ?? p.propertyName ?? id) || "—";
                return <option key={id} value={id}>{label}</option>;
              })}
            </select>
          </div>
          {propertyId && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Floor
                </label>
                <select
                  value={floorId}
                  onChange={(e) => { setFloorId(e.target.value); setZoneId(""); }}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                >
                  <option value="">Select floor...</option>
                  {propertyFloors.map((f) => (
                    <option key={f.id} value={String(f.id)}>Floor {f.floorNumber}</option>
                  ))}
                </select>
              </div>
              {floorId && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Zone</label>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                  >
                    <option value="">Select zone...</option>
                    {zones.map((z) => (
                      <option key={z.id} value={String(z.id)}>{z.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </section>

        {/* Step 4: Schedule */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">4</span>
            {STEP_TITLES[3]}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start time
              </label>
              <div className="flex gap-2 items-center flex-wrap">
                <select value={startTimeHour} onChange={(e) => setStartTimeHour(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg min-w-[4rem]">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={String(h)}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-500">:</span>
                <select value={startTimeMin} onChange={(e) => setStartTimeMin(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg min-w-[4rem]">
                  {[ "00", "15", "30", "45" ].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select value={startTimeAmPm} onChange={(e) => setStartTimeAmPm(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg min-w-[4.5rem]">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End time
              </label>
              <div className="flex gap-2 items-center flex-wrap">
                <select value={endTimeHour} onChange={(e) => setEndTimeHour(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg min-w-[4rem]">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={String(h)}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-500">:</span>
                <select value={endTimeMin} onChange={(e) => setEndTimeMin(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg min-w-[4rem]">
                  {[ "00", "15", "30", "45" ].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select value={endTimeAmPm} onChange={(e) => setEndTimeAmPm(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg min-w-[4.5rem]">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Task duration</label>
            <div className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium">
              {taskDurationLabel} ({timeDurationMins} min)
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Frequency (optional)</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value || "none"} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Step 5: Instructions */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">5</span>
            {STEP_TITLES[4]}
          </h3>
          <p className="text-xs text-gray-500">Add step-by-step instructions for the assignee (optional).</p>
          {instructions.map((inst, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Instruction {index + 1}</span>
                {instructions.length > 1 && (
                  <button type="button" onClick={() => removeInstruction(index)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Title"
                value={inst.title}
                onChange={(e) => updateInstruction(index, "title", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              />
              <textarea
                placeholder="Description"
                value={inst.description}
                onChange={(e) => updateInstruction(index, "description", e.target.value)}
                rows={2}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm"
              />
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
            + Add instruction
          </button>
        </section>

        {/* Step 6: Attachments */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded flex items-center justify-center text-[10px]">6</span>
            {STEP_TITLES[5]}
          </h3>
          <p className="text-xs text-gray-500">Images or videos (jpeg, png, gif, webp, mp4).</p>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors py-6">
            <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload or drag files</span>
            <input
              type="file"
              accept={ATTACH_ACCEPT}
              multiple
              onChange={handleAttachmentChange}
              className="hidden"
            />
          </label>
          {attachmentFiles.length > 0 && (
            <ul className="space-y-1">
              {attachmentFiles.map((file, i) => (
                <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="truncate">{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-red-600 hover:underline text-xs ml-2">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#1f2a44] text-white rounded-lg disabled:opacity-60 text-sm font-medium"
          >
            {saving ? "Creating…" : "+ Create Task"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
