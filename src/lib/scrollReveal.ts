import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealTarget = Element | null | undefined;

interface ScrubRevealOptions {
  /** Przesunięcie startowe w px (domyślnie 24) */
  y?: number;
  /** Przesunięcie poziome w px (domyślnie 0) */
  x?: number;
  /** Skala startowa (domyślnie 1 – bez skalowania) */
  scale?: number;
  /** Gdzie startuje wejście (domyślnie gdy góra elementu mija 88% wysokości ekranu) */
  start?: string;
  /** Zachowane dla zgodności wywołań – wejście nie jest już sprzężone ze scrollem */
  end?: string;
  /** Odstęp między kolejnymi elementami listy w sekundach (domyślnie 0.08) */
  stagger?: number;
}

/**
 * Jednorazowe wejście elementów, gdy wjeżdżają w kadr.
 *
 * Wcześniej przezroczystość i pozycja były sprzężone ze scrollem (scrub),
 * przez co nagłówki i karty zatrzymywały się w półcieniu, a strona wyglądała
 * na niedokończoną i „pływającą”. Teraz każdy element raz, krótko (0.7 s)
 * wjeżdża na miejsce i zostaje – treść jest zawsze w pełni czytelna.
 *
 * Przy prefers-reduced-motion elementy są po prostu widoczne, bez ruchu.
 */
export const scrubReveal = (
  targets: RevealTarget | RevealTarget[],
  {
    y = 24,
    x = 0,
    scale = 1,
    start = "top 88%",
    stagger = 0.08,
  }: ScrubRevealOptions = {},
) => {
  const list = (Array.isArray(targets) ? targets : [targets]).filter(
    (t): t is Element => !!t,
  );
  if (!list.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Ruch ograniczony do kilkudziesięciu pikseli – większe wartości z wywołań
  // dawały efekt „wlatywania” całych bloków.
  const clamp = (v: number) => Math.max(-32, Math.min(32, v));

  gsap.fromTo(
    list,
    { autoAlpha: 0, y: clamp(y), x: clamp(x), scale: Math.max(scale, 0.98) },
    {
      autoAlpha: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger,
      overwrite: "auto",
      clearProps: "transform",
      scrollTrigger: {
        trigger: list[0] as Element,
        start,
        once: true,
        invalidateOnRefresh: true,
      },
    },
  );
};

export default scrubReveal;
