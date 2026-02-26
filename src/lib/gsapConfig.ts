import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { CSSPlugin } from "gsap/CSSPlugin";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin, CSSPlugin);

  // Global ScrollTrigger defaults - performance optimized
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    // syncInterval został zoptymalizowany
  });

  // Default smoothing for all scrollTriggers
  // IMPORTANT: scrub default removed - each animation should specify its own
  // Having scrub:1 as default forces interpolation on ALL triggers, even toggle-based ones
  ScrollTrigger.defaults({
    markers: false,
    // scrub NIE jest ustawiony domyślnie - toggleActions triggers nie powinny mieć scrub
    // Każda animacja powinna ustawiać scrub indywidualnie jeśli potrzebuje
  });

  // GSAP global defaults for performance
  gsap.config({
    force3D: true,
  });
  gsap.defaults({
    overwrite: "auto", // Prevent animation stacking
  });
}

export { gsap, ScrollTrigger };
export default gsap;
