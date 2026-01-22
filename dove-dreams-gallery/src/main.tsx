// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001', // Adres Twojego serwera backendowego
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

<script type="module" src="/src/main.tsx"></script>