import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * initScrollStory - Elitarna wersja animacji scrolla.
 * Zapewnia premium "look & feel" poprzez głębię, perspektywę i płynne przejścia.
 */
export const initScrollStory = () => {
  const ctx = gsap.context(() => {
    // 1. ELITARNE WEJŚCIA SEKCJI (Reveal)
    // Każda sekcja wchodzi z delikatnym obrotem w 3D, skalą i skew
    gsap.utils.toArray<HTMLElement>(".section-wrapper").forEach((section) => {
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 80,
          scale: 0.94,
          rotateX: 10,
          perspective: 1200,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
          // Clear styles AFTER animation to avoid layout issues with fixed elements
          onComplete: () => {
            gsap.set(section, { clearProps: "perspective,rotateX,scale" });
          },
        },
      );
    });

    // 2. PARALAKSA DLA ZDJĘĆ (.parallax-img)
    // Efekt głębi wewnątrz kontenerów ze zdjęciami
    gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((img) => {
      gsap.to(img, {
        yPercent: 15,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: img,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // 3. KASKADOWE WYJAWIANIE ELEMENTÓW (Stagger)
    // Dla grup elementów jak karty czy ikony
    gsap.utils.toArray<HTMLElement>(".section-stagger").forEach((container) => {
      gsap.from(container.children, {
        opacity: 0,
        y: 40,
        rotation: 2,
        duration: 1.2,
        stagger: {
          amount: 0.4,
          from: "start",
        },
        ease: "power3.out",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // 4. WARSTWY TŁA I DEKORACJE (.parallax-layer)
    gsap.utils
      .toArray<HTMLElement>(".parallax-layer")
      .forEach((layer, index) => {
        gsap.to(layer, {
          y: index % 2 === 0 ? 120 : -100,
          rotate: index % 2 === 0 ? 4 : -4,
          ease: "none",
          scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });

    // 5. ZAWANSOWANE PRZYPINANIE (Pinning)
    // Sekcje które "zostają" na ekranie podczas gdy ich treść się animuje
    gsap.utils.toArray<HTMLElement>(".section-pin").forEach((pinSection) => {
      const cards = gsap.utils.toArray<HTMLElement>(
        pinSection.querySelectorAll(".pin-card"),
      );
      const overlay = pinSection.querySelector<HTMLElement>(".pin-overlay");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSection,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      // Delikatne zmniejszenie sekcji przy przypięciu (efekt głębi)
      tl.to(
        pinSection,
        { scale: 0.94, borderRadius: "2.5rem", ease: "power2.inOut" },
        0,
      );

      if (overlay) {
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.4, ease: "none" }, 0.2);
      }

      if (cards.length) {
        tl.from(
          cards,
          {
            x: (index: number) => (index % 2 === 0 ? -60 : 60),
            y: 30,
            rotateY: (index: number) => (index % 2 === 0 ? 15 : -15),
            opacity: 0,
            scale: 0.8,
            stagger: 0.2,
            ease: "back.out(1.2)",
          },
          0.3,
        );
      }
    });

    // 6. PROGRESS BAR / SCROLL INDICATOR SYNC
    // Jeśli na stronie jest .scroll-progress-inner, synchronizujemy go z całą stroną
    const progressBar = document.querySelector(".scroll-progress-inner");
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }
  });

  return () => ctx.revert();
};
