import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { FeedbackProvider } from "@/components/ui/feedback/FeedbackProvider";
import "./index.css";
import { logger } from '@/lib/logger';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    Promise.all([
      navigator.serviceWorker.getRegistrations().then((regs) => Promise.all(regs.map((r) => r.unregister()))),
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    ]).catch(() => {});
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

// Add global error handler for production debugging
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  // Ignore Chrome extension errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('runtime.lastError') || message.includes('message channel closed')) {
      return; // Ignore Chrome extension errors
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <FeedbackProvider>
    <App />
  </FeedbackProvider>
);
