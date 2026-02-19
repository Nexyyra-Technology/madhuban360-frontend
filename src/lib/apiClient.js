/**
 * Shared API client utilities
 * --------------------------
 * Used by userService, propertyService. Backend via Vite proxy (vite.config.js)
 */

/**
 * Parse JSON from response; throw on non-ok status
 * @param {Response} res
 * @returns {Promise<any>}
 */
export async function readJsonOrThrow(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

/**
 * Auth headers with Bearer token from localStorage
 * Backend: Expects Authorization: Bearer <token> for protected routes
 */
export function getAuthHeaders(customHeaders = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...customHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
