import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { markPreloaderDone, markPreloaderRunning } from "@/lib/preloaderSignal";

const SESSION_KEY = "pmtm-preloader-seen";
const MIN_DURATION = 1.6; // s – licznik nie przeskakuje do 100 w mgnieniu oka
const MAX_WAIT = 4500; // ms – nigdy nie trzymamy strony dłużej

const shouldShow = () => {
  if (typeof window === "undefined") return false;
  if (window.location.pathname !== "/") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
};

/** Czeka na fonty i pełne załadowanie strony (obrazy, wideo Hero). */
const waitForAssets = () =>
  Promise.race([
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          ),
    ]),
    new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT)),
  ]);

/**
 * Preloader – licznik 0–100 i kurtyna odsłaniająca stronę.
 *
 * Pokazuje się raz na sesję, tylko przy wejściu na stronę główną.
 * Licznik idzie do 90 w swoim tempie, a resztę dobiera dopiero po
 * załadowaniu fontów i zasobów, więc liczba odpowiada stanowi strony.
 */
export const Preloader = () => {
  const [visible, setVisible] = useState(() => {
    const show = shouldShow();
    if (show) markPreloaderRunning();
    return show;
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<SVGSVGElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!visible || !rootRef.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Lenis powstaje w useEffect providera, czyli już po tym efekcie –
    // zatrzymujemy go w następnej klatce, gdy instancja na pewno istnieje.
    const stopScrollId = requestAnimationFrame(() => {
      (window as any).lenis?.stop();
    });
    document.documentElement.classList.add("is-preloading");

    const progress = { value: 0 };
    const render = () => {
      const v = Math.round(progress.value);
      if (counterRef.current) counterRef.current.textContent = String(v);
      if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
      rootRef.current?.setAttribute("aria-valuenow", String(v));
    };

    let cancelled = false;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        nameRef.current,
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: "expo.out", delay: 0.1 },
      );

      const fill = gsap.to(progress, {
        value: 90,
        duration: reduced ? 0.2 : MIN_DURATION,
        ease: "power2.inOut",
        onUpdate: render,
      });

      const finish = () => {
        if (cancelled) return;
        const exit = gsap.timeline({
          onComplete: () => {
            try {
              sessionStorage.setItem(SESSION_KEY, "1");
            } catch {
              // Prywatne okno – preloader pokaże się przy następnym wejściu.
            }
            document.documentElement.classList.remove("is-preloading");
            (window as any).lenis?.start();
            setVisible(false);
          },
        });

        exit.to(progress, {
          value: 100,
          duration: reduced ? 0.1 : 0.5,
          ease: "power3.out",
          onUpdate: render,
        });

        if (reduced) {
          exit
            .to(rootRef.current, { autoAlpha: 0, duration: 0.3 })
            .add(markPreloaderDone, "<");
          return;
        }

        exit
          .to(
            [counterRef.current, nameRef.current],
            { yPercent: -110, duration: 0.7, ease: "expo.in", stagger: 0.05 },
            "+=0.15",
          )
          .to(
            barRef.current,
            { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.in" },
            "<",
          )
          // Kurtyna podnosi się od dołu – Hero startuje razem z nią,
          // więc tytuł składa się już w odsłoniętym kadrze. Dolna krawędź
          // (SVG) wygina się w największym pędzie i prostuje na końcu,
          // jak ciężki materiał ciągnięty za górne rogi.
          .addLabel("lift")
          .to(curtainRef.current, {
            yPercent: -100,
            duration: 1.1,
            ease: "expo.inOut",
          }, "lift")
          .to(edgeRef.current, {
            scaleY: 1,
            duration: 0.55,
            ease: "power2.in",
          }, "lift")
          .to(edgeRef.current, {
            scaleY: 0,
            duration: 0.55,
            ease: "power2.out",
          }, "lift+=0.55")
          .add(markPreloaderDone, "lift+=0.35");
      };

      Promise.all([waitForAssets(), fill.then()]).then(finish);
    }, rootRef);

    return () => {
      cancelled = true;
      cancelAnimationFrame(stopScrollId);
      ctx.revert();
      document.documentElement.classList.remove("is-preloading");
      (window as any).lenis?.start();
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div
      ref={rootRef}
      className="preloader"
      role="progressbar"
      aria-label="Ładowanie strony"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div ref={curtainRef} className="preloader__curtain">
        <div className="preloader__inner">
          <span className="preloader__mask">
            <span ref={nameRef} className="preloader__name">
              Pałka MTM
            </span>
          </span>

          <span className="preloader__mask preloader__mask--counter">
            <span ref={counterRef} className="preloader__counter">
              0
            </span>
          </span>
        </div>

        <div ref={barRef} className="preloader__bar" aria-hidden="true" />

        <svg
          ref={edgeRef}
          className="preloader__edge"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 0 H100 V0 Q50 100 0 0 Z" />
        </svg>
      </div>
    </div>,
    document.body,
  );
};

export default Preloader;
