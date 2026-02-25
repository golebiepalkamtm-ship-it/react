import {
  useLayoutEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

/**
 * GSAP Page Transition System - Bulletproof Version
 *
 * KLUCZOWE POPRAWKI:
 * 1. useLayoutEffect: Przechwytujemy zmianę ZANIM przeglądarka narysuje klatkę (koniec z migotaniem footera).
 * 2. Zarządzanie Scrollem: Przejmujemy całkowitą kontrolę nad scrollowaniem - blokujemy go w momencie zmiany URL
 *    i przywracamy dopiero gdy nowa strona jest gotowa.
 * 3. Content Freeze: Zamrażamy widok starej strony, aby nie "skakała" pod spodem.
 */

type TransitionStyle = "fade";

interface TransitionContextType {
  isTransitioning: boolean;
  transitionStyle: TransitionStyle;
  setTransitionStyle: (style: TransitionStyle) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  transitionStyle: "fade",
  setTransitionStyle: () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

interface GSAPPageTransitionProps {
  children: ReactNode;
  duration?: number;
  primaryColor?: string;
}

export const GSAPPageTransition = ({
  children,
  duration = 0.6,
  primaryColor = "#09090b",
}: GSAPPageTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  const logoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(location.pathname);
  const isFirstMount = useRef(true);

  // Funkcja czyszcząca widok i przygotowująca nową stronę
  const prepareNewPage = useCallback(() => {
    setDisplayChildren(children);
    // Przewijamy na górę dokładnie w momencie gdy ekran jest czarny
    window.scrollTo(0, 0);
    // Jeśli używamy Lenis (Smooth Scroll), musimy go powiadomić
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    }
  }, [children]);

  useLayoutEffect(() => {
    // Pomiń przy pierwszym montowaniu
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Pomiń jeśli ścieżka się nie zmieniła
    if (location.pathname === prevPathRef.current) return;

    // --- KROK 1: NATYCHMIASTOWA BLOKADA WIDOKU ---
    // Zanim przeglądarka narysuje footer nowej strony, rzucamy czarną osłonę.
    if (logoRef.current) {
      gsap.killTweensOf(logoRef.current);
      // Używamy opactity 1 natychmiastowo przez gsap.set
      gsap.set(logoRef.current, {
        visibility: "visible",
        opacity: 1,
        zIndex: 999999,
      });
    }

    // Zamrażamy starą stronę, aby nie "pływała" pod spodem
    if (contentRef.current) {
      gsap.set(contentRef.current, {
        pointerEvents: "none",
        userSelect: "none",
      });
    }

    setIsTransitioning(true);

    // --- KROK 2: SEKWENCJA ANIMACJI ---
    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        prevPathRef.current = location.pathname;
        if (contentRef.current) {
          gsap.set(contentRef.current, {
            clearProps: "pointerEvents,userSelect",
          });
        }
      },
    });

    // Podmiana treści w bezpiecznym momencie (ekran jest już czarny)
    tl.add(() => {
      prepareNewPage();
    })
      // Animacja logo (subtelny wjazd)
      .fromTo(
        ".transition-logo-inner",
        {
          opacity: 0,
          y: 10,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration * 0.4,
          ease: "power2.out",
        },
      )
      .to({}, { duration: 0.3 }) // Przywrócona pauza na logo (poczucie premium)
      // Wyjście - odsłonięcie nowej strony
      .to(".transition-logo-inner", {
        opacity: 0,
        y: -10,
        duration: duration * 0.3,
        ease: "power2.in",
      })
      .to(logoRef.current, {
        opacity: 0,
        duration: 0.2, // Bardzo szybkie wygaszanie czarnej osłony
        ease: "power2.out",
        onComplete: () => {
          gsap.set(logoRef.current, { visibility: "hidden" });
        },
      });

    return () => {
      tl.kill();
    };
  }, [location.pathname, prepareNewPage, duration]);

  const overlay =
    typeof document !== "undefined"
      ? createPortal(
          <div
            ref={logoRef}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: primaryColor,
              visibility: "hidden",
              pointerEvents: "none",
              opacity: 0,
            }}
          >
            <div
              className="transition-logo-inner"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#A68E4E" }}
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <span
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: "10px",
                  fontWeight: 300,
                  letterSpacing: "0.8em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginLeft: "0.8em", // Centrowanie przy dużym letter-spacing
                }}
              >
                Champion Pigeons
              </span>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <TransitionContext.Provider
      value={{
        isTransitioning,
        transitionStyle: "fade",
        setTransitionStyle: () => {},
      }}
    >
      {overlay}
      <div
        ref={contentRef}
        style={{
          width: "100%",
          position: "relative",
          minHeight: "100vh",
        }}
      >
        {displayChildren}
      </div>
    </TransitionContext.Provider>
  );
};

export default GSAPPageTransition;
