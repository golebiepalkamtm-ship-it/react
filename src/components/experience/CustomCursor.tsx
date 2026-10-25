import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

/** Elementy, nad którymi pierścień się powiększa. */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], summary, label, select, [data-cursor]';
/** Pola tekstowe – tu wraca systemowa karetka, a własny kursor znika. */
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"]';
/** Elementy przyciągane do kursora. */
const MAGNETIC_SELECTOR = "[data-magnetic], .nav-link-premium";

const RING_LERP = 0.16; // bezwładność pierścienia przy 60 FPS
const MAGNETIC_STRENGTH = 0.35;

const canUseCustomCursor = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Własny kursor: kropka idzie za wskaźnikiem 1:1, pierścień z inercją (lerp).
 *
 * - `data-cursor="Zobacz"` na elemencie – pierścień rośnie i pokazuje etykietę.
 * - `data-magnetic` (oraz linki nawigacji) – element lekko podąża za kursorem.
 * - Na ekranach dotykowych i przy prefers-reduced-motion nic się nie montuje.
 */
export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(canUseCustomCursor);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Reaguje na podłączenie myszy do tabletu albo zmianę ustawień ruchu.
  useEffect(() => {
    const queries = [
      window.matchMedia("(hover: hover) and (pointer: fine)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const update = () => setEnabled(canUseCustomCursor());
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    let visible = false;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dotX = gsap.quickSetter(dot, "x", "px");
    const dotY = gsap.quickSetter(dot, "y", "px");
    const ringX = gsap.quickSetter(ring, "x", "px");
    const ringY = gsap.quickSetter(ring, "y", "px");

    // Lerp niezależny od liczby klatek: przy 120 Hz ruch jest tak samo ciężki.
    const tick = (_time: number, deltaTime: number) => {
      const factor = 1 - Math.pow(1 - RING_LERP, deltaTime / (1000 / 60));
      ringPos.x += (target.x - ringPos.x) * factor;
      ringPos.y += (target.y - ringPos.y) * factor;
      ringX(ringPos.x);
      ringY(ringPos.y);
    };
    gsap.ticker.add(tick);

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
    };
    const hide = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.3 });
    };

    // --- Stany pierścienia ---------------------------------------------
    type CursorState = "default" | "hover" | "label" | "text";
    let state: CursorState = "default";

    const setState = (next: CursorState, text = "") => {
      if (next === state && label.textContent === text) return;
      state = next;
      label.textContent = text;
      ring.dataset.state = next;

      gsap.to(ring, {
        scale: next === "label" ? 3 : next === "hover" ? 1.6 : next === "text" ? 0.4 : 1,
        duration: 0.5,
        ease: "expo.out",
        overwrite: "auto",
      });
      gsap.to(dot, {
        scale: next === "default" ? 1 : 0,
        duration: 0.3,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(label, {
        autoAlpha: next === "label" ? 1 : 0,
        duration: 0.25,
        overwrite: "auto",
      });
    };

    // --- Magnetyzm -------------------------------------------------------
    type Magnet = { x: gsap.QuickToFunc; y: gsap.QuickToFunc };
    const magnets = new WeakMap<HTMLElement, Magnet>();
    let activeMagnet: HTMLElement | null = null;

    const getMagnet = (el: HTMLElement): Magnet => {
      let magnet = magnets.get(el);
      if (!magnet) {
        magnet = {
          x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
        };
        magnets.set(el, magnet);
      }
      return magnet;
    };

    const releaseMagnet = () => {
      if (!activeMagnet) return;
      gsap.to(activeMagnet, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
      activeMagnet = null;
    };

    const pullMagnet = (el: HTMLElement, e: PointerEvent) => {
      if (activeMagnet !== el) {
        releaseMagnet();
        activeMagnet = el;
      }
      // Środek liczymy bez bieżącego przesunięcia, inaczej element „ucieka”.
      const rect = el.getBoundingClientRect();
      const offsetX = Number(gsap.getProperty(el, "x")) || 0;
      const offsetY = Number(gsap.getProperty(el, "y")) || 0;
      const cx = rect.left - offsetX + rect.width / 2;
      const cy = rect.top - offsetY + rect.height / 2;
      const strength = Number(el.dataset.magnetic) || MAGNETIC_STRENGTH;
      const magnet = getMagnet(el);
      magnet.x((e.clientX - cx) * strength);
      magnet.y((e.clientY - cy) * strength);
    };

    // --- Zdarzenia -------------------------------------------------------
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      dotX(e.clientX);
      dotY(e.clientY);
      show();

      const el = e.target instanceof Element ? e.target : null;

      const magnetic = el?.closest<HTMLElement>(MAGNETIC_SELECTOR);
      if (magnetic) pullMagnet(magnetic, e);
      else releaseMagnet();

      if (el?.closest(TEXT_SELECTOR)) {
        setState("text");
        return;
      }
      const labelled = el?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setState("label", labelled.dataset.cursor || "");
        return;
      }
      setState(el?.closest(INTERACTIVE_SELECTOR) ? "hover" : "default");
    };

    const onDown = () =>
      gsap.to(ring, {
        scale: Number(gsap.getProperty(ring, "scale")) * 0.85,
        duration: 0.2,
        overwrite: "auto",
      });
    const onUp = () => setState(state, label.textContent || "");
    const onLeaveWindow = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        hide();
        releaseMagnet();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseout", onLeaveWindow);

    return () => {
      gsap.ticker.remove(tick);
      releaseMagnet();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseout", onLeaveWindow);
      root.classList.remove("has-custom-cursor");
      gsap.killTweensOf([dot, ring, label]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return createPortal(
    <>
      <div ref={ringRef} className="cursor-ring" data-state="default" aria-hidden="true">
        <span ref={labelRef} className="cursor-ring__label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>,
    document.body,
  );
};

export default CustomCursor;
