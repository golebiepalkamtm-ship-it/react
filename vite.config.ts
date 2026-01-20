import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    strictPort: false,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
    chunkSizeWarningLimit: 1000, // Zwiększ limit ostrzeżenia do 1000kB
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom", "react-router-dom", "react-router-hash-link"],
          // Three.js i 3D - to są bardzo duże biblioteki
          "three-vendor": ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing", "postprocessing", "cobe"],
          // Animacje
          "animations": ["framer-motion", "motion", "gsap", "@gsap/react", "aos", "lottie-web", "vanilla-tilt", "splitting", "canvas-confetti", "react-lottie-player", "react-tsparticles"],
          // UI Components
          "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-slot", "@radix-ui/react-toast", "@radix-ui/react-tooltip", "sonner", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
          // State management & Data fetching
          "data-vendor": ["@tanstack/react-query", "zustand", "zod", "socket.io-client"],
          // Supabase
          "supabase": ["@supabase/supabase-js"],
          // Carousel
          "carousel": ["embla-carousel-react", "embla-carousel-autoplay", "@tanstack/react-virtual"],
        },
      },
    },
    // Enable worker support
    worker: {
      format: 'es',
      plugins: () => [react()],
    },
  },
}));
