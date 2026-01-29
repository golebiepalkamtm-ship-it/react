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
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      gsap.set(containerRef.current, { perspective: 1200 });
      gsap.set(charRefs.current, {
        opacity: 0,
        scale: 0.8,
        z: -200,
        filter: "blur(30px) brightness(0.7)",
      });

      tl.to(charRefs.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        filter: "blur(0px) brightness(1)",
        duration: 1.2,
        stagger: {
          each: 0.03,
          from: "center",
        },
      })
        .to(
          charRefs.current,
          {
            filter: "brightness(1.6)",
            duration: 0.12,
            stagger: { each: 0.02, from: "random" },
          },
          "<0.65"
        )
        .to(
          charRefs.current,
          {
            filter: "brightness(1)",
            duration: 0.2,
            stagger: { each: 0.02, from: "edges" },
          },
          "<"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none pointer-events-none mix-blend-overlay ${className}`}
      aria-label={text}
    >
      <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-center">
        {characters.map((char, idx) => (
          <span
            key={`${char}-${idx}`}
            ref={(el) => {
              if (el) charRefs.current[idx] = el;
            }}
            className="inline-block text-[2.8rem] md:text-[3.6rem] lg:text-[4.4rem] font-black leading-none font-[\'Inter\',sans-serif] bg-gradient-to-br from-[#D4AF37] via-[#C18E1F] to-[#8C6A12] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]"
            style={{
              textShadow:
                "1px 0px 8px rgba(193,142,31,0.7), -1px -1px 8px rgba(140,106,18,0.55)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CosmicEnergyHeadline;
