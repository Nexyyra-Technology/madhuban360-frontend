/**
 * Property API client
 * -------------------
 * Backend: GET/POST/PUT/DELETE /api/properties.
 */
import { API_BASE_URL } from "../config/api";
import { readJsonOrThrow, getAuthHeaders } from "../lib/apiClient";

const API_BASE = `${API_BASE_URL}/api/properties`;

export async function getProperties(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() });
  return readJsonOrThrow(res);
}

export async function getPropertyById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
  return readJsonOrThrow(res);
}

export async function createProperty(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return readJsonOrThrow(res);
}

export async function updateProperty(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return readJsonOrThrow(res);
}

export async function deleteProperty(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return readJsonOrThrow(res);
}
