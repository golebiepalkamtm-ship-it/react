import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * initScrollStory - Elitarna wersja animacji scrolla.
 * Zapewnia premium "look & feel" poprzez głębię, perspektywę i płynne przejścia.
 * Zoptymalizowano dla: Blur reveals, Curtain wipes i Elite transitions.
 */
export const initScrollStory = () => {
  const ctx = gsap.context(() => {
    // 1. ELITARNE WEJŚCIA SEKCJI (Reveal v2 - High Impact)
    // Każda sekcja wchodzi z miksem: Blur + Zoom + Slide + RotateX
    gsap.utils.toArray<HTMLElement>(".section-wrapper").forEach((section) => {
      // Ustawiamy stan początkowy (invisible + deep perspective)
      gsap.set(section, {
        opacity: 0,
        y: 100,
        scale: 0.9,
        rotateX: 15,
        filter: "blur(15px)",
        perspective: 2000,
      });

      gsap.to(section, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 2.2, // Dłuższa, bardziej filmowa animacja
        ease: "expo.out",
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
        // Czyszczenie stylów po animacji dla wydajności
        onComplete: () => {
          gsap.set(section, { clearProps: "filter,perspective,rotateX" });
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
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        },
      );
    });

    // 3. KASKADOWE WYJAWIANIE ELEMENTÓW (Stagger v2)
    // Blur reveal dla mniejszych elementów
    gsap.utils.toArray<HTMLElement>(".section-stagger").forEach((container) => {
      const children = container.children;
      if (!children.length) return;

      gsap.from(children, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        filter: "blur(8px)",
        duration: 1.8,
        stagger: {
          amount: 0.8,
          from: "start",
          ease: "power2.inOut",
        },
        ease: "expo.out",
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
          y: direction * 150, // Większy zakres ruchu
          rotate: direction * 5,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: layer,
            start: "top bottom",
            end: "bottom top",
            scrub: 2, // Mocniejszy scrub dla płynności
          },
        });
      });

    // 5. ZAAWANSOWANE PRZYPINANIE (Pinning v2 - Deep Depth)
    gsap.utils.toArray<HTMLElement>(".section-pin").forEach((pinSection) => {
      const cards = gsap.utils.toArray<HTMLElement>(
        pinSection.querySelectorAll(".pin-card"),
      );
      const overlay = pinSection.querySelector<HTMLElement>(".pin-overlay");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSection,
          start: "top top",
          end: "+=250%", // Dłuższy pin dla lepszego efektu
          pin: true,
          scrub: 1.8,
          anticipatePin: 1,
        },
      });

      // Efekt zagłębiania się w sekcję
      tl.to(
        pinSection,
        {
          scale: 0.9,
          borderRadius: "3rem",
          filter: "brightness(0.8)",
          ease: "power2.inOut",
        },
        0,
      );

      if (overlay) {
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 0.6, ease: "none" }, 0);
      }

      if (cards.length) {
        tl.from(
          cards,
          {
            y: 200,
            opacity: 0,
            scale: 0.6,
            rotateX: 45,
            filter: "blur(20px)",
            stagger: 0.3,
            duration: 1.5,
            ease: "expo.out",
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
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });
    }
  });

  return () => ctx.revert();
};
