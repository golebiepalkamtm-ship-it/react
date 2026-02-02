import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0', // Explicitly bind to IPv4 all interfaces
    port: 5173,
    strictPort: false,
    cors: true,
    allowedHosts: true, // Allow all hosts (Vite 6+) or use array for stricter control
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
  envPrefix: 'VITE_',
  envDir: '.',
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'socket.io-client'],
  },
  build: {
    sourcemap: mode !== 'production', // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Three.js & 3D (Split for better caching)
            if (id.includes('three') || id.includes('@react-three') || id.includes('postprocessing') || id.includes('cobe')) {
               if (id.includes('examples/jsm')) return 'three-examples';
               if (id.includes('three-mesh-bvh')) return 'three-bvh';
               if (id.includes('@react-three/drei')) return 'three-drei'; // Split drei
               return 'three-vendor';
            }

            // Supabase
            if (id.includes('@supabase')) return 'supabase';

            // Animations
            if (id.includes('framer-motion') || id.includes('motion') || id.includes('gsap') || id.includes('aos') || id.includes('lottie') || id.includes('vanilla-tilt') || id.includes('splitting') || id.includes('canvas-confetti') || id.includes('tsparticles')) {
               return 'animations';
            }

            // UI (Radix, Lucide, etc)
            if (id.includes('@radix-ui') || id.includes('sonner') || id.includes('lucide') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
               return 'ui-vendor';
            }

            // Data & State
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('zod') || id.includes('socket.io')) {
               return 'data-vendor';
            }

            // Carousel
            if (id.includes('embla')) return 'carousel';

            // React Core (Catch-all for other react stuff)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
               return 'react-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable worker support
    worker: {
      format: 'es',
      plugins: () => [react()],
    },
  },
}));
