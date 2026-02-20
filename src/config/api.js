/**
 * API Configuration
 * -----------------
 * Requests must go to the backend (e.g. PUT /api/users/:id/reset-password).
 * - Dev: set VITE_API_BASE_URL=http://localhost:3000 so fetch hits backend (Option B).
 *   Or use Vite proxy (Option A): relative /api and proxy target in vite.config.js.
 * - Production: set VITE_API_BASE_URL to your backend URL (e.g. Vercel env).
 * When unset in dev we default to localhost:3000 so the backend receives the request.
 */
const envUrl = import.meta.env.VITE_API_BASE_URL;
const devDefault = import.meta.env.DEV ? "http://localhost:3000" : "";
export const API_BASE_URL = (envUrl != null && envUrl !== "") ? envUrl : devDefault;
