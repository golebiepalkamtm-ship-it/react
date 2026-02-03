import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import gsap from "gsap";

/**
 * GSAP Page Transition System
 * 
 * Profesjonalny system animacji przejść między stronami z GSAP.
 * Oferuje różne style: curtain, slide, zoom, fade, diagonal, reveal.
 */

type TransitionStyle = "curtain" | "slide" | "zoom" | "fade" | "diagonal" | "reveal" | "wipe";

// Mapowanie ścieżek do stylów przejść (5 animacji, 10 podstron)
const routeTransitionStyles: Record<string, TransitionStyle> = {
  // curtain (2x)
  "/": "curtain",
  "/champions": "curtain",
  // zoom (2x)
  "/admin": "zoom",
  "/press": "zoom",
  // diagonal (2x)
  "/breeder-meetings": "diagonal",
  "/auctions": "diagonal",
  // reveal (2x)
  "/contact": "reveal",
  "/auth": "reveal",
  // wipe (2x)
  "/achievements": "wipe",
  "/account": "wipe",
};

// Funkcja do pobierania stylu dla ścieżki
const getStyleForPath = (path: string, defaultStyle: TransitionStyle): TransitionStyle => {
  // Sprawdź dokładne dopasowanie
  if (routeTransitionStyles[path]) {
    return routeTransitionStyles[path];
  }
  // Sprawdź ścieżki z parametrami (np. /auctions/:id, /press/:id)
  const basePath = "/" + path.split("/")[1];
  if (routeTransitionStyles[basePath]) {
    return routeTransitionStyles[basePath];
  }
  return defaultStyle;
};

interface TransitionContextType {
  isTransitioning: boolean;
  transitionStyle: TransitionStyle;
  setTransitionStyle: (style: TransitionStyle) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  transitionStyle: "curtain",
  setTransitionStyle: () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

interface GSAPPageTransitionProps {
  children: ReactNode;
  defaultStyle?: TransitionStyle;
  duration?: number;
  primaryColor?: string;
  accentColor?: string;
  /** Czy używać różnych stylów dla różnych stron */
  useRouteStyles?: boolean;
}

export const GSAPPageTransition = ({
  children,
  defaultStyle = "curtain",
  duration = 0.8,
  primaryColor = "#0a0a0f",
  accentColor = "#B8860B",
  useRouteStyles = true,
}: GSAPPageTransitionProps) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>(defaultStyle);
  const [displayChildren, setDisplayChildren] = useState(children);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const curtain1Ref = useRef<HTMLDivElement>(null);
  const curtain2Ref = useRef<HTMLDivElement>(null);
  const curtain3Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(location.pathname);
  const isFirstMount = useRef(true);

  // Aktualizuj styl przejścia na podstawie docelowej ścieżki
  const getActiveStyle = (): TransitionStyle => {
    if (useRouteStyles) {
      return getStyleForPath(location.pathname, defaultStyle);
    }
    return transitionStyle;
  };

  // Animation functions declared before useEffect
  const animateCurtain = (tl: gsap.core.Timeline, dur: number, color: string) => {
    if (!curtain1Ref.current || !curtain2Ref.current || !curtain3Ref.current || !contentRef.current || !logoRef.current) return;

    // Phase 1: Curtains come in (staggered)
    tl.set([curtain1Ref.current, curtain2Ref.current, curtain3Ref.current], { 
      scaleY: 0, 
      transformOrigin: "bottom",
      visibility: "visible",
    })
    .set(logoRef.current, { opacity: 0, scale: 0.8, y: 20 })
    .to(contentRef.current, {
      opacity: 0,
      y: -30,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(curtain1Ref.current, {
      scaleY: 1,
      duration: dur * 0.4,
      ease: "power4.inOut",
    }, "-=0.1")
    .to(curtain2Ref.current, {
      scaleY: 1,
      duration: dur * 0.4,
      ease: "power4.inOut",
    }, "-=0.35")
    .to(curtain3Ref.current, {
      scaleY: 1,
      duration: dur * 0.4,
      ease: "power4.inOut",
    }, "-=0.35")
    // Phase 2: Logo appears
    .to(logoRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: dur * 0.3,
      ease: "back.out(1.7)",
    }, "-=0.2")
    // Phase 3: Pause for effect
    .to({}, { duration: dur * 0.2 })
    // Phase 4: Logo exits
    .to(logoRef.current, {
      opacity: 0,
      scale: 1.1,
      y: -20,
      duration: dur * 0.2,
      ease: "power2.in",
    })
    // Phase 5: Curtains go up (staggered)
    .to(curtain3Ref.current, {
      scaleY: 0,
      transformOrigin: "top",
      duration: dur * 0.4,
      ease: "power4.inOut",
    }, "-=0.1")
    .to(curtain2Ref.current, {
      scaleY: 0,
      transformOrigin: "top",
      duration: dur * 0.4,
      ease: "power4.inOut",
    }, "-=0.35")
    .to(curtain1Ref.current, {
      scaleY: 0,
      transformOrigin: "top",
      duration: dur * 0.4,
      ease: "power4.inOut",
    }, "-=0.35")
    // Phase 6: New content appears
    .fromTo(contentRef.current, 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: dur * 0.4, ease: "power2.out" },
      "-=0.3"
    );
  };

