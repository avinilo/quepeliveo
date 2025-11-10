import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
          rewrite: (path) => path.replace(/^\/api\/tmdb/, '/3'),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
        // Proxy: RapidAPI Streaming Availability
        '^/api/streaming/availability/.*': {
          target: 'https://streaming-availability.p.rapidapi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/streaming\/availability\/[^/]+/, '/catalog'),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': env.STREAMING_AVAILABILITY_KEY || '',
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
          },
        },
        // Proxy: Watchmode
        '^/api/streaming/watchmode/.*': {
          target: 'https://api.watchmode.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/streaming\/watchmode\/[^/]+/, '/v1/list-titles'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              try {
                const u = new URL(proxyReq.path as string, 'https://api.watchmode.com')
                if (!u.searchParams.has('apiKey')) {
                  const apiKey = process.env.WATCHMODE_API_KEY || env.WATCHMODE_API_KEY || ''
                  if (apiKey) {
                    u.searchParams.set('apiKey', apiKey)
                    proxyReq.path = u.pathname + u.search
                  }
                }
              } catch {}
            })
          }
        }
      },
    },
  }
})
