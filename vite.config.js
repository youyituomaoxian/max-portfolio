import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  appType: 'mpa',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5175,
    // Watch src/data/ closely — profile.js is edited outside Vite (admin export)
    watch: {
      usePolling: true,
      interval: 500,
      ignored: ['!**/node_modules/**', '!**/dist/**']
    }
  },
  // Force re-bundle profile.js on every change (prevents stale cache)
  optimizeDeps: {
    exclude: [],
    include: []
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})
