import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * initScrollStory - Zoptymalizowana wersja bez duplikacji Lenis.
 * Wykorzystuje globalną instancję Lenis (przez ScrollTrigger.update).
 */
export const initScrollStory = () => {
  // UWAGA: Nie tworzymy tutaj nowej instancji Lenis!
  // Jest ona zarządzana przez SmoothScrollProvider w App.tsx.

  const ctx = gsap.context(() => {
    // Reveal Sections
    gsap.utils.toArray<HTMLElement>(".section-wrapper").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // Stagger Items
    gsap.utils.toArray<HTMLElement>(".section-stagger").forEach((container) => {
      gsap.fromTo(
        container.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: container,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // Parallax Layers
    gsap.utils
      .toArray<HTMLElement>(".parallax-layer")
      .forEach((layer, index) => {
        gsap.to(layer, {
          y: index % 2 === 0 ? 80 : -60,
          ease: "none",
          scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

    // Pinning
    gsap.utils.toArray<HTMLElement>(".section-pin").forEach((pinSection) => {
      const cards = gsap.utils.toArray<HTMLElement>(
        pinSection.querySelectorAll(".pin-card"),
      );
      const overlay = pinSection.querySelector<HTMLElement>(".pin-overlay");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSection,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
        },
      });

      tl.to(pinSection, { scale: 0.96, ease: "none" }, 0);
      if (overlay) {
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.2, ease: "none" }, 0);
      }
      if (cards.length) {
        tl.from(
          cards,
          {
            x: (index: number) => (index % 2 === 0 ? -40 : 40),
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out",
          },
          0,
        );
      }
    });
  });

  return () => ctx.revert();
};
