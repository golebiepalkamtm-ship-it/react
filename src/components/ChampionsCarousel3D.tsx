import React, { useMemo, useRef, useEffect, useCallback, useState, startTransition } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import './champions-carousel-3d.css';
import type { Champion } from '@/services/championsService';

/* Config */
const CARD_W = 300;
const CARD_H = 430;
// Radius is computed from card width + count (fallback if something goes weird)
const RADIUS_FALLBACK = 1400;
// Set tilt sensitivity to 0 to keep carousel static (no up/down tilt)
const TILT_SENSITIVITY = 0;
const DRAG_SENSITIVITY = 0.4;
const INERTIA_FRICTION = 0.95;
const AUTOSPIN_SPEED: number = 0.08; // deg per frame-ish (only when idle)
const IDLE_TIMEOUT = 3000;
const ROTATION_SPEED = 0.3;

const FALLBACK = '/placeholder.svg';

interface ChampionsCarousel3DProps {
  champions: Champion[];
}

const encodeImagePath = (path: string) => {
  if (!path) return FALLBACK;
  // Already absolute (API / CDN)
  if (/^(https?:)?\/\//i.test(path)) return path;

  // If API already returned an encoded path (contains %XX), decode it first
  // to avoid double-encoding (% -> %25) which breaks file lookup.
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    decoded = path;
  }

  const hasLeadingSlash = decoded.startsWith('/');
  const raw = hasLeadingSlash ? decoded.slice(1) : decoded;
  const encoded = raw
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  return (hasLeadingSlash ? '/' : '') + encoded;
};

/* Card Component */
interface CardProps {
  champion: Champion;
  onSelect?: () => void;
  onPedigreeClick?: (champion: Champion) => void;
}

const Card = React.memo(({ champion, onSelect, onPedigreeClick }: CardProps) => {
  const imageSrc = encodeImagePath(champion.image);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowTargetRef = useRef<HTMLDivElement>(null);
  const [imgMode, setImgMode] = useState<'landscape' | 'portrait' | 'square' | 'unknown'>('unknown');

  const updateShineVars = (clientX: number, clientY: number) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const px = Math.max(0, Math.min((100 / rect.width) * x, 100));
    const py = Math.max(0, Math.min((100 / rect.height) * y, 100));
    el.style.setProperty('--mx', `${px.toFixed(2)}%`);
    el.style.setProperty('--my', `${py.toFixed(2)}%`);
  };

  const updateGlowVars = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const px = Math.max(0, Math.min((100 / rect.width) * x, 100));
    const py = Math.max(0, Math.min((100 / rect.height) * y, 100));

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    let angle = 0;
    if (dx !== 0 || dy !== 0) {
      angle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
      if (angle < 0) angle += 360;
    }

    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    const edge = Math.max(0, Math.min((1 / Math.min(kx, ky)), 1));
    const pointerD = edge * 100;

    el.style.setProperty("--pointer-x", `${px.toFixed(3)}%`);
    el.style.setProperty("--pointer-y", `${py.toFixed(3)}%`);
    el.style.setProperty("--pointer-°", `${angle.toFixed(3)}deg`);
    el.style.setProperty("--pointer-d", `${pointerD.toFixed(3)}`);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateShineVars(e.clientX, e.clientY);
    const el = glowTargetRef.current;
    if (el) updateGlowVars(el, e.clientX, e.clientY);
  };

  const onPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    updateShineVars(e.clientX, e.clientY);
    cardRef.current?.style.setProperty('--shine', '1');
    const el = glowTargetRef.current;
    if (el) updateGlowVars(el, e.clientX, e.clientY);
  };

  const onPointerLeave = () => {
    cardRef.current?.style.setProperty('--shine', '0');
    const el = glowTargetRef.current;
    if (el) el.style.setProperty("--pointer-d", "0");
  };

  const handlePedigreeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPedigreeClick?.(champion);
  };

  return (
    <div className="champions-carousel-3d__card-wrapper">
      <motion.div
        ref={glowTargetRef}
        className="champions-carousel-3d__card glass-card edge-glow-card border-gradient-gold gold-glow"
        whileHover={{
          y: -6,
          scale: 1.02,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="edge-glow" aria-hidden="true" />
        <div
          role="button"
          tabIndex={0}
          className="champions-carousel-3d__card-content"
          ref={cardRef as any}
          onClick={onSelect}
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          aria-label={onSelect ? `Otwórz ${champion.name}` : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.();
            }
          }}
        >
          {/* Header */}
          {/* header removed per request */}

          {/* Image */}
          <div className="champions-carousel-3d__card-image-wrapper">
            <img
              src={imageSrc}
              alt={champion.name}
              className={`champions-carousel-3d__card-image ${imgMode === 'portrait' ? 'img--portrait' : 'img--landscape'}`}
              loading="lazy"
              draggable="false"
              onLoad={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.naturalWidth > img.naturalHeight) setImgMode('landscape');
                else if (img.naturalWidth < img.naturalHeight) setImgMode('portrait');
                else setImgMode('square');
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK;
              }}
            />
            {/* Reflection (CodePen-like polish) */}
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              className={`champions-carousel-3d__card-image champions-carousel-3d__card-image--reflection ${imgMode === 'portrait' ? 'img--portrait' : 'img--landscape'}`}
              loading="lazy"
              draggable="false"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK;
              }}
            />
            <div className="champions-carousel-3d__card-image-overlay" />
          </div>

          {/* Details */}
          <div className="champions-carousel-3d__card-details">
            <p className="champions-carousel-3d__card-ring">{champion.ringNumber}</p>

            <div
              role="button"
              tabIndex={0}
              onClick={handlePedigreeClick}
              className="champions-carousel-3d__pedigree-btn"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePedigreeClick(e as unknown as React.MouseEvent);
                }
              }}
              aria-label="Pokaż rodowód"
            >
              <FileText size={16} />
              <span>Rodowód</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

