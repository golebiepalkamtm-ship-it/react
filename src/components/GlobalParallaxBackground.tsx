import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsapConfig";

/**
 * GLOBAL PARALLAX BACKGROUND - VARIANT 2: DYNAMIC LIGHTS
 * Premium background with animated reflections, radial glows, and subtle spotlights
 * Creates depth and dimension without overwhelming content
 */
const GlobalParallaxBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // WYŁĄCZONE - animacje spowalniają scroll
    // Zostawiamy tylko statyczne warstwy dla wydajności
    console.log(
      "🎨 [Background] Static layers only - animations disabled for performance",
    );

    return () => {
      // No cleanup needed
    };
  }, []);

  // Wyłącz na stronie wyników lotowych - ma własne tło
  if (
    window.location.pathname === "/wyniki-lotowe" ||
    window.location.pathname === "/flight-results"
  ) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -10 }}
    >
      {/* ZŁOTE POŚWIATY - Simpler version for better performance */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 15% 15%, rgba(255, 215, 0, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 85% 85%, rgba(184, 134, 11, 0.08) 0%, transparent 60%)`,
        }}
      />

      {/* Removed heavy grain texture for performance reasons and to fix flickering */}
    </div>
  );
};

export default GlobalParallaxBackground;
