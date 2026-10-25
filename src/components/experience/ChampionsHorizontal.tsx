import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useChampions } from "@/hooks/useChampions";
import { DistortionRenderer } from "./webgl/DistortionRenderer";

gsap.registerPlugin(ScrollTrigger);

/** Warunki trybu „przypiętego”: duży ekran i zgoda na ruch. */
const PINNED_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
/** WebGL tylko z myszą – na dotyku wystarcza natywny przewijany pas. */
const WEBGL_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Championy w poziomym przejeździe.
 *
 * Na desktopie sekcja przypina się, a pionowy scroll przesuwa tor w poziomie.
 * Zdjęcia rysuje DistortionRenderer (wygięcie i aberracja przy szybkim
 * scrollu, fala i przechył pod kursorem). Bez WebGL te same karty dostają
 * paralaksę i przechył w CSS. Na telefonie i przy ograniczonym ruchu tor jest
 * zwykłym pasem przewijanym palcem, ze snapowaniem do kart.
 */
export const ChampionsHorizontal = () => {
  const { champions, loading } = useChampions();

  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!section || !track || !viewport || champions.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(PINNED_QUERY, () => {
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

        // 1. Główny przejazd: pionowy scroll → przesunięcie toru w poziomie.
        const travel = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${self.progress})`;
              }
            },
          },
        });

        // 2. Paralaksa tła: ogromne słowo jedzie 3× wolniej niż tor.
        gsap.to(backdropRef.current, {
          x: () => -distance() * 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // 3. Podpisy kart wjeżdżają ze swoją prędkością, gdy karta wchodzi w kadr.
        gsap.utils.toArray<HTMLElement>(".champ-h__caption", track).forEach((caption) => {
          gsap.fromTo(
            caption,
            { xPercent: 30, autoAlpha: 0 },
            {
              xPercent: 0,
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: caption,
                containerAnimation: travel,
                start: "left 100%",
                end: "left 70%",
                scrub: true,
              },
            },
          );
        });

        const velocityOf = () =>
          gsap.utils.clamp(-1, 1, (travel.scrollTrigger?.getVelocity() ?? 0) / 2500);

        const media = gsap.utils.toArray<HTMLElement>(".champ-h__media", track);

        // 4a. WebGL – zdjęcia przemalowuje shader.
        let renderer: DistortionRenderer | null = null;
        if (window.matchMedia(WEBGL_QUERY).matches && canvasRef.current) {
          try {
            renderer = new DistortionRenderer(canvasRef.current);
            media.forEach((el) => {
              const src = el.dataset.glSrc;
              if (src) renderer?.add(el, src);
            });
          } catch (err) {
            console.warn("WebGL wyłączony, zostaje wersja CSS:", err);
            renderer = null;
          }
        }

        // Pętla działa tylko, gdy sekcja jest na ekranie.
        let onScreen = false;
        const observer = new IntersectionObserver(([entry]) => {
          onScreen = entry?.isIntersecting ?? false;
        });
        observer.observe(section);

        // 4b. Fallback CSS: paralaksa kadru i pochylenie toru od prędkości.
        const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
        const images = media.map((el) => el.querySelector("img"));

        const tick = (_time: number, deltaTime: number) => {
          if (!onScreen) return;
          const velocity = velocityOf();
          if (renderer) {
            renderer.render(velocity, deltaTime / (1000 / 60));
            return;
          }
          skewTo(velocity * -4);
          const vw = window.innerWidth;
          media.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const offset = (rect.left + rect.width / 2 - vw / 2) / vw;
            const img = images[i];
            if (img) gsap.set(img, { xPercent: gsap.utils.clamp(-1, 1, offset) * -4 });
          });
        };
        gsap.ticker.add(tick);

        // 5. Przechył 3D w CSS – tylko gdy nie ma WebGL (shader ma własny).
        const tiltCleanups: (() => void)[] = [];
        if (!renderer && window.matchMedia(WEBGL_QUERY).matches) {
          media.forEach((el) => {
            const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
            const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
            const onMove = (e: PointerEvent) => {
              const rect = el.getBoundingClientRect();
              rx(((e.clientY - rect.top) / rect.height - 0.5) * -10);
              ry(((e.clientX - rect.left) / rect.width - 0.5) * 14);
            };
            const onLeave = () => {
              rx(0);
              ry(0);
            };
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerleave", onLeave);
            tiltCleanups.push(() => {
              el.removeEventListener("pointermove", onMove);
              el.removeEventListener("pointerleave", onLeave);
            });
          });
        }

        // Pin powstaje po wczytaniu danych, więc później niż wyzwalacze
        // sekcji poniżej – porządkujemy je, by liczyły pozycje z odstępem pinu.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();

        return () => {
          gsap.ticker.remove(tick);
          observer.disconnect();
          tiltCleanups.forEach((fn) => fn());
          renderer?.destroy();
        };
      });

      return () => mm.revert();
    },
    { dependencies: [champions.length], scope: sectionRef },
  );

  if (!loading && champions.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="championy-w-locie"
      aria-labelledby="champ-h-title"
      className="champ-h"
    >
      <span ref={backdropRef} className="champ-h__backdrop" aria-hidden="true">
        Elita
      </span>

      <div ref={viewportRef} className="champ-h__viewport">
        <ol ref={trackRef} className="champ-h__track">
          <li className="champ-h__intro">
            <h2 id="champ-h-title" className="champ-h__title">
              Championy w locie
            </h2>
            <p className="champ-h__lead">
              {champions.length > 0
                ? `${champions.length} ptaków, które zbudowały nazwisko Pałka MTM. Przewiń, a przelecą przed Tobą jeden po drugim.`
                : "Ładowanie championów…"}
            </p>
          </li>

          {champions.map((champion, index) => (
            <li
              key={champion.id}
              className={`champ-h__card ${index % 2 ? "champ-h__card--low" : ""}`}
            >
              <Link
                to="/champions"
                data-cursor="Zobacz"
                className="champ-h__link"
                aria-label={`${champion.name}, ${champion.ringNumber ?? ""} – zobacz w galerii`}
              >
                <div className="champ-h__media" data-gl-src={champion.images[0]}>
                  <img
                    src={champion.images[0]}
                    alt={champion.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
                <div className="champ-h__caption">
                  <span className="champ-h__ring">{champion.ringNumber}</span>
                  <span className="champ-h__name">{champion.name}</span>
                  {champion.achievements[0] ? (
                    <span className="champ-h__result">{champion.achievements[0]}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}

          <li className="champ-h__outro">
            <p className="champ-h__outro-text">
              Rodowody, wyniki i pełne zdjęcia każdego championa.
            </p>
            <Link to="/champions" data-magnetic className="champ-h__cta">
              Pełna galeria championów
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </li>
        </ol>
      </div>

      <canvas ref={canvasRef} className="champ-h__canvas" aria-hidden="true" />
      <div className="champ-h__progress" aria-hidden="true">
        <div ref={progressRef} className="champ-h__progress-bar" />
      </div>
    </section>
  );
};

export default ChampionsHorizontal;
