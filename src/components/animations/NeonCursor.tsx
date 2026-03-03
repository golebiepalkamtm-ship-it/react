import { useEffect, useRef } from "react";

/**
 * NeonCursor — Three.js neon trail effect (threejs-toys)
 *
 * Creates a dedicated container div with proper z-index so the
 * WebGL canvas sits ABOVE the VolumetricBackground but BELOW page content.
 * Pointer events pass through so the page remains interactive.
 */

// Dynamic import — Vite resolves "three" from node_modules at bundle time.
// threejs-toys/src/export.js re-exports the neonCursor default function.
const loadNeonCursor = () =>
  import("threejs-toys/src/cursors/neon/index").then((m) => m.default);

export const NeonCursor = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return; // guard against StrictMode double-mount
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    loadNeonCursor().then((neonCursor) => {
      if (cancelled || !container) return;
      initializedRef.current = true;

      neonCursor({
        el: container,
        shaderPoints: 16,
        curvePoints: 80,
        curveLerp: 0.5,
        radius1: 5,
        radius2: 30,
        velocityTreshold: 10,
        sleepRadiusX: 100,
        sleepRadiusY: 100,
        sleepTimeCoefX: 0.0025,
        sleepTimeCoefY: 0.0025,
      });

      // The library creates a <canvas> inside `container`.
      // Ensure it fills the viewport and doesn't block clicks.
      const canvas = container.querySelector("canvas");
      if (canvas) {
        canvas.style.position = "fixed";
        canvas.style.inset = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "9998"; // above background, below UI
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="neon-cursor-container"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9998,
        overflow: "hidden",
      }}
    />
  );
};
