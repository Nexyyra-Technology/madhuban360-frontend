/**
 * API Configuration
 * -----------------
 * Backend URL is in vite.config.js proxy target only. Uses relative /api paths.
 * Vite proxies /api/* to backend in dev. For production build, set VITE_API_BASE_URL.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
