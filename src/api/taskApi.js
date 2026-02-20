/**
 * Task API client
 * ---------------
 * Backend: GET/POST/PUT/PATCH/DELETE /api/tasks.
 */
import { API_BASE_URL } from "../config/api";
import { readJsonOrThrow, getAuthHeaders } from "../lib/apiClient";

const API_BASE = `${API_BASE_URL}/api/tasks`;

export async function getTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
  if (filters.dueDate) params.set("dueDate", filters.dueDate);
  const qs = params.toString();
  const url = qs ? `${API_BASE}?${qs}` : API_BASE;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return readJsonOrThrow(res);
}

export async function getTaskById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
  return readJsonOrThrow(res);
}

export async function createTask(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return readJsonOrThrow(res);
}

export async function updateTask(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return readJsonOrThrow(res);
}

export async function updateTaskStatus(id, status) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  return readJsonOrThrow(res);
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return readJsonOrThrow(res);
}
