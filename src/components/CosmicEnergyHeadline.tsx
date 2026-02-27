import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

interface CosmicEnergyHeadlineProps {
  text?: string;
  className?: string;
}

const CosmicEnergyHeadline = ({
  text = "Cosmic Energy",
  className = "",
}: CosmicEnergyHeadlineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<HTMLSpanElement[]>([]);

  const characters = useMemo(() => text.split(""), [text]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Ustaw początkowy stan - taki sam jak w initHeroTextSplit
      gsap.set(charRefs.current, {
        opacity: 0,
        y: 120,
        rotateX: -90,
        rotateY: 10,
        scale: 0.5,
        transformOrigin: "50% 100% -50",
        filter: "blur(10px)",
      });

      // Animuj - taki sam efekt jak na stronie głównej
      gsap.to(charRefs.current, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.8,
        ease: "expo.out",
        stagger: {
          amount: 1.2,
          from: "start",
          ease: "power3.out",
        },
        delay: 0.6,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none pointer-events-none ${className}`}
      style={{ perspective: 1200 }}
    >
      <h1 className="flex flex-wrap justify-center text-center">
        <span className="sr-only">{text}</span>
        <span
          aria-hidden="true"
          className="flex flex-wrap justify-center text-center"
        >
          {characters.map((char, idx) => (
            <span
              key={`${char}-${idx}`}
              ref={(el) => {
                if (el) charRefs.current[idx] = el;
              }}
              className="inline-block text-3xl md:text-4xl lg:text-6xl font-bold font-display text-gold"
              style={{
                textShadow:
                  "0 0 40px hsl(45 80% 55% / 0.4), 0 0 80px hsl(45 80% 55% / 0.2)",
                filter: "drop-shadow(0 0 20px hsl(45 80% 55% / 0.3))",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </h1>
    </div>
  );
};

export default CosmicEnergyHeadline;
