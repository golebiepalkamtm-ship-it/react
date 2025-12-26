import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// initialize global particle trail (WebGPU) across the whole page
// import { initHeroWebGPU } from "./lib/heroWebGPU";

// start WebGPU in background (no await)
// if (typeof window !== 'undefined') {
// 	initHeroWebGPU().catch((e) => console.warn('Global WebGPU init failed', e));
// }

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-vite.js');
  });
}

createRoot(document.getElementById("root")!).render(<App />);
