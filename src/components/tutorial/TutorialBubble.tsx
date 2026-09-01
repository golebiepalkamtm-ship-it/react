import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { TutorialStep } from "./tutorialSteps";

interface TutorialBubbleProps {
  step: TutorialStep;
  currentIndex: number;
  totalSteps: number;
  placement: "top" | "bottom" | "left" | "right";
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
  hideArrow?: boolean;
}

const arrowStyles: Record<string, string> = {
  top: "left-1/2 -translate-x-1/2 -bottom-2 border-l-transparent border-r-transparent border-b-transparent border-t-[#A68E4E]/50",
  bottom:
    "left-1/2 -translate-x-1/2 -top-2 border-l-transparent border-r-transparent border-t-transparent border-b-[#A68E4E]/50",
  left: "top-1/2 -translate-y-1/2 -right-2 border-t-transparent border-b-transparent border-r-transparent border-l-[#A68E4E]/50",
  right:
    "top-1/2 -translate-y-1/2 -left-2 border-t-transparent border-b-transparent border-l-transparent border-r-[#A68E4E]/50",
};

const slideOrigin: Record<string, { y?: number; x?: number }> = {
  top: { y: 10 },
  bottom: { y: -10 },
  left: { x: 10 },
  right: { x: -10 },
};

const TutorialBubble = memo(function TutorialBubble({
  step,
  currentIndex,
  totalSteps,
  placement,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
  hideArrow,
}: TutorialBubbleProps) {
  const origin = slideOrigin[placement] ?? { y: -10 };

  const dots = useMemo(
    () =>
      Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
            i === currentIndex
              ? "w-5 bg-[#A68E4E]"
              : i < currentIndex
                ? "w-1.5 bg-[#A68E4E]/50"
                : "w-1.5 bg-white/20"
          }`}
        />
      )),
    [totalSteps, currentIndex],
  );

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, scale: 0.92, ...origin }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.92, ...origin }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="pointer-events-auto relative w-[340px] max-w-[90vw] rounded-2xl border border-[#A68E4E]/50 bg-[#0c1427]/95 p-5 shadow-[0_0_30px_rgba(166,142,78,0.2)] backdrop-blur-xl"
      role="dialog"
      aria-label={step.title}
    >
      {/* Arrow */}
      {!hideArrow && (
        <div
          className={`absolute h-0 w-0 border-[8px] ${arrowStyles[placement] ?? arrowStyles.bottom}`}
        />
      )}

      {/* Icon + Title */}
      <div className="mb-2 flex items-center gap-2.5">
        <span className="text-2xl" role="img" aria-hidden="true">
          {step.icon}
        </span>
        <h3 className="font-display text-lg font-semibold text-[#A68E4E]">
          {step.title}
        </h3>
      </div>

      {/* Description */}
      <p className="mb-2 text-sm leading-relaxed text-white/80">
        {step.description}
      </p>

      {/* Tip */}
      {step.tip && (
        <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-[#A68E4E]/10 px-3 py-2 text-xs text-[#A68E4E]/90">
          <span className="mt-px shrink-0">💡</span>
          {step.tip}
        </p>
      )}

      {/* Progress dots */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {dots}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onSkip}
          className="text-xs text-white/40 transition-colors hover:text-white/70"
          type="button"
        >
          Pomiń
        </button>

        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-white/20 hover:text-white/80"
              type="button"
            >
              Wstecz
            </button>
          )}
          <button
            onClick={onNext}
            className="rounded-lg bg-gradient-to-r from-[#A68E4E] to-[#8e7a42] px-4 py-1.5 text-xs font-bold text-[#0f0f0f] shadow-[0_0_12px_rgba(166,142,78,0.3)] transition-all hover:shadow-[0_0_20px_rgba(166,142,78,0.5)]"
            type="button"
          >
            {isLast ? "Zakończ ✓" : "Dalej →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default TutorialBubble;
