import { useEffect, useRef } from "react";

/**
 * NeonCursor — Three.js neon trail (threejs-toys)
 *
 * The library creates a <canvas> inside the `el` element and
 * listens for pointer events on that same `el`.
 *
 * We pass `document.body` as `el` so the library can:
 *  1. capture mouse events (needs pointer-events enabled)
 *  2. size the canvas to body dimensions
 *
 * After init we style the created canvas with a high z-index
 * and pointer-events:none so it renders above everything
 * without blocking clicks.
 */

const loadNeonCursor = () =>
  import("threejs-toys/src/cursors/neon/index").then((m) => m.default);

export const NeonCursor = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    // Snapshot existing canvases so we can identify the new one
    const existingCanvases = new Set(document.body.querySelectorAll("canvas"));

    let cancelled = false;

    loadNeonCursor().then((neonCursor) => {
      if (cancelled) return;
      initializedRef.current = true;

      neonCursor({
        el: document.body,
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

      // Find the newly created canvas (the one not in our snapshot)
      requestAnimationFrame(() => {
        const allCanvases = document.body.querySelectorAll(":scope > canvas");
        allCanvases.forEach((canvas) => {
          if (!existingCanvases.has(canvas)) {
            const c = canvas as HTMLCanvasElement;
            c.style.position = "fixed";
            c.style.top = "0";
            c.style.left = "0";
            c.style.width = "100vw";
            c.style.height = "100vh";
            c.style.zIndex = "9998";
            c.style.pointerEvents = "none";
          }
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};
