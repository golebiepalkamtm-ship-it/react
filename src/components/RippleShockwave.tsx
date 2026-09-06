import { useEffect, useRef, useCallback } from "react";

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

const RippleShockwave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(true);

  const isAnimatingRef = useRef(false);
  const startAnimationRef = useRef<() => void>(() => {});

  const spawnRipple = useCallback((cx: number, cy: number) => {
    const ripples = ripplesRef.current;
    const maxLife = 60 + Math.random() * 30;
    ripples.push({
      x: cx,
      y: cy,
      radius: 0,
      maxRadius: 150 + Math.random() * 200,
      life: maxLife,
      maxLife,
    });
    // secondary ring, slightly delayed feel
    ripples.push({
      x: cx,
      y: cy,
      radius: 0,
      maxRadius: 80 + Math.random() * 120,
      life: maxLife * 0.7,
      maxLife: maxLife * 0.7,
    });

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      startAnimationRef.current();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onClick = (e: MouseEvent) => spawnRipple(e.clientX, e.clientY);
    window.addEventListener("click", onClick);

    const onVisibility = () => { activeRef.current = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const render = () => {
      if (!activeRef.current) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const ripples = ripplesRef.current;
      if (ripples.length === 0) {
        isAnimatingRef.current = false;
        return; // Pause loop when idle
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life--;
        if (r.life <= 0) { ripples.splice(i, 1); continue; }

        const progress = 1 - r.life / r.maxLife;
        r.radius = r.maxRadius * progress;

        const alpha = (1 - progress) * (1 - progress) * 0.5;
        const lineWidth = Math.max(0.5, (1 - progress) * 2.5);

        // outer shimmer
        const lum = 55 + Math.sin(progress * Math.PI * 3) * 15;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(220, 4%, ${lum}%, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // inner bright edge
        if (r.radius > 5) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.95, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(210, 6%, ${lum + 15}%, ${alpha * 0.4})`;
          ctx.lineWidth = lineWidth * 0.5;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    startAnimationRef.current = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [spawnRipple]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default RippleShockwave;
