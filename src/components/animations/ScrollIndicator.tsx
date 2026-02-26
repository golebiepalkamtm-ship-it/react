import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useLenis } from "@/components/animations/SmoothScrollProvider";

/**
 * ScrollIndicator – Premium vertical scroll progress indicator.
 * Opiera się na Lenis jako jedynym źródle prawdy o scrollu.
 */
export const ScrollIndicator: React.FC = () => {
  const lenis = useLenis();

  // MotionValue dla wypełnienia paska – zasilany przez Lenis
  const scaleY = useMotionValue(0);

  // Widoczność i wyświetlany procent – aktualizujemy rzadziej
  const [visible, setVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const lastPercentRef = useRef<number>(0);

  // Derived MV na potrzeby ewentualnych transformacji tekstu bez setState
  const percentMV = useTransform(scaleY, (v) => Math.round(v * 100));

  useEffect(() => {
    if (!lenis) return;

    const onScroll = ({ scroll, limit, progress }: any) => {
      const prog = typeof progress === "number" ? progress : limit ? scroll / limit : 0;
      scaleY.set(prog);

      const p = Math.round(prog * 100);
      if (p !== lastPercentRef.current) {
        lastPercentRef.current = p;
        setPercent(p);
      }

      const isVisible = (scroll ?? 0) > 80;
      if (isVisible !== visible) setVisible(isVisible);
    };

    lenis.on("scroll", onScroll);

    // Jednorazowa inicjalizacja stanu po montażu
    try {
      const scroll = (lenis as any).scroll ?? 0;
      const limit = (lenis as any).limit ?? 1;
      const progress = (lenis as any).progress ?? scroll / limit;
      onScroll({ scroll, limit, progress });
    } catch {
      // Ignore errors during initialization
    }

    return () => {
      lenis.off?.("scroll", onScroll);
    };
  }, [lenis, scaleY, visible]);

  return (
    <motion.div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      aria-hidden="true"
    >
      {/* Label */}
      <span
        className="text-[9px] uppercase tracking-[0.25em] whitespace-nowrap"
        style={{
          color: "rgba(166, 142, 78, 0.5)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          letterSpacing: "0.2em",
        }}
      >
        Scroll
      </span>

      {/* Track */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: "2px",
          height: "120px",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Gold fill – grows as user scrolls */}
        <motion.div
          className="absolute top-0 left-0 w-full rounded-full"
          style={{
            height: "100%",
            scaleY,
            transformOrigin: "top",
            background:
              "linear-gradient(to bottom, #A68E4E, rgba(166,142,78,0.3))",
            boxShadow: "0 0 8px rgba(166,142,78,0.6)",
          }}
        />
      </div>

      {/* Percentage */}
      <motion.span
        className="font-mono font-bold"
        style={{ fontSize: "10px", color: "rgba(166, 142, 78, 0.7)" }}
      >
        {String(percent).padStart(2, "0")}<span style={{ fontSize: "7px", opacity: 0.6 }}>%</span>
      </motion.span>
    </motion.div>
  );
};

export default ScrollIndicator;
