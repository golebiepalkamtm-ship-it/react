import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type DisplaySettings = {
  brightness: number;
  contrast: number;
};

const STORAGE_KEY = "display-tuning-settings";
const DEFAULT_SETTINGS: DisplaySettings = {
  brightness: 1.25,
  contrast: 1.2,
};

const useIsBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

export const DisplayTuningPanel = () => {
  const isBrowser = useIsBrowser();
  const [visible, setVisible] = useState(true);
  const [brightness, setBrightness] = useState(DEFAULT_SETTINGS.brightness);
  const [contrast, setContrast] = useState(DEFAULT_SETTINGS.contrast);

  useEffect(() => {
    if (!isBrowser) return;
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Partial<DisplaySettings>;
        if (parsed.brightness) setBrightness(parsed.brightness);
        if (parsed.contrast) setContrast(parsed.contrast);
      } catch {
        // ignore malformed cache
      }
    } else {
      const root = getComputedStyle(document.documentElement);
      const currentBrightness = parseFloat(root.getPropertyValue("--global-brightness")) || DEFAULT_SETTINGS.brightness;
      const currentContrast = parseFloat(root.getPropertyValue("--global-contrast")) || DEFAULT_SETTINGS.contrast;
      setBrightness(currentBrightness);
      setContrast(currentContrast);
    }
  }, [isBrowser]);

  useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.style.setProperty("--global-brightness", brightness.toString());
    document.documentElement.style.setProperty("--global-contrast", contrast.toString());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brightness, contrast }));
  }, [brightness, contrast, isBrowser]);

  const sliderConfigs = useMemo(
    () => [
      {
        id: "brightness",
        label: "Jasność",
        value: brightness,
        min: 0.8,
        max: 1.8,
        step: 0.01,
        setter: setBrightness,
        accents: "from-amber-200 to-amber-400",
      },
      {
        id: "contrast",
        label: "Ostrość",
        value: contrast,
        min: 0.9,
        max: 1.4,
        step: 0.01,
        setter: setContrast,
        accents: "from-cyan-200 to-blue-400",
      },
    ],
    [brightness, contrast],
  );

  const reset = () => {
    setBrightness(DEFAULT_SETTINGS.brightness);
    setContrast(DEFAULT_SETTINGS.contrast);
  };

  if (!isBrowser) return null;

  return (
    <>
      {visible ? (
        <div className="fixed bottom-6 left-6 z-[12000] w-72 rounded-3xl border border-white/15 bg-slate-950/85 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="mb-4 flex items-center gap-3 text-white/90">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 backdrop-blur">
              <SlidersHorizontal className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Panel obrazu</p>
              <p className="text-xs text-white/50">Dopasuj jasność i ostrość tylko dla siebie</p>
            </div>
          </div>

          <div className="space-y-5">
            {sliderConfigs.map((slider) => (
              <div key={slider.id}>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/70">
                  <span>{slider.label}</span>
                  <span className="text-white/60">{slider.value.toFixed(2)}</span>
                </div>
                <div className="relative h-9">
                  <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r ${slider.accents} opacity-20 blur-xl`} />
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => slider.setter(parseFloat(e.target.value))}
                    className="relative z-10 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-gold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" onClick={() => setVisible(false)}>
              <EyeOff className="mr-2 h-4 w-4" />
              Ukryj
            </Button>
            <Button variant="ghost" size="sm" className="text-gold hover:text-gold-light" onClick={reset}>
              <Sparkles className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Pokaż panel ustawień obrazu"
          className="fixed bottom-6 left-6 z-[12000] flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/30 backdrop-blur-xl transition hover:border-gold/60 hover:text-gold"
          onClick={() => setVisible(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Panel obrazu
        </button>
      )}
    </>
  );
};
