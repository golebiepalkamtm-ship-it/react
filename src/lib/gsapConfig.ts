import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

  // Global ScrollTrigger defaults
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });

  // Default smoothing for all scrollTriggers
  ScrollTrigger.defaults({
    markers: false,
    scrub: 1,
  });
}

export { gsap, ScrollTrigger };
export default gsap;
