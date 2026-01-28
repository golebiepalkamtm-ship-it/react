import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useParallax = () => {
  const initialized = useRef(false);
  const rafId = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mousePos.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    });

    gsap.utils.toArray<HTMLElement>(".parallax-slow").forEach((element, i) => {
      const baseSpeed = -150;
      const variation = i * 20;

      gsap.to(element, {
        y: baseSpeed - variation,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 3 + i * 0.5,
        },
      });

      gsap.to(element, {
        scale: 1.1,
        opacity: 0.25,
        duration: 4 + i,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.7,
      });
    });

    gsap.utils.toArray<HTMLElement>(".parallax-fast").forEach((element, i) => {
      gsap.to(element, {
        y: -280 - i * 30,
        x: (i % 2 ? 1 : -1) * 40,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      gsap.to(element, {
        scale: 1.15,
        duration: 3 + i * 0.3,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });
    });

    gsap.utils.toArray<HTMLElement>(".timeline-parallax").forEach((card, i) => {
      const direction = i % 2 === 0 ? 1 : -1;

      const cardTl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          end: "top 35%",
          scrub: 1.5,
        },
      });

      cardTl.fromTo(
        card,
        {
          x: direction * 180,
          opacity: 0,
          rotateY: direction * 25,
          scale: 0.85,
          filter: "blur(12px)",
        },
        {
          x: 0,
          opacity: 1,
          rotateY: 0,
          scale: 1,
          filter: "blur(0px)",
          ease: "expo.out",
        }
      );

      gsap.to(card, {
        "--glow-intensity": 1 as any,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: card,
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        },
      });

      gsap.to(card, {
        "--glow-intensity": 0 as any,
        opacity: 0.3,
        scale: 0.95,
        filter: "blur(4px)",
        ease: "power2.in",
        scrollTrigger: {
          trigger: card,
          start: "bottom 40%",
          end: "bottom 10%",
          scrub: 1,
        },
      });
    });

    gsap.utils.toArray<HTMLElement>(".float-parallax").forEach((element, i) => {
      gsap.to(element, {
        y: `${(i % 3 + 1) * -80}`,
        x: `${((i % 2) * 2 - 1) * 50}`,
        rotation: (i % 2) * 15 - 7.5,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 2 + i * 0.5,
        },
      });

      const floatTl = gsap.timeline({ repeat: -1 });

      floatTl.to(element, {
        y: `+=${25 + i * 10}`,
        x: `+=${(i % 2 ? 1 : -1) * 15}`,
        rotation: `+=${(i % 2 ? 1 : -1) * 5}`,
        duration: 3 + i * 0.5,
        ease: "sine.inOut",
      });

      floatTl.to(element, {
        y: `-=${25 + i * 10}`,
        x: `-=${(i % 2 ? 1 : -1) * 15}`,
        rotation: `-=${(i % 2 ? 1 : -1) * 5}`,
        duration: 3 + i * 0.5,
        ease: "sine.inOut",
      });

      floatTl.progress(i * 0.15);
    });

    gsap.utils.toArray<HTMLElement>(".tunnel-ring").forEach((ring, i) => {
      // Continuous breathing animation
      gsap.to(ring, {
        scale: 1.08,
        opacity: 0.35,
        duration: 4 + i * 0.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });

      // Rotation
      gsap.to(ring, {
        rotation: i % 2 === 0 ? 360 : -360,
        duration: 80 + i * 15,
        ease: "none",
        repeat: -1,
      });

      // Scroll interaction - optimized for smoothness
      gsap.to(ring, {
        scale: 1 + i * 0.05,
        opacity: 0.15 - i * 0.02,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Reduced scrub time for tighter response
        },
      });
    });

    const mouseParallaxElements = gsap.utils.toArray<HTMLElement>(".mouse-parallax");

    const updateMouseParallax = () => {
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.06;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.06;

      mouseParallaxElements.forEach((element) => {
        const depth = parseFloat(element.dataset.depth || "0.5");
        const invert = element.dataset.invert === "true" ? -1 : 1;

        const xOffset = mousePos.current.x * depth * 20 * invert;
        const yOffset = mousePos.current.y * depth * 20 * invert;

        gsap.to(element, {
          x: xOffset,
          y: yOffset,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      rafId.current = requestAnimationFrame(updateMouseParallax);
    };

    rafId.current = requestAnimationFrame(updateMouseParallax);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [handleMouseMove]);
};

export default useParallax;

