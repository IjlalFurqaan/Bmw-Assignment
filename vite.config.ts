import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  optimizeDeps: {
    // Pre-bundle lucide-react to avoid individual icon requests
    include: ['lucide-react'],
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Bundle lucide-react icons together
          'lucide-icons': ['lucide-react']
        }
      }
    }
  }
})