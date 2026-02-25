import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * initScrollStory - Elitarna wersja animacji scrolla.
 * Zapewnia premium "look & feel" poprzez głębię, perspektywę i płynne przejścia.
 * ZOPTYMALIZOWANE pod kątem 60fps: brak filter:blur() w scroll-linked animations,
 * force3D dla GPU compositing, czyszczenie props po animacji.
 */
export const initScrollStory = () => {
  const ctx = gsap.context(() => {
    // 1. ELITARNE WEJŚCIA SEKCJI (GPU-optimized)
    // Brak filter:blur() - używamy opacity+scale+translate (GPU composite-only)
    gsap.utils.toArray<HTMLElement>(".section-wrapper").forEach((section) => {
      gsap.set(section, {
        autoAlpha: 0,
        y: 80,
        scale: 0.92,
        rotateX: 12,
        force3D: true,
      });

      gsap.to(section, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 1.8,
        ease: "expo.out",
        force3D: true,
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
        onComplete: () => {
          // Czyszczenie po animacji - zwalnia warstwę GPU
          gsap.set(section, {
            clearProps: "rotateX,scale,willChange",
          });
        },
      });
    });

    // 2. PARALAKSA DLA ZDJĘĆ (.parallax-img) - Ultra Smooth
    gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -15, scale: 1.2 },
        {
          yPercent: 15,
          scale: 1.05,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    });

    // 3. KASKADOWE WYJAWIANIE ELEMENTÓW (GPU-safe)
    // Brak filter:blur() - zastąpione czystym opacity+translate
    gsap.utils.toArray<HTMLElement>(".section-stagger").forEach((container) => {
      const children = container.children;
      if (!children.length) return;

      gsap.from(children, {
        autoAlpha: 0,
        y: 50,
        scale: 0.96,
        duration: 1.4,
        stagger: {
          amount: 0.6,
          from: "start",
          ease: "power2.inOut",
        },
        ease: "expo.out",
        force3D: true,
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // 4. ELITARNE WARSTWY TŁA (Floating Parallax)
    gsap.utils
      .toArray<HTMLElement>(".parallax-layer")
      .forEach((layer, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.to(layer, {
          y: direction * 120,
          rotate: direction * 4,
          scale: 1.08,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

    // 5. ZAAWANSOWANE PRZYPINANIE (GPU-optimized pinning)
    gsap.utils.toArray<HTMLElement>(".section-pin").forEach((pinSection) => {
      const cards = gsap.utils.toArray<HTMLElement>(
        pinSection.querySelectorAll(".pin-card"),
      );
      const overlay = pinSection.querySelector<HTMLElement>(".pin-overlay");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSection,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Efekt zagłębiania się - bez filter:brightness (paint-heavy!)
      // Zamiast tego używamy overlay opacity
      tl.to(
        pinSection,
        {
          scale: 0.9,
          borderRadius: "3rem",
          ease: "power2.inOut",
          force3D: true,
        },
        0,
      );

      if (overlay) {
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.6, ease: "none" }, 0);
      }

      if (cards.length) {
        // Brak filter:blur() - czysty GPU transform
        tl.from(
          cards,
          {
            y: 180,
            autoAlpha: 0,
            scale: 0.65,
            rotateX: 40,
            stagger: 0.25,
            duration: 1.5,
            ease: "expo.out",
            force3D: true,
          },
          0.2,
        );

        // Unoszenie się kart
        tl.to(
          cards,
          {
            y: -50,
            stagger: 0.2,
            ease: "power1.inOut",
            force3D: true,
          },
          0.8,
        );
      }
    });

    // 6. PROGRESS BAR SYNC
    const progressBar = document.querySelector(".scroll-progress-inner");
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }
  });

  return () => ctx.revert();
};
