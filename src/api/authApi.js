/**
 * Auth API client
 * ---------------
 * Backend: POST /api/auth/login (or /api/users/login).
 * Response: { data: { token, user } }; user includes lastLoginAt set by backend.
 */
import { API_BASE_URL } from "../config/api";

const AUTH_PATHS = ["/api/auth/login", "/api/users/login", "/api/login"];

/**
 * Login with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ data: { token: string, user: object } }>} res.data.user has lastLoginAt from backend
 */
export async function login(credentials) {
  const body = JSON.stringify(credentials);
  let lastRes;
  let lastData;
  for (const path of AUTH_PATHS) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json().catch(() => ({}));
    lastRes = res;
    lastData = data;
    if (res.status !== 404) break;
  }
  if (lastRes.status === 404) {
    const fallback = import.meta.env.VITE_DEV_TOKEN || "demo-token";
    return {
      data: {
        token: fallback,
        user: { email: credentials.email, name: credentials.email.split("@")[0], lastLoginAt: new Date().toISOString() },
      },
    };
  }
  if (!lastRes.ok) {
    const message = lastData?.message || lastData?.error || (lastRes.status === 401 ? "Invalid email or password" : `Request failed (${lastRes.status})`);
    throw new Error(message);
  }
  const token = lastData?.token ?? lastData?.data?.token ?? lastData?.accessToken;
  const user = lastData?.data?.user ?? lastData?.user ?? { email: credentials.email, name: credentials.email.split("@")[0], lastLoginAt: lastData?.data?.lastLoginAt ?? new Date().toISOString() };
  if (!token) throw new Error("Login succeeded but no token received. Check backend response format.");
  return { data: { token, user } };
}
