import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0', // Explicitly bind to IPv4 all interfaces
    port: 5173,
    strictPort: false,
    cors: true,
    allowedHosts: true, // Allow all hosts (Vite 6+) or use array for stricter control
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
  envPrefix: 'VITE_',
  envDir: '.',
  plugins: [
    react(),
    
    // Brotli + Gzip compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    
    // Progressive Web App
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Pałka MTM - Champion Pigeon Auctions',
        short_name: 'Pałka MTM',
        description: 'Hodowla gołębi pocztowych - Geny Zwycięzców',
        theme_color: '#D4AF37',
        background_color: '#0A0B14',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    }),
    
    // Image optimization (production only)
    mode === 'production' && viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 85,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    
    // Bundle analyzer (production only)
    mode === 'production' && visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ].filter(Boolean),
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
