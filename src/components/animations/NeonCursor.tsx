import React, { useEffect } from "react";

/**
 * NeonCursor based on Three.js-Toys
 * This component injects the script and initializes the interactive neon trail
 */
export const NeonCursor: React.FC = () => {
  useEffect(() => {
    // Check if the script is already loaded to avoid duplicates
    const scriptId = "threejs-toys-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initCursor = () => {
      // @ts-expect-error - threejsToys is injected globally via script
      if (window.threejsToys && window.threejsToys.neonCursor) {
        // @ts-expect-error - threejsToys is injected globally via script
        window.threejsToys.neonCursor({
          el: document.getElementById("root"), // Using #root as the primary container
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
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.textContent = `
        import { neonCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js';
        window.threejsToys = { neonCursor };
        // Dispatch event when ready
        window.dispatchEvent(new CustomEvent('threejs-toys-ready'));
      `;
      document.body.appendChild(script);

      window.addEventListener("threejs-toys-ready", initCursor);
    } else {
      initCursor();
    }

    return () => {
      // Cleanup if necessary (though neonCursor often handles session persistence)
      window.removeEventListener("threejs-toys-ready", initCursor);
    };
  }, []);

  return null;
};
