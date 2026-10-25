import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GoldArrowButtonProps {
  direction: "prev" | "next";
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  label: string;
  className?: string;
}

/**
 * Złoty okrągły przycisk ze strzałką – ten sam w karuzeli championów
 * na stronie głównej i w modalu championa. Pozycję podaje `className`.
 */
export const GoldArrowButton = ({
  direction,
  onClick,
  label,
  className = "",
}: GoldArrowButtonProps) => {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#A68E4E] flex items-center justify-center text-zinc-900 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl shadow-gold/20 group ${className}`}
    >
      <Icon
        className={`w-6 h-6 md:w-7 md:h-7 transition-transform ${
          direction === "prev"
            ? "group-hover:-translate-x-0.5"
            : "group-hover:translate-x-0.5"
        }`}
      />
    </button>
  );
};

export default GoldArrowButton;
