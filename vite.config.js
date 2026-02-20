import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Option A: When using relative /api (no VITE_API_BASE_URL), proxy sends /api to backend.
// Set VITE_PROXY_TARGET for local backend (e.g. http://localhost:3000).
const proxyTarget = process.env.VITE_PROXY_TARGET || "https://madhuban360-backend.onrender.com";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: false,
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
