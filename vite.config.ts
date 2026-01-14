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
    chunkSizeWarningLimit: 600, // Zwiększ limit ostrzeżenia do 600kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Tworzy osobny chunk dla react i react-dom
          react: ["react", "react-dom"],
          // Tworzy osobny chunk dla bibliotek do animacji
          "framer-motion": ["framer-motion"],
          // GSAP i animacje
          "gsap": ["gsap", "@gsap/react"],
          // UI i komponenty
          "ui": ["@radix-ui/react-dialog", "@radix-ui/react-slot", "@radix-ui/react-toast", "@radix-ui/react-tooltip", "sonner"],
          // Narzędzia i utils
          "utils": ["clsx", "tailwind-merge", "class-variance-authority", "zod"],
          // Ikony z lucide-react (oddzielny chunk)
          "icons": ["lucide-react"],
          // Routing i state management
          "routing": ["react-router-dom", "react-router-hash-link", "zustand"],
          // Supabase i API
          "supabase": ["@supabase/supabase-js", "@tanstack/react-query"],
          // Efekty wizualne
          "effects": ["aos", "lottie-web", "vanilla-tilt", "splitting"],
          // Carousel i galerie
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
  // Configure worker handling
  worker: {
    format: 'es',
    plugins: () => [react()],
  },
}));
