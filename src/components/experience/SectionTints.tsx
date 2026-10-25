import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionTintsProps {
  /** Kontener, w którym szukamy sekcji z atrybutem `data-tint="#rrggbb"`. */
  scope: RefObject<HTMLElement | null>;
}

/**
 * Płynna zmiana koloru tła między sekcjami.
 *
 * Zamiast animować `background-color` (przemalowanie całego ekranu co klatkę)
 * każdy kolor ma własną nieruchomą warstwę pod treścią, a scroll przenika
 * tylko ich `opacity`. Mgła VolumetricBackground zostaje pod spodem, więc
 * sekcje bez `data-tint` wyglądają dokładnie jak dotąd.
 */
export const SectionTints = ({ scope }: SectionTintsProps) => {
  const layersRef = useRef<HTMLDivElement>(null);

  // useEffect, nie useLayoutEffect: ref kontenera-rodzica jest podpinany
  // dopiero po efektach layoutu dzieci, a tu potrzebujemy go gotowego.
  useEffect(() => {
    const root = scope.current;
    const layers = layersRef.current;
    if (!root || !layers) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-tint]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const triggers = sections.map((section) => {
      const layer = document.createElement("div");
      layer.className = "section-tint";
      layer.style.backgroundColor = section.dataset.tint ?? "transparent";
      layers.appendChild(layer);

      // Kolor wchodzi, gdy sekcja zajmuje środek ekranu, i schodzi,
      // gdy go opuszcza – w obie strony scrolla.
      return ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 45%",
        // Sekcja może zawierać pin (poziomy przejazd) – liczymy ją dopiero
        // po pinach, inaczej koniec nie uwzględnia ich dodatkowej wysokości.
        refreshPriority: -1,
        onToggle: ({ isActive }) => {
          gsap.to(layer, {
            opacity: isActive ? 1 : 0,
            duration: reduced ? 0 : 1.1,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        },
      });
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      gsap.killTweensOf(layers.children);
      layers.replaceChildren();
    };
  }, [scope]);

  // Bez portalu: #root ma własny kontekst nakładania (z-index: 0), więc
  // warstwa z-index -1 w <body> lądowałaby pod mgłą z wnętrza #root.
  return <div ref={layersRef} className="section-tints" aria-hidden="true" />;
};

export default SectionTints;
