import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { Champion } from "@/services/championsService";

const FALLBACK = "/placeholder.svg";

const encodeImagePath = (path: string) => {
  if (!path) return FALLBACK;
  if (/^(https?:)?\/\//i.test(path)) return path;

  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    decoded = path;
  }

  const hasLeadingSlash = decoded.startsWith("/");
  const raw = hasLeadingSlash ? decoded.slice(1) : decoded;
  const encoded = raw
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return (hasLeadingSlash ? "/" : "") + encoded;
};

type GalleryImage = {
  src: string;
  label: string;
};

export default function ChampionsGallery({ champions }: { champions: Champion[] }) {
  const [activeChampionIndex, setActiveChampionIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeChampion = champions[Math.max(0, Math.min(activeChampionIndex, champions.length - 1))];

  const images = useMemo<GalleryImage[]>(() => {
    if (!activeChampion) return [];

    const base = activeChampion.image ? [activeChampion.image] : [];
    const extra = Array.isArray(activeChampion.images) ? activeChampion.images : [];
    const pedigree = Array.isArray(activeChampion.pedigreeImages) ? activeChampion.pedigreeImages : [];

    const uniq = Array.from(new Set([...base, ...extra, ...pedigree].filter(Boolean)));

    if (uniq.length === 0) {
      return [{ src: FALLBACK, label: "Zdjęcie" }];
    }

    return uniq.map((src, idx) => ({
      src: encodeImagePath(src),
      label: idx === 0 ? "Zdjęcie" : `Zdjęcie ${idx + 1}`,
    }));
  }, [activeChampion]);

  const safeActiveImageIndex = Math.max(0, Math.min(activeImageIndex, images.length - 1));
  const activeImage = images[safeActiveImageIndex]?.src ?? FALLBACK;

  const goPrev = () => setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveImageIndex((i) => (i + 1) % images.length);

  if (!champions || champions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/55 backdrop-blur-md shadow-lg px-6 py-10 text-center">
        <p className="text-muted-foreground">Brak danych</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-border/70 bg-card/55 backdrop-blur-md shadow-lg p-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {champions.map((c, idx) => {
              const active = idx === activeChampionIndex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveChampionIndex(idx);
                    setActiveImageIndex(0);
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold text-navy"
                      : "bg-background/20 text-foreground hover:bg-background/30 border border-border/70"
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-background/20 px-4 py-3">
            <div className="text-sm text-muted-foreground">Numer obrączki</div>
            <div className="font-semibold text-foreground">{activeChampion.ringNumber || "—"}</div>
          </div>

          {activeChampion.achievements?.length ? (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Osiągnięcia</div>
              <div className="flex flex-wrap gap-2">
                {activeChampion.achievements.slice(0, 6).map((a, i) => (
                  <span
                    key={`${a}-${i}`}
                    className="inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs text-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-border/70 bg-card/55 backdrop-blur-md shadow-lg overflow-hidden">
          <div className="relative">
            <img
              src={activeImage}
              alt={activeChampion.name}
              className="w-full h-[420px] md:h-[520px] object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK;
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-2 text-sm text-foreground backdrop-blur-md hover:bg-background/60 transition-colors"
                aria-label="Powiększ zdjęcie"
              >
                <Maximize2 className="w-4 h-4" />
                Podgląd
              </button>
            </div>

            {images.length > 1 ? (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/35 backdrop-blur-md hover:bg-background/60 transition-colors"
                  aria-label="Poprzednie zdjęcie"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/35 backdrop-blur-md hover:bg-background/60 transition-colors"
                  aria-label="Następne zdjęcie"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : null}

            <div className="absolute left-5 bottom-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/35 border border-border px-4 py-2 backdrop-blur-md">
                <span className="text-foreground font-semibold">{activeChampion.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-sm">{safeActiveImageIndex + 1}/{images.length}</span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {images.map((img, idx) => {
                const active = idx === safeActiveImageIndex;
                return (
                  <button
                    key={`${img.src}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative rounded-lg overflow-hidden border transition-colors",
                      active ? "border-gold" : "border-border/60 hover:border-gold/40"
                    )}
                    aria-label={`Wybierz ${img.label}`}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="h-14 w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK;
                      }}
                    />
                    {active ? <div className="absolute inset-0 ring-1 ring-gold" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-background/60 backdrop-blur-xl border-border">
          <div className="grid gap-4">
            <img
              src={activeImage}
              alt={activeChampion.name}
              className="w-full max-h-[75vh] object-contain rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK;
              }}
            />
            {images.length > 1 ? (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/35 px-4 py-2 text-sm text-foreground backdrop-blur-md hover:bg-background/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Poprzednie
                </button>
                <div className="text-sm text-muted-foreground">
                  {activeChampion.name} • {safeActiveImageIndex + 1}/{images.length}
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/35 px-4 py-2 text-sm text-foreground backdrop-blur-md hover:bg-background/60 transition-colors"
                >
                  Następne
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">{activeChampion.name}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
