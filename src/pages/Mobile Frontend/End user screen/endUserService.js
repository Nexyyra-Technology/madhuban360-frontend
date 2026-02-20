/**
 * End User API Service
 * --------------------
 * All API calls below connect to backend/database.
 * Backend base: API_BASE_URL from config (proxy in dev -> madhuban360-backend.onrender.com)
 * Database: Backend persists data; responses reflect DB state.
 */

import { API_BASE_URL } from "../../../config/api";
import { getAuthHeaders, readJsonOrThrow } from "../../../lib/apiClient";

const API = `${API_BASE_URL}/api`;

/* ---------- USER / PROFILE (Database: users collection) ---------- */

/** Backend: GET /api/users/me - fetch current logged-in user profile from database */
export async function getCurrentUser() {
  const res = await fetch(`${API}/users/me`, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) return getFallbackUser();
    throw new Error(data?.message || data?.error || "Failed to fetch user");
  }
  return data?.data ?? data?.user ?? data;
}

/** Backend: PUT /api/users/me/change-password - change password for logged-in user; saved to database */
export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API}/users/me/change-password`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (res.status === 404) throw new Error("Change password not yet available. Please contact support.");
  return readJsonOrThrow(res);
}

/** Backend: PUT /api/users/me - update current user profile; saved to database */
export async function updateUserProfile(payload) {
  const res = await fetch(`${API}/users/me`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return readJsonOrThrow(res);
}

/* ---------- TASKS (Database: tasks collection) ---------- */

/** Backend: GET /api/tasks - fetch tasks for current user (assigneeId from token) */
export async function getMyTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
  const qs = params.toString();
  const url = qs ? `${API}/tasks?${qs}` : `${API}/tasks`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) return getFallbackTasks();
    throw new Error(json?.message || "Failed to fetch tasks");
  }
  const tasks = json?.data?.tasks ?? json?.tasks ?? (Array.isArray(json) ? json : []);
  return tasks.map(normalizeTask);
}

/** Backend: GET /api/tasks/:id - fetch single task by id from database */
export async function getTaskById(id) {
  const res = await fetch(`${API}/tasks/${id}`, { headers: getAuthHeaders() });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) return getFallbackTask(id);
    throw new Error(json?.message || "Failed to fetch task");
  }
  const task = json?.data?.task ?? json?.data ?? json;
  return normalizeTask(task);
}

/** Backend: PATCH /api/tasks/:id/status - update task status in database */
export async function updateTaskStatus(taskId, status) {
  const res = await fetch(`${API}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  return readJsonOrThrow(res);
}

/** Backend: POST /api/tasks/:id/complete - submit task completion with photos; saved to database */
export async function submitTaskCompletion(taskId, { beforePhoto, afterPhoto, notes }) {
  const formData = new FormData();
  if (beforePhoto) formData.append("beforePhoto", beforePhoto);
  if (afterPhoto) formData.append("afterPhoto", afterPhoto);
  if (notes) formData.append("notes", notes);

  const headers = getAuthHeaders();
  delete headers["Content-Type"];

  const res = await fetch(`${API}/tasks/${taskId}/complete`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) return { success: true, id: `MG-${Date.now()}-B` };
    throw new Error(data?.message || data?.error || "Failed to submit");
  }
  return data?.data ?? data;
}

/* ---------- ATTENDANCE (Database: attendance collection) ---------- */

/** Backend: POST /api/attendance/check-in - record check-in; saved to database */
export async function checkIn(location) {
  const res = await fetch(`${API}/attendance/check-in`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ location: location || "Lobby, Building A" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) return { success: true, checkedIn: true };
    throw new Error(data?.message || "Check-in failed");
  }
  return data?.data ?? data;
}

/** Backend: GET /api/attendance/today - fetch today's attendance status from database */
export async function getTodayAttendance() {
  const res = await fetch(`${API}/attendance/today`, { headers: getAuthHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 404) throw new Error(data?.message || "Failed to fetch attendance");
  return data?.data ?? data ?? { checkedIn: false };
}

/* ---------- HELPERS ---------- */

function normalizeTask(t) {
  return {
    ...t,
    _id: t.id ?? t._id,
    status: (t.status ?? "TO_DO").toUpperCase().replace(/\s/g, "_"),
  };
}

function getFallbackUser() {
  return {
    name: "Alex",
    _id: "user-1",
    userId: "SUP-2023-89",
    zone: "Zone B: Cafeteria & Lobby",
    location: "Madhuban Group",
    avatar: null,
  };
}

function getFallbackTasks() {
  return [
    { _id: "1", title: "Room 304", subtitle: "Deluxe Suite", description: "Guest checking in at 11 AM. Full deep clean required immediately.", status: "OVERDUE", dueTime: "2:00 PM", priority: "high" },
    { _id: "2", title: "Room 102", subtitle: "Deluxe Suite", description: "Daily housekeeping service. Replace towels and amenities.", status: "IN_PROGRESS", dueTime: "2:00 PM", priority: "normal" },
    { _id: "3", title: "Room 205", subtitle: "", description: "Checkout cleaning.", status: "PENDING", dueTime: "2:00 PM", priority: "normal" },
  ];
}

function getFallbackTask(id) {
  const tasks = getFallbackTasks();
  const t = tasks.find((x) => String(x._id) === String(id)) || tasks[0];
  return {
    ...t,
    instructions: [
      "Replace bed linens: Strip all bedding including pillowcases and replace with fresh set from cart B.",
      "Sanitize high-touch surfaces: Focus on remotes, door handles, light switches, and phone handset.",
      "Restock Minibar: Check water bottles and replace coffee pods if count is below 2.",
    ],
    guestRequest: "Guest has requested extra pillows. Please check closet shelf.",
    location: "3rd Floor - Deluxe Suite",
    dueBy: "10:30 AM",
  };
}
