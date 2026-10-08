import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['mern-frontend-2-0-236306.onrender.com'],
    proxy: {
      '/api': 'https://mern-backend-1-0-236306.onrender.com'
    }
  }
})