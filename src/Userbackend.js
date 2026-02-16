import axios from "axios";

/*
|--------------------------------------------------------------------------
| BACKEND API CONFIG
|--------------------------------------------------------------------------
| Change ONLY baseURL if backend URL changes.
|--------------------------------------------------------------------------
*/

const API = axios.create({
  baseURL: "http://YOUR_BACKEND_IP:5000/api", // ← CHANGE THIS
});

/* ================= USER APIs ================= */

export const fetchUsers = () => API.get("/users");

export const addUser = (data) => API.post("/users", data);

export const updateUser = (id, data) => API.put(`/users/${id}`, data);

export const removeUser = (id) => API.delete(`/users/${id}`);
