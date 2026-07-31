import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Conditional plugin imports
let compression: any = null;
let VitePWA: any = null;
let viteImagemin: any = null;
let visualizer: any = null;

try {
  compression = require("vite-plugin-compression");
} catch (e) {
  console.log("Compression plugin not available, skipping...");
}

try {
  VitePWA = require("vite-plugin-pwa").VitePWA;
} catch (e) {
  console.log("PWA plugin not available, skipping...");
}

try {
  viteImagemin = require("vite-plugin-imagemin").default;
} catch (e) {
  console.log("ImageMin plugin not available, skipping...");
}

try {
  visualizer = require("rollup-plugin-visualizer").visualizer;
} catch (e) {
  console.log("Bundle visualizer not available, skipping...");
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Explicitly bind to IPv4 all interfaces
    port: 5173,
    strictPort: false,
    cors: true,
    allowedHosts: true, // Allow all hosts (Vite 6+) or use array for stricter control
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
  envPrefix: "VITE_",
  envDir: ".",
  plugins: [
    react(),

    // Brotli + Gzip compression (conditional)
    ...(compression
      ? [
          compression({
            algorithm: "brotliCompress",
            ext: ".br",
            threshold: 10240, // Only compress files > 10KB
            deleteOriginFile: false,
          }),
          compression({
            algorithm: "gzip",
            ext: ".gz",
            threshold: 10240,
            deleteOriginFile: false,
          }),
        ]
      : []),

    // Progressive Web App (conditional)
    ...(VitePWA
      ? [
          VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
              "favicon.ico",
              "robots.txt",
              "apple-touch-icon.png",
            ],
            manifest: {
              name: "Pałka MTM - Champion Pigeon Auctions",
              short_name: "Pałka MTM",
              description: "Hodowla gołębi pocztowych - Geny Zwycięzców",
              theme_color: "#D4AF37",
              background_color: "#0A0B14",
              display: "standalone",
              icons: [
                {
                  src: "/icon-192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "/icon-512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "unsplash-images",
                    expiration: {
                      maxEntries: 50,
                      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                    },
                  },
                },
              ],
            },
          }),
        ]
      : []),

    // Image optimization (production only)
    ...(viteImagemin && mode === "production"
      ? [
          viteImagemin({
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
                  name: "removeViewBox",
                  active: false,
                },
                {
                  name: "removeEmptyAttrs",
                  active: false,
                },
              ],
            },
          }),
        ]
      : []),

    // Bundle analyzer (production only)
    ...(visualizer && mode === "production"
      ? [
          visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
            filename: "dist/stats.html",
          }),
        ]
      : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "socket.io-client"],
  },
  build: {
    sourcemap: true, // Enable source maps to fix Lighthouse warning
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // Three.js & 3D (Split for better caching)
            if (
              id.includes("three") ||
              id.includes("@react-three") ||
              id.includes("postprocessing") ||
              id.includes("cobe")
            ) {
              if (id.includes("examples/jsm")) return "three-examples";
              if (id.includes("three-mesh-bvh")) return "three-bvh";
              if (id.includes("@react-three/drei")) return "three-drei"; // Split drei
              return "three-vendor";
            }

            // Supabase
            if (id.includes("@supabase")) return "supabase";

            // Animations
            if (
              id.includes("framer-motion") ||
              id.includes("motion") ||
              id.includes("gsap") ||
              id.includes("aos") ||
              id.includes("lottie") ||
              id.includes("vanilla-tilt") ||
              id.includes("splitting") ||
              id.includes("canvas-confetti") ||
              id.includes("tsparticles")
            ) {
              return "animations";
            }

            // UI (Radix, Lucide, etc)
            if (
              id.includes("@radix-ui") ||
              id.includes("sonner") ||
              id.includes("lucide") ||
              id.includes("class-variance-authority") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "ui-vendor";
            }

            // Data & State
            if (
              id.includes("@tanstack") ||
              id.includes("zustand") ||
              id.includes("zod") ||
              id.includes("socket.io")
            ) {
              return "data-vendor";
            }

            // Carousel
            if (id.includes("embla")) return "carousel";

            // React Core (Catch-all for other react stuff)
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable worker support
    worker: {
      format: "es",
      plugins: () => [react()],
    },
  },
}));
