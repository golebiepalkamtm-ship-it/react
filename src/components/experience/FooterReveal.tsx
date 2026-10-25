import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Footer from "@/components/Footer";
import { KineticText } from "./KineticText";

gsap.registerPlugin(ScrollTrigger);

/**
 * Stopka strony głównej odsłaniana spod ostatniej sekcji.
 *
 * Treść strony jest przezroczysta (pod spodem stała mgła), więc klasyczne
 * `position: sticky` pod treścią prześwitywałoby. Zamiast tego wnętrze
 * stopki jedzie w górę wolniej niż scroll (yPercent −35 → 0), a ramka
 * z `overflow: hidden` przycina je – wygląda, jakby stopka leżała pod
 * stroną i wyłaniała się spod jej krawędzi.
 *
 * Nad zwykłą stopką: wielkie CTA z maskowaną typografią i magnetycznymi
 * przyciskami.
 */
export const FooterReveal = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Odsłanianie spod poprzedniej sekcji.
        gsap.fromTo(
          innerRef.current,
          { yPercent: -35 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        // 2. Nagłówek CTA – słowa wyjeżdżają spod masek, raz.
        gsap.fromTo(
          headlineRef.current?.querySelectorAll(".kinetic-unit") ?? [],
          { yPercent: 115, rotate: 6, transformOrigin: "0% 100%" },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.2,
            stagger: 0.07,
            ease: "expo.out",
            scrollTrigger: {
              trigger: headlineRef.current,
              start: "top 85%",
              once: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="footer-reveal">
      <div ref={innerRef} className="footer-reveal__inner">
        <section className="footer-cta" aria-labelledby="footer-cta-title">
          <p className="footer-cta__eyebrow">Od 1979 · Dolny Śląsk</p>

          <h2 id="footer-cta-title" ref={headlineRef} className="footer-cta__title">
            <KineticText splitBy="word">Następny rozdział należy do Ciebie.</KineticText>
          </h2>

          <div className="footer-cta__actions">
            <a
              href="#contact"
              data-magnetic="0.45"
              data-cursor="Napisz"
              className="footer-cta__orb"
            >
              <span className="footer-cta__orb-label">Porozmawiajmy</span>
              <ArrowUpRight className="footer-cta__orb-icon" aria-hidden="true" />
            </a>

            <div className="footer-cta__links">
              <Link to="/auctions" data-magnetic className="footer-cta__pill">
                Przeglądaj aukcje
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/champions"
                data-magnetic
                className="footer-cta__pill footer-cta__pill--ghost"
              >
                Galeria championów
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default FooterReveal;
