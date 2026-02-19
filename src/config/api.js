/**
 * API configuration
 * -----------------
 * Backend: https://madhuban360-backend.onrender.com
 * When VITE_API_BASE_URL is set, all API calls go to this URL.
 * When empty, relative /api paths use Vite proxy (localhost:5001 in dev).
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
