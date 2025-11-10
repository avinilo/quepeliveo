import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/tmdb': {
        target: 'https://api.themoviedb.org',
        changeOrigin: true,
        // Asegurar que todas las llamadas incluyan la versión /3 de la API
        // Ej.: /api/tmdb/movie/123 -> /3/movie/123
        rewrite: (path) => path.replace(/^\/api\/tmdb/, '/3'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  },
})