Card.displayName = 'Card';

/* Main 3D Carousel Component */
const ChampionsCarousel3D: React.FC<ChampionsCarousel3DProps> = ({ champions }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const targetRotationRef = useRef(0);
  const rotationRef = useRef(0);
  const tiltRef = useRef(0);
  const targetTiltRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(0);
  const initialRotationRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Mouse tilt effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!parentRef.current || isDraggingRef.current) return;

      lastInteractionRef.current = Date.now();
      const parentRect = parentRef.current.getBoundingClientRect();
      const mouseY = e.clientY - parentRect.top;
      const normalizedY = (mouseY / parentRect.height - 0.5) * 2;

      targetTiltRef.current = -normalizedY * TILT_SENSITIVITY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update target rotation when index changes
  useEffect(() => {
    if (champions.length > 0) {
      const anglePerCard = 360 / champions.length;
      targetRotationRef.current = -currentIndex * anglePerCard;
    }
  }, [currentIndex, champions.length]);

  // Animation loop
  useEffect(() => {
    // initialize last interaction timestamp
    lastInteractionRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const isIdle = now - lastInteractionRef.current > IDLE_TIMEOUT;

      if (!isDraggingRef.current) {
        // Smooth rotation to target
        const rotationDiff = targetRotationRef.current - rotationRef.current;
        if (Math.abs(rotationDiff) > 0.1) {
          rotationRef.current += rotationDiff * ROTATION_SPEED;
        } else {
          rotationRef.current = targetRotationRef.current;
        }

        // Auto-spin when idle (subtle)
        if (isIdle && AUTOSPIN_SPEED !== 0) {
          rotationRef.current += AUTOSPIN_SPEED;
          targetRotationRef.current = rotationRef.current;
        }

        // Apply inertia from drag
        if (Math.abs(velocityRef.current) > 0.01) {
          velocityRef.current *= INERTIA_FRICTION;
        }
      }

      // Smooth tilt
      tiltRef.current += (targetTiltRef.current - tiltRef.current) * 0.1;

      if (wheelRef.current) {
        // Oddal koło karuzeli w głąb strony (oś Z).
        // Use a larger negative translateZ so the carousel sits deeper on the page.
        wheelRef.current.style.transform = `translateZ(-1200px) rotateX(${tiltRef.current}deg) rotateY(${rotationRef.current}deg)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    lastInteractionRef.current = Date.now();
    isDraggingRef.current = true;
    velocityRef.current = 0;
    dragStartRef.current = clientX;
    initialRotationRef.current = rotationRef.current;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;
    lastInteractionRef.current = Date.now();

    const deltaX = clientX - dragStartRef.current;
    const newRotation = initialRotationRef.current + deltaX * DRAG_SENSITIVITY;

    velocityRef.current = newRotation - rotationRef.current;
    rotationRef.current = newRotation;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    lastInteractionRef.current = Date.now();
    
    // Snap to nearest card
    if (champions.length > 0) {
      const anglePerCard = 360 / champions.length;
      const nearestIndex = Math.round(-rotationRef.current / anglePerCard);
      setCurrentIndex((nearestIndex % champions.length + champions.length) % champions.length);
    }
  }, [champions.length]);

  // Navigation functions
  const goToNext = useCallback(() => {
    startTransition(() => {
      setCurrentIndex((prev) => (prev + 1) % champions.length);
    });
  }, [champions.length]);

  const goToPrev = useCallback(() => {
    startTransition(() => {
      setCurrentIndex((prev) => (prev - 1 + champions.length) % champions.length);
    });
  }, [champions.length]);

  // Event listeners
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);

  // Pre-compute card transforms
  const radius = useMemo(() => {
    const n = Math.max(1, champions.length);
    if (n === 1) return 0;
    // Cylinder radius so cards don't overlap: r = (w/2) / tan(pi/n)
    const r = (CARD_W / 2) / Math.tan(Math.PI / n);
    // Add a bit of breathing room
    const padded = r + 120;
    // keep within sane bounds
    return Number.isFinite(padded) ? Math.max(420, Math.min(padded, RADIUS_FALLBACK)) : RADIUS_FALLBACK;
  }, [champions.length]);

  const cards = useMemo(
    () =>
      champions.map((champion, idx) => {
        const angle = (idx * 360) / champions.length;
        return {
          key: champion.id,
          champion,
          transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
          index: idx,
        };
      }),
    [champions, radius]
  );

  // Push per-card transforms without JSX inline styles
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const wrappers = wheel.querySelectorAll<HTMLDivElement>('.champions-carousel-3d__card-wrapper');
    wrappers.forEach((el, idx) => {
      const card = cards[idx];
      if (!card) return;
      el.style.transform = card.transform;
    });
  }, [cards]);

  // Active champion and background for pedigree preview (declare before any early returns)
  const activeChampion = champions[currentIndex];
  const pedigreeBg =
    activeChampion?.pedigreeImages && activeChampion.pedigreeImages.length > 0
      ? encodeImagePath(activeChampion.pedigreeImages[0])
      : encodeImagePath(activeChampion?.image || FALLBACK);

  useEffect(() => {
    if (!bgRef.current) return;
    bgRef.current.style.backgroundImage = `url('${pedigreeBg}')`;
  }, [pedigreeBg]);

  if (!champions || champions.length === 0) {
    return (
      <div className="w-full h-96 bg-white rounded-2xl flex items-center justify-center">
        <p className="text-black/60">Brak danych champions</p>
      </div>
    );
  }


  return (
    <div className="champions-carousel-3d">
      {/* Background */}
      <div
        ref={bgRef}
        className="champions-carousel-3d__bg"
      />
      <div className="champions-carousel-3d__overlay" />

      {/* 3D Carousel */}
      <div
        ref={parentRef}
        className="champions-carousel-3d__perspective"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          ref={wheelRef}
          className="champions-carousel-3d__wheel"
        >
          {cards.map((card) => (
            <Card
              key={card.key}
              champion={card.champion}
              onSelect={() => startTransition(() => setCurrentIndex(card.index))}
              onPedigreeClick={(champion) => {
                // TODO: Implement pedigree modal/view
                console.log('Show pedigree for:', champion);
                alert(`Rodowód dla ${champion.name} - funkcja w przygotowaniu`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="champions-carousel-3d__nav champions-carousel-3d__nav--left"
        aria-label="Poprzedni champion"
      >
        <ChevronLeft size={48} />
      </button>
      
      <button
        onClick={goToNext}
        className="champions-carousel-3d__nav champions-carousel-3d__nav--right"
        aria-label="Następny champion"
      >
        <ChevronRight size={48} />
      </button>

      {/* Instructions */}
      <div className="champions-carousel-3d__instructions">
        <p className="champions-carousel-3d__instructions-text">
          Użyj strzałek lub przeciągnij aby obrócić • {currentIndex + 1} / {champions.length}
        </p>
      </div>
    </div>
  );
};

export default ChampionsCarousel3D;
