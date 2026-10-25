import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { DistortionRenderer, type DistortionOptions } from "./DistortionRenderer";

/** Efekt tylko z myszą i bez ograniczenia ruchu – na dotyku zostaje <img>. */
const canUseDistortion = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Podpina DistortionRenderer pod jedno zdjęcie: fala, wybrzuszenie
 * i przechył 3D pod kursorem, płynne przenikanie przy zmianie `src`.
 *
 * `host` to ramka zdjęcia (dostaje `data-gl="ready"`, gdy WebGL rysuje),
 * `canvas` leży w niej pod treścią. Gdy WebGL zawiedzie, nic się nie zmienia.
 */
export const useDistortion = (
  hostRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  src: string | undefined,
  options?: DistortionOptions,
) => {
  const rendererRef = useRef<DistortionRenderer | null>(null);
  const srcRef = useRef(src);
  srcRef.current = src;
  const optionsRef = useRef(options);
  const hasSource = Boolean(src);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const initialSrc = srcRef.current;
    if (!host || !canvas || !initialSrc || !canUseDistortion()) return;

    let renderer: DistortionRenderer;
    try {
      renderer = new DistortionRenderer(canvas, optionsRef.current);
    } catch (err) {
      console.warn("WebGL wyłączony, zostaje zwykłe zdjęcie:", err);
      return;
    }
    renderer.add(host, initialSrc);
    rendererRef.current = renderer;

    // Rysujemy tylko, gdy zdjęcie jest na ekranie.
    let onScreen = false;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
    });
    observer.observe(host);

    // Prędkość z Lenisa (px na klatkę) – przy szybkim scrollu zdjęcie
    // wygina się i rozszczepia kanały RGB jak w poziomym przejeździe.
    const velocityOf = () =>
      gsap.utils.clamp(-1, 1, ((window as any).lenis?.velocity ?? 0) / 40);

    const tick = (_time: number, deltaTime: number) => {
      if (onScreen) renderer.render(velocityOf(), deltaTime / (1000 / 60));
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [hostRef, canvasRef, hasSource]);

  useEffect(() => {
    const host = hostRef.current;
    if (host && src) rendererRef.current?.setSource(host, src);
  }, [hostRef, src]);
};
