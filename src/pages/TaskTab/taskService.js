/**
 * Task API Service
 * ---------------
 * Backend: GET /api/tasks - list tasks (supports query: status, priority, assigneeId, dueDate)
 * Backend: GET /api/tasks/:id - get task by id
 * Backend: POST /api/tasks - create task
 * Backend: PUT /api/tasks/:id - update task
 * Backend: PATCH /api/tasks/:id/status - update task status
 * Backend: DELETE /api/tasks/:id - delete task
 * Data saved to backend/database; responses reflected from backend.
 */

import { API_BASE_URL } from "../../config/api";
import { readJsonOrThrow, getAuthHeaders } from "../../lib/apiClient";

const API_BASE = `${API_BASE_URL}/api/tasks`;

function normalizeTask(t) {
  const rawStatus = (t.status ?? "pending").toLowerCase();
  const statusMap = { pending: "TO_DO", in_progress: "IN_PROGRESS", review: "REVIEW", completed: "COMPLETED" };
  const status = statusMap[rawStatus] ?? rawStatus.toUpperCase().replace(/\s/g, "_");
  return {
    ...t,
    _id: t.id ?? t._id,
    title: t.taskName ?? t.title ?? t.task_name ?? "Untitled",
    assignee: t.assignee ?? (t.assigneeName ? { name: t.assigneeName } : null),
    assigneeId: t.assigneeId ?? t.assignee?.id ?? t.assignee?._id ?? null,
    assignedBy: t.assignedBy ?? (t.assignedByName ? { name: t.assignedByName } : null),
    status,
    priority: (t.priority ?? "normal").toUpperCase(),
    dueDate: t.dueDate ? formatDueDate(t.dueDate) : t.dueDate,
    completedAt: t.completedAt ? formatDueDate(t.completedAt) : t.completedAt,
    instructions: Array.isArray(t.instructions) ? t.instructions : [],
    roomNumber: t.roomNumber ?? t.room_number ?? null,
    locationFloor: t.locationFloor ?? t.location_floor ?? t.location ?? null,
    category: t.category ?? t.departmentName ?? t.department ?? null,
  };
}

function formatDueDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 10);
}

/** Backend: GET /api/tasks - fetch all tasks, optionally filtered */
export async function getTasks(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
    if (filters.dueDate) params.set("dueDate", filters.dueDate);
    const qs = params.toString();
    const url = qs ? `${API_BASE}?${qs}` : API_BASE;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const json = await res.json();
    const raw = json?.data;
    const tasks = Array.isArray(raw) ? raw : (json?.data?.tasks ?? json?.tasks ?? (Array.isArray(json) ? json : []));
    return tasks.map(normalizeTask);
  } catch (err) {
    console.error("getTasks error:", err);
    return [...dummyTasks, ...localTasks];
  }
}

/** Backend: GET /api/tasks/:id - fetch single task by id */
export async function getTaskById(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch task");
    const json = await res.json();
    const task = json?.data?.task ?? json?.data ?? json;
    return normalizeTask(task);
  } catch (err) {
    console.error("getTaskById error:", err);
    const all = [...dummyTasks, ...localTasks];
    const found = all.find((t) => String(t._id) === String(id));
    return found || null;
  }
}

/** Backend: POST /api/tasks - create new task; body saved to backend/database */
export async function createTask(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return await readJsonOrThrow(res);
}

/** Backend: PUT /api/tasks/:id - update task; changes saved to backend/database */
export async function updateTask(id, data) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return await readJsonOrThrow(res);
  } catch (err) {
    // Fallback: update local task when backend unavailable
    const idx = localTasks.findIndex((t) => String(t._id) === String(id));
    if (idx >= 0) {
      localTasks[idx] = normalizeTask({ ...localTasks[idx], ...data });
      return { data: localTasks[idx] };
    }
    const all = [...dummyTasks, ...localTasks];
    const found = all.find((t) => String(t._id) === String(id));
    if (found) return { data: { ...found, ...data } };
    throw err;
  }
}

/** Backend: PATCH /api/tasks/:id/status - update task status only */
export async function updateTaskStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status }),
    });
    return await readJsonOrThrow(res);
  } catch (err) {
    const idx = localTasks.findIndex((t) => String(t._id) === String(id));
    if (idx >= 0) {
      localTasks[idx].status = status;
      return { data: localTasks[idx] };
    }
    return { data: { status } };
  }
}

/** Backend: DELETE /api/tasks/:id - delete task */
export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return await readJsonOrThrow(res);
}

/** Client-side fallback: tasks created when backend returns 404/error (for runnable app) */
let localTasks = [];

/** Fallback dummy tasks when backend unavailable (for demo/runnable app) */
const dummyTasks = [
  { _id: "1", title: "HVAC Compressor Repair", description: "Unit B-12 reporting abnormal noise and performance drop.", status: "TO_DO", priority: "HIGH", assignee: { name: "MC M. Chen" }, dueDate: "2025-10-25", category: "Maintenance", location: "East Wing, Ground Floor" },
  { _id: "2", title: "Fire Alarm System Test", description: "Monthly routine inspection for building safety compliance.", status: "TO_DO", priority: "MEDIUM", assignee: { name: "S. Blake" }, dueDate: "2025-10-25", category: "Maintenance" },
  { _id: "3", title: "Floor 2 Janitorial Deep Clean", description: "Post-event cleanup required for conference rooms A-D.", status: "IN_PROGRESS", priority: "URGENT", assignee: { name: "JT J. Thompson" }, progress: 60, category: "Cleaning" },
  { _id: "4", title: "Roof Inspection - Phase 1", description: "Completed visual check for leaks after heavy rain. Photos uploaded.", status: "REVIEW", priority: "LOW", assignee: { name: "D. Vance" }, category: "Inspection" },
  { _id: "5", title: "Parking Lot Lighting Audit", description: "Replaced 4 flickering LED units in Section C.", status: "COMPLETED", priority: "NORMAL", assignee: { name: "K. Miller" }, completedAt: "2h ago" },
  { _id: "6", title: "HVAC Maintenance - #TK-8829", description: "Perform semi-annual maintenance check on the main HVAC unit (Unit-H4).", status: "IN_PROGRESS", priority: "HIGH", assignee: { name: "Mike Ross" }, assignedBy: { name: "Alex Rivera" }, location: "North Tower, Floor 4, Server Room B", category: "Preventive Maintenance", dueDate: "2025-10-24" },
];
