import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Backend: When VITE_API_BASE_URL is empty, /api requests are proxied here
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: false,
    proxy: {
      "/api": {
        target: "https://madhuban360-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
})
