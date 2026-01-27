import { useRef, useEffect, ReactNode } from "react";
import { motion, useInView, useAnimation, Variants, Easing } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PremiumTextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  splitBy?: "chars" | "words" | "lines";
  effect?: "slide" | "fade" | "blur" | "glow" | "wave";
}

export function PremiumTextReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  stagger = 0.03,
  splitBy = "chars",
  effect = "slide",
}: PremiumTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const text = typeof children === "string" ? children : "";
  
  const splitText = () => {
    if (splitBy === "chars") {
      return text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={getCharVariants(effect)}
          custom={i}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ));
    }
    if (splitBy === "words") {
      return text.split(" ").map((word, i) => (
        <motion.span key={i} className="inline-block mr-[0.25em]" variants={getCharVariants(effect)} custom={i}>
          {word}
        </motion.span>
      ));
    }
    return <motion.span variants={getCharVariants(effect)}>{text}</motion.span>;
  };

  const getCharVariants = (effectType: string): Variants => {
    switch (effectType) {
      case "slide":
        return {
          hidden: { y: 50, opacity: 0 },
          visible: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: {
              delay: delay + i * stagger,
              duration,
              ease: "easeOut" as Easing,
            },
          }),
        };
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: delay + i * stagger,
              duration,
            },
          }),
        };
      case "blur":
        return {
          hidden: { opacity: 0, filter: "blur(10px)" },
          visible: (i: number) => ({
            opacity: 1,
            filter: "blur(0px)",
            transition: {
              delay: delay + i * stagger,
              duration,
              ease: "easeOut" as Easing,
            },
          }),
        };
      case "glow":
        return {
          hidden: { opacity: 0, textShadow: "0 0 0px rgba(212,175,55,0)" },
          visible: (i: number) => ({
            opacity: 1,
            textShadow: "0 0 20px rgba(212,175,55,0.5)",
            transition: {
              delay: delay + i * stagger,
              duration,
              ease: "easeOut" as Easing,
            },
          }),
        };
      case "wave":
        return {
          hidden: { y: 20, opacity: 0, rotateX: 45 },
          visible: (i: number) => ({
            y: 0,
            opacity: 1,
            rotateX: 0,
            transition: {
              delay: delay + i * stagger,
              duration,
              ease: "easeOut" as Easing,
            },
          }),
        };
      default:
        return {
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      initial="hidden"
      animate={controls}
      style={{ perspective: effect === "wave" ? 1000 : undefined }}
    >
      {splitText()}
    </motion.div>
  );
}

interface GlowingBorderCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hoverScale?: number;
}

export function GlowingBorderCard({
  children,
  className = "",
  glowColor = "rgba(212,175,55,0.5)",
  hoverScale = 1.02,
}: GlowingBorderCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl 
        border border-white/10 bg-black/40 backdrop-blur-xl
        ${className}
      `}
      whileHover={{ 
        scale: hoverScale,
        boxShadow: `0 0 60px ${glowColor}`,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor} 0%, transparent 50%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({ src, alt, className = "", speed = 0.5 }: ParallaxImageProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: -20 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={imageRef} className="w-full h-[120%] -mt-[10%]">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

interface MagneticElementProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticElement({ children, className = "", strength = 0.3 }: MagneticElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, duration = 2, prefix = "", suffix = "", className = "" }: CountUpProps) {
  const countRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(countRef, { once: true });

  useEffect(() => {
    if (!isInView || !countRef.current) return;

    const element = countRef.current;
    const obj = { value: 0 };

    gsap.to(obj, {
      value: end,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = `${prefix}${Math.round(obj.value)}${suffix}`;
      },
    });
  }, [isInView, end, duration, prefix, suffix]);

  return (
    <span ref={countRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.8,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 60, x: 0 };
      case "down": return { y: -60, x: 0 };
      case "left": return { x: 60, y: 0 };
      case "right": return { x: -60, y: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={containerRef}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
