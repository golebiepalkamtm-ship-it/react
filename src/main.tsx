import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// initialize global section entrance animator (adds animate-fade-up to sections when in view)
import "./lib/sectionAnimator";
// initialize global particle trail (WebGPU) across the whole page
import { initHeroWebGPU } from "./lib/heroWebGPU";

// start WebGPU in background (no await)
if (typeof window !== 'undefined') {
	initHeroWebGPU().catch((e) => console.warn('Global WebGPU init failed', e));
}

createRoot(document.getElementById("root")!).render(<App />);
