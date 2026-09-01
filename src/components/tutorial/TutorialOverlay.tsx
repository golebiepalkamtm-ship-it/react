import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTutorial } from "./TutorialProvider";
import TutorialBubble from "./TutorialBubble";

// ── Types ────────────────────────────────────────────────────────
type Placement = "top" | "bottom" | "left" | "right";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const HIGHLIGHT_PAD = 8;
const BUBBLE_GAP = 16;
const BUBBLE_WIDTH = 340;

// ── Helpers ──────────────────────────────────────────────────────
function getTargetRect(
  selector: string,
  padding: number,
): TargetRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
    bottom: r.bottom + padding,
    right: r.right + padding,
  };
}

function computePlacement(
  rect: TargetRect | null,
  preferred: Placement | "auto" | undefined,
): Placement {
  if (!rect) return "bottom";
  if (preferred && preferred !== "auto") return preferred;

  const viewH = window.innerHeight;
  const viewW = window.innerWidth;
  const spaceBelow = viewH - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = viewW - rect.right;
  const spaceLeft = rect.left;

  // Prefer bottom, then top, then right, then left
  if (spaceBelow >= 200) return "bottom";
  if (spaceAbove >= 200) return "top";
  if (spaceRight >= BUBBLE_WIDTH + BUBBLE_GAP) return "right";
  if (spaceLeft >= BUBBLE_WIDTH + BUBBLE_GAP) return "left";
  return "bottom";
}

function computeBubblePosition(
  rect: TargetRect | null,
  placement: Placement,
): { top: number; left: number } {
  if (!rect) {
    // Center of viewport fallback
    return {
      top: window.innerHeight / 2 - 100,
      left: Math.max(16, (window.innerWidth - BUBBLE_WIDTH) / 2),
    };
  }

  const maxLeft = window.innerWidth - BUBBLE_WIDTH - 16;

  switch (placement) {
    case "bottom":
      return {
        top: rect.bottom + BUBBLE_GAP,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - BUBBLE_WIDTH / 2, maxLeft)),
      };
    case "top":
      return {
        top: rect.top - BUBBLE_GAP - 200, // approximate bubble height
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - BUBBLE_WIDTH / 2, maxLeft)),
      };
    case "right":
      return {
        top: Math.max(16, rect.top + rect.height / 2 - 100),
        left: Math.min(rect.right + BUBBLE_GAP, maxLeft),
      };
    case "left":
      return {
        top: Math.max(16, rect.top + rect.height / 2 - 100),
        left: Math.max(16, rect.left - BUBBLE_WIDTH - BUBBLE_GAP),
      };
  }
}

// ── Component ────────────────────────────────────────────────────
export default function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentIndex,
    totalSteps,
    next,
    prev,
    skip,
  } = useTutorial();

  const navigate = useNavigate();
  const location = useLocation();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [placement, setPlacement] = useState<Placement>("bottom");
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });
  const rafRef = useRef<number>(0);
  const prevRouteRef = useRef<string | null>(null);

  // ── Navigate to route if step requires it ────────────────────
  useEffect(() => {
    if (!isActive || !currentStep?.route) return;
    if (location.pathname !== currentStep.route) {
      prevRouteRef.current = location.pathname;
      navigate(currentStep.route);
    }
  }, [isActive, currentStep, location.pathname, navigate]);

  // ── Track target element position ────────────────────────────
  const updatePosition = useCallback(() => {
    if (!currentStep) return;
    const pad = currentStep.highlightPadding ?? HIGHLIGHT_PAD;
    const rect = getTargetRect(currentStep.targetSelector, pad);
    const useFallback = !rect && currentStep.fallbackPosition === "center";

    const effectiveRect = useFallback ? null : rect;
    const pl = computePlacement(effectiveRect, currentStep.placement);
    const pos = computeBubblePosition(effectiveRect, pl);

    setTargetRect(effectiveRect);
    setPlacement(pl);
    setBubblePos(pos);
  }, [currentStep]);

  useEffect(() => {
    if (!isActive) return;

    // Initial position + scroll into view
    const initialTimer = setTimeout(() => {
      updatePosition();

      // Scroll target into view if needed
      if (currentStep?.targetSelector) {
        const el = document.querySelector(currentStep.targetSelector);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top < 0 || r.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Re-measure after scroll
            setTimeout(updatePosition, 400);
          }
        }
      }
    }, 100);

    // Continuous tracking via rAF for smooth follow
    let running = true;
    const loop = () => {
      if (!running) return;
      updatePosition();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // Also listen to resize
    window.addEventListener("resize", updatePosition);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(initialTimer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isActive, currentStep, updatePosition]);

  // ── Keyboard navigation ──────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, next, prev, skip]);

  // ── Render ───────────────────────────────────────────────────
  if (!isActive || !currentStep) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return createPortal(
    <AnimatePresence mode="wait">
      <div
        key="tutorial-overlay"
        className="pointer-events-auto fixed inset-0"
        style={{ zIndex: 9999999 }}
      >
        {/* ── Backdrop with SVG spotlight cutout ───────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
          onClick={skip}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="tutorial-spotlight-mask">
                {/* White = visible backdrop */}
                <rect width="100%" height="100%" fill="white" />
                {/* Black = transparent cutout */}
                {targetRect && (
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{
                      x: targetRect.left,
                      y: targetRect.top,
                      width: targetRect.width,
                      height: targetRect.height,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      damping: 30,
                      stiffness: 200,
                    }}
                    rx={12}
                    ry={12}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              width={vw}
              height={vh}
              fill="rgba(0,0,0,0.65)"
              mask="url(#tutorial-spotlight-mask)"
            />
          </svg>
        </motion.div>

        {/* ── Gold highlight ring ──────────────────────────── */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="pointer-events-none absolute rounded-xl border-2 border-[#A68E4E]/70"
            style={{
              boxShadow:
                "0 0 0 4px rgba(166,142,78,0.15), 0 0 30px rgba(166,142,78,0.25), inset 0 0 20px rgba(166,142,78,0.1)",
            }}
          />
        )}

        {/* ── Tutorial bubble ─────────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 1 }}
        >
          <AnimatePresence mode="wait">
            <div
              key={currentStep.id}
              className="absolute"
              style={{
                top: bubblePos.top,
                left: bubblePos.left,
              }}
            >
              <TutorialBubble
                step={currentStep}
                currentIndex={currentIndex}
                totalSteps={totalSteps}
                placement={placement}
                onNext={next}
                onPrev={prev}
                onSkip={skip}
                isFirst={currentIndex === 0}
                isLast={currentIndex === totalSteps - 1}
              />
            </div>
          </AnimatePresence>
        </div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
