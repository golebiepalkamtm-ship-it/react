import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  TUTORIAL_TRACKS,
  TUTORIAL_STORAGE_KEYS,
  type TutorialStep,
  type TutorialTrack,
} from "./tutorialSteps";

// ── Context Value ────────────────────────────────────────────────
interface TutorialContextValue {
  /** Whether the tutorial is currently active and visible */
  isActive: boolean;
  /** Current track being played */
  currentTrack: TutorialTrack | null;
  /** Current step object */
  currentStep: TutorialStep | null;
  /** Current step index (0-based) */
  currentIndex: number;
  /** Total steps in current track */
  totalSteps: number;
  /** Go to next step or finish */
  next: () => void;
  /** Go to previous step */
  prev: () => void;
  /** Skip and close the tutorial */
  skip: () => void;
  /** Restart a specific track (or auto-detect) */
  restart: (track?: TutorialTrack) => void;
  /** Start a specific track */
  start: (track: TutorialTrack) => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

// ── Helper: localStorage safe ops ────────────────────────────────
function isTrackDone(track: TutorialTrack): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEYS[track]) === "true";
  } catch {
    return false;
  }
}

function markTrackDone(track: TutorialTrack): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEYS[track], "true");
  } catch {
    // ignore — private browsing etc.
  }
}

function clearTrackDone(track: TutorialTrack): void {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEYS[track]);
  } catch {
    // ignore
  }
}

// ── Helper: determine which track to show ────────────────────────
function detectTrack(
  user: any,
  profile: any,
): TutorialTrack | null {
  if (!user) {
    // Not logged in → welcome track
    return isTrackDone("welcome") ? null : "welcome";
  }

  const role = profile?.role;

  if (role === "USER_FULL_VERIFIED" || role === "ADMIN") {
    // Fully verified → features track
    return isTrackDone("features") ? null : "features";
  }

  // Registered or email-verified but not fully verified → verification track
  return isTrackDone("verification") ? null : "verification";
}

// ── Provider ─────────────────────────────────────────────────────
export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  const [activeTrack, setActiveTrack] = useState<TutorialTrack | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const autoStartedRef = useRef(false);

  const steps = activeTrack ? TUTORIAL_TRACKS[activeTrack] : [];
  const currentStep = steps[stepIndex] ?? null;
  const totalSteps = steps.length;
  const isActive = activeTrack !== null && currentStep !== null;

  // ── Auto-start on first visit ──────────────────────────────────
  useEffect(() => {
    // Only auto-start once per session
    if (autoStartedRef.current) return;

    const timer = setTimeout(() => {
      const track = detectTrack(user, profile);
      if (track) {
        autoStartedRef.current = true;
        setActiveTrack(track);
        setStepIndex(0);
      }
    }, 2000); // 2s delay after page load

    return () => clearTimeout(timer);
  }, [user, profile]);

  const next = useCallback(() => {
    if (!activeTrack) return;
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      // Finished
      markTrackDone(activeTrack);
      setActiveTrack(null);
      setStepIndex(0);
    }
  }, [activeTrack, stepIndex, steps.length]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    if (activeTrack) {
      markTrackDone(activeTrack);
    }
    setActiveTrack(null);
    setStepIndex(0);
  }, [activeTrack]);

  const start = useCallback((track: TutorialTrack) => {
    setActiveTrack(track);
    setStepIndex(0);
  }, []);

  const restart = useCallback(
    (track?: TutorialTrack) => {
      const resolvedTrack = track ?? detectTrack(user, profile) ?? "welcome";
      clearTrackDone(resolvedTrack);
      setActiveTrack(resolvedTrack);
      setStepIndex(0);
    },
    [user, profile],
  );

  // ── Listen for restart event from UserPanel button ─────────────
  useEffect(() => {
    const handler = () => restart();
    window.addEventListener("restartTutorial", handler);
    return () => window.removeEventListener("restartTutorial", handler);
  }, [restart]);

  const value = useMemo<TutorialContextValue>(
    () => ({
      isActive,
      currentTrack: activeTrack,
      currentStep,
      currentIndex: stepIndex,
      totalSteps,
      next,
      prev,
      skip,
      restart,
      start,
    }),
    [
      isActive,
      activeTrack,
      currentStep,
      stepIndex,
      totalSteps,
      next,
      prev,
      skip,
      restart,
      start,
    ],
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────
export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error("useTutorial must be used within <TutorialProvider>");
  }
  return ctx;
}
