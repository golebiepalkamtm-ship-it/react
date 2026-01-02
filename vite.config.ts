import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Tworzy osobny chunk dla react i react-dom
          react: ["react", "react-dom"],
          // Tworzy osobny chunk dla bibliotek 3D
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          // Tworzy osobny chunk dla biblioteki do animacji
          "framer-motion": ["framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
}));
