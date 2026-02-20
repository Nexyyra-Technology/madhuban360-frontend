/**
 * User API Service
 * ----------------
 * Backend: GET/POST/PUT/DELETE /api/users (via Vite proxy in dev)
 */

import { API_BASE_URL } from "../../config/api";
import { readJsonOrThrow, getAuthHeaders } from "../../lib/apiClient";

const API_BASE = `${API_BASE_URL}/api/users`;

function normalizeUser(u) {
  return {
    ...u,
    _id: u.id ?? u._id,
    role: (u.role ?? "").charAt(0).toUpperCase() + (u.role ?? "").slice(1).toLowerCase(),
    status: (u.status ?? "").charAt(0).toUpperCase() + (u.status ?? "").slice(1).toLowerCase(),
  };
}

export async function getUsers() {
  try {
    const res = await fetch(API_BASE, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const json = await res.json();
    const users = json?.data?.users ?? json?.users ?? (Array.isArray(json) ? json : []);
    return users.map(normalizeUser);
  } catch (err) {
    console.error("getUsers error:", err);

    return dummyUsers;
  }
}

export async function getUserById(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    const json = await res.json();
    const user = json?.data?.user ?? json?.data ?? json;
    return normalizeUser(user);
  } catch (err) {
    console.error("getUserById error:", err);

    return dummyUsers.find(u => String(u._id) === String(id));
  }
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  return await readJsonOrThrow(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return await readJsonOrThrow(res);
}

export async function resetPassword(id, newPassword) {
  const res = await fetch(`${API_BASE}/${id}/reset-password`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ password: newPassword }),
  });

  return await readJsonOrThrow(res);
}

export async function createUser(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  return await readJsonOrThrow(res);
}

export async function exportUsersToExcel(users) {
  const XLSX = await import("xlsx");
  const rows = (users || []).map((u) => ({
    ID: u._id ?? "",
    Name: u.name ?? "",
    Email: u.email ?? "",
    Phone: u.phone ?? "",
    Role: u.role ?? "",
    Status: u.status ?? "",
    "Job Title": u.jobTitle ?? "",
    "Last Login": u.lastLogin ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, `users-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

const dummyUsers = [
  {
    _id: "1",
    name: "Johnathan Doe",
    email: "j.doe@facilitymanagement.com",
    phone: "+1 (555) 902-3481",
    role: "Admin",
    status: "Active",
    jobTitle: "Senior Facility Manager",
    lastLogin: "2 hours ago",
    tasks: 1284,
    completionRate: 98.2,
    attendance: 96.5,
    pendingRequests: 5,
  },
  {
    _id: "2",
    name: "Sarah Chen",
    email: "s.chen@facilitymanagement.com",
    phone: "+1 (555) 123-4567",
    role: "Manager",
    status: "Active",
    jobTitle: "Facility Manager",
    lastLogin: "5 mins ago",
    tasks: 540,
    completionRate: 95.1,
    attendance: 93.2,
    pendingRequests: 2,
  },
];
