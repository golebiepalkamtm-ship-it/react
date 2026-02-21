/**
 * Scroll & Animation Auto-Diagnostic
 * - Auto-runs on load (2s delay)
 * - Logs:
 *   • aktywne ScrollTriggers (GSAP)
 *   • obecność Lenis / framer-motion
 *   • wysokość strony + metryki sekcji
 *   • aktywne animacje CSS/JS (computed)
 */

type SectionReport = {
  label: string;
  top: number;
  height: number;
  bottom: number;
};

type ScrollReport = {
  timestamp: string;
  viewport: { width: number; height: number; scrollY: number };
  documentHeight: number;
  lenis: { present: boolean; hasClass: boolean; scrollBehavior: string };
  gsap: {
    present: boolean;
    scrollTriggers: {
      count: number;
      list: {
        id?: string;
        trigger?: string;
        start: string;
        end: string;
        progress: number;
        active: boolean;
        enabled: boolean;
      }[];
    };
  };
  framerMotion: { nodes: number };
  sections: SectionReport[];
  cssAnimations: { animatedNodes: number; transitions: number };
};

const collectSections = (): SectionReport[] => {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("section,[data-section],[data-section-id],[data-section-name]")
  );

  const unique = Array.from(new Set(nodes));

  return unique.map((el, idx) => {
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const label =
      el.getAttribute("data-section-id") ||
      el.getAttribute("data-section-name") ||
      el.id ||
      el.tagName.toLowerCase() + "#" + (idx + 1);

    return {
      label,
      top: Math.round(top),
      height: Math.round(rect.height),
      bottom: Math.round(top + rect.height),
    };
  });
};

const collectGSAP = () => {
  const gsap = (window as any).gsap;
  const ScrollTrigger = (window as any).ScrollTrigger;

  if (!gsap || !ScrollTrigger) {
    return {
      present: false,
      scrollTriggers: { count: 0, list: [] as any[] },
    };
  }

  const triggers = ScrollTrigger.getAll().map((st: any) => ({
    id: st.vars?.id,
    trigger: st.trigger?.id || st.trigger?.className,
    start: st.start,
    end: st.end,
    progress: st.progress,
    active: st.isActive,
    enabled: st.enabled,
  }));

  return {
    present: true,
    scrollTriggers: {
      count: triggers.length,
      list: triggers,
    },
  };
};

const collectCSSAnimations = () => {
  const all = Array.from(document.querySelectorAll<HTMLElement>("*"));
  let animatedNodes = 0;
  let transitions = 0;

  all.forEach((el) => {
    const style = getComputedStyle(el);
    if (style.animationName && style.animationName !== "none") animatedNodes += 1;
    if (style.transitionProperty && style.transitionProperty !== "all" && style.transitionProperty !== "none") {
      transitions += 1;
    }
  });

  return { animatedNodes, transitions };
};

const runScrollDiagnostics = (): ScrollReport => {
  const lenis = (window as any).lenis;
  const html = document.documentElement;
  const framerNodes = document.querySelectorAll("[data-framer-motion-id]").length;

  const report: ScrollReport = {
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: Math.round(window.scrollY),
    },
    documentHeight: Math.round(document.documentElement.scrollHeight),
    lenis: {
      present: !!lenis,
      hasClass: html.classList.contains("lenis"),
      scrollBehavior: html.style.scrollBehavior || "unset",
    },
    gsap: collectGSAP(),
    framerMotion: { nodes: framerNodes },
    sections: collectSections(),
    cssAnimations: collectCSSAnimations(),
  };

  console.groupCollapsed(
    "%c🔍 Scroll/Animation Diagnostic",
    "background: #111; color: #fbbf24; padding: 4px 8px; border-radius: 6px;"
  );
  console.log("Timestamp:", report.timestamp);
  console.log("Viewport:", report.viewport, "Document height:", report.documentHeight);
  console.log("Lenis:", report.lenis);
  console.log("GSAP:", report.gsap);
  console.log("Framer Motion nodes:", report.framerMotion.nodes);
  console.table(report.sections);
  console.log("CSS animations:", report.cssAnimations);
  console.groupEnd();

  (window as any).__scrollDiagnostic = report;
  return report;
};

const bootstrap = () => {
  if (typeof window === "undefined") return;
  (window as any).runScrollDiagnostics = runScrollDiagnostics;

  const fire = () => setTimeout(runScrollDiagnostics, 2000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fire, { once: true });
  } else {
    fire();
  }
};

bootstrap();

export default runScrollDiagnostics;
