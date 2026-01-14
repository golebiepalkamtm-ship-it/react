import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logger } from '@/lib/logger';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-vite.js');
  });
}

// In production, reduce noisy console output from third-party libs
if (import.meta.env.PROD) {
  try {
    (['log', 'info', 'debug'] as const).forEach((k) => {
      (console as any)[k] = () => {};
    });
  } catch (e) {
    logger.warn('Failed to override console in production', e);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