  const animateSlide = (tl: gsap.core.Timeline, dur: number, direction: "left" | "right") => {
    if (!overlayRef.current || !contentRef.current) return;
    
    const xFrom = direction === "left" ? "-100%" : "100%";
    const xTo = direction === "left" ? "100%" : "-100%";

    tl.set(overlayRef.current, { 
      x: xFrom, 
      visibility: "visible",
    })
    .to(contentRef.current, {
      opacity: 0,
      x: direction === "left" ? 50 : -50,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      x: "0%",
      duration: dur * 0.5,
      ease: "power3.inOut",
    }, "-=0.1")
    .to(overlayRef.current, {
      x: xTo,
      duration: dur * 0.5,
      ease: "power3.inOut",
    })
    .fromTo(contentRef.current,
      { opacity: 0, x: direction === "left" ? -50 : 50 },
      { opacity: 1, x: 0, duration: dur * 0.4, ease: "power2.out" },
      "-=0.3"
    );
  };

  const animateZoom = (tl: gsap.core.Timeline, dur: number) => {
    if (!overlayRef.current || !contentRef.current) return;

    tl.set(overlayRef.current, { 
      scale: 0, 
      opacity: 1,
      visibility: "visible",
    })
    .to(contentRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      scale: 2,
      duration: dur * 0.6,
      ease: "power3.inOut",
    }, "-=0.1")
    .to(overlayRef.current, {
      opacity: 0,
      duration: dur * 0.3,
      ease: "power2.out",
    })
    .fromTo(contentRef.current,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: dur * 0.4, ease: "power2.out" },
      "-=0.2"
    )
    .set(overlayRef.current, { visibility: "hidden", scale: 0, opacity: 1 });
  };

  const animateDiagonal = (tl: gsap.core.Timeline, dur: number, color: string) => {
    if (!overlayRef.current || !contentRef.current) return;

    tl.set(overlayRef.current, { 
      scaleX: 0,
      scaleY: 0,
      transformOrigin: "top left",
      visibility: "visible",
      background: `linear-gradient(135deg, ${color} 0%, #1a1a2e 100%)`,
      rotation: 0,
    })
    .to(contentRef.current, {
      opacity: 0,
      x: -50,
      y: 50,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      scaleX: 1.5,
      scaleY: 1.5,
      duration: dur * 0.6,
      ease: "power3.inOut",
    }, "-=0.1")
    .to(overlayRef.current, {
      scaleX: 0,
      scaleY: 0,
      transformOrigin: "bottom right",
      duration: dur * 0.6,
      ease: "power3.inOut",
    })
    .fromTo(contentRef.current,
      { opacity: 0, x: 50, y: -50 },
      { opacity: 1, x: 0, y: 0, duration: dur * 0.4, ease: "power2.out" },
      "-=0.3"
    );
  };

  const animateReveal = (tl: gsap.core.Timeline, dur: number, color: string) => {
    if (!overlayRef.current || !contentRef.current || !logoRef.current) return;

    // Circular reveal with logo
    tl.set(overlayRef.current, { 
      clipPath: "circle(0% at 50% 50%)",
      visibility: "visible",
      background: `radial-gradient(circle, ${color} 0%, #1a1a2e 100%)`,
    })
    .set(logoRef.current, { opacity: 0, scale: 0.5, rotation: -180 })
    .to(contentRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      clipPath: "circle(75% at 50% 50%)",
      duration: dur * 0.5,
      ease: "power3.inOut",
    }, "-=0.1")
    .to(logoRef.current, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: dur * 0.4,
      ease: "back.out(1.7)",
    }, "-=0.3")
    .to({}, { duration: dur * 0.15 })
    .to(logoRef.current, {
      opacity: 0,
      scale: 1.2,
      rotation: 180,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      clipPath: "circle(0% at 50% 50%)",
      duration: dur * 0.5,
      ease: "power3.inOut",
    }, "-=0.2")
    .fromTo(contentRef.current,
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: dur * 0.4, ease: "power2.out" },
      "-=0.3"
    );
  };

  const animateFade = (tl: gsap.core.Timeline, dur: number) => {
    if (!contentRef.current) return;

    tl.to(contentRef.current, {
      opacity: 0,
      duration: dur * 0.5,
      ease: "power2.inOut",
    })
    .fromTo(contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: dur * 0.5, ease: "power2.inOut" }
    );
  };

  const animateWipe = (tl: gsap.core.Timeline, dur: number, color: string) => {
    if (!overlayRef.current || !contentRef.current || !logoRef.current) return;

    // Wipe effect - overlay slides from left to right
    tl.set(overlayRef.current, { 
      scaleX: 0, 
      transformOrigin: "left center",
      visibility: "visible",
      background: `linear-gradient(90deg, ${color} 0%, #1a1a2e 100%)`,
    })
    .set(logoRef.current, { opacity: 0, x: -50, scale: 0.9 })
    .to(contentRef.current, {
      opacity: 0,
      x: 50,
      duration: dur * 0.3,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      scaleX: 1,
      duration: dur * 0.5,
      ease: "power3.inOut",
    }, "-=0.1")
    .to(logoRef.current, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: dur * 0.4,
      ease: "back.out(1.7)",
    }, "-=0.2")
    .to({}, { duration: dur * 0.15 })
    .to(logoRef.current, {
      opacity: 0,
      x: 50,
      duration: dur * 0.2,
      ease: "power2.in",
    })
    .to(overlayRef.current, {
      scaleX: 0,
      transformOrigin: "right center",
      duration: dur * 0.5,
      ease: "power3.inOut",
    })
    .fromTo(contentRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: dur * 0.4, ease: "power2.out" },
      "-=0.3"
    );
  };

  useEffect(() => {
    // Skip animation on first mount
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPathRef.current = location.pathname;
      return;
    }

    // Skip if same path
    if (location.pathname === prevPathRef.current) {
      return;
    }

    const activeStyle = getActiveStyle();

    const runTransition = async () => {
      setIsTransitioning(true);
      
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            setDisplayChildren(children);
            setIsTransitioning(false);
            prevPathRef.current = location.pathname;
          },
        });

        switch (activeStyle) {
          case "curtain":
            animateCurtain(tl, duration, accentColor);
            break;
          case "slide":
            animateSlide(tl, duration, navigationType === "POP" ? "right" : "left");
            break;
          case "zoom":
            animateZoom(tl, duration);
            break;
          case "diagonal":
            animateDiagonal(tl, duration, accentColor);
            break;
          case "reveal":
            animateReveal(tl, duration, accentColor);
            break;
          case "wipe":
            animateWipe(tl, duration, accentColor);
            break;
          default:
            animateCurtain(tl, duration, accentColor);
        }
      });

      return () => ctx.revert();
    };

    runTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, children, transitionStyle, duration, navigationType, accentColor, useRouteStyles]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, transitionStyle, setTransitionStyle }}>
      {/* Multi-layer curtain overlay */}
      <div
        ref={curtain1Ref}
        className="fixed inset-0 z-[9997] pointer-events-none"
        style={{ 
          backgroundColor: primaryColor,
          visibility: "hidden",
          transformOrigin: "bottom",
        }}
      />
      <div
        ref={curtain2Ref}
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ 
          backgroundColor: accentColor,
          visibility: "hidden",
          transformOrigin: "bottom",
        }}
      />
      <div
        ref={curtain3Ref}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ 
          backgroundColor: "#1a1a2e",
          visibility: "hidden",
          transformOrigin: "bottom",
        }}
      />

      {/* Single layer overlay (for other animations) */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ 
          backgroundColor: primaryColor,
          visibility: "hidden",
        }}
      />

      {/* Logo overlay */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Animated Crown/Pigeon icon */}
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gold"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
          <span className="text-lg font-light tracking-[0.4em] text-white/90 uppercase">
            Champion Pigeons
          </span>
        </div>
      </div>

      {/* Main content */}
      <div ref={contentRef}>
        {displayChildren}
      </div>
    </TransitionContext.Provider>
  );
};

export default GSAPPageTransition;
