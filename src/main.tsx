import React from "react";
import '@/lib/tracing';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { FeedbackProvider } from "@/components/ui/feedback/FeedbackProvider";
import "./index.css";
import { logger } from '@/lib/logger';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { TimeProvider } from '@/providers/TimeProvider';

// Debug tools - uruchom w konsoli: window.debugAnimations()
import './utils/debugAnimations';
import './utils/checkSections';
import './utils/animationDebugger';

document.documentElement.classList.add('dark');

const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
if (gaId) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);
  (window as any).dataLayer = (window as any).dataLayer || [];
  const gtag = (...args: any[]) => { (window as any).dataLayer.push(args); };
  gtag('js', new Date() as any);
  gtag('config', gaId as any);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-vite.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
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

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <FeedbackProvider>
      <TimeProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </TimeProvider>
    </FeedbackProvider>
  </React.StrictMode>
);
