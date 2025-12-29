/**
 * ParticleBackground - tło z animowanymi cząsteczkami
 * Zoptymalizowane dla 60 FPS z użyciem Canvas API
 * Paleta zgodna z kolorystyką projektu (gold/primary/navy)
 */
import { useEffect, useRef, useCallback } from 'react';
import { projectColors, hsl } from '@/hooks/useEtherealEffects';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulse: number;
  isGold: boolean; // Rozróżnienie między gold a primary particles
}

interface LightningArc {
  startIndex: number;
  endIndex: number;
  life: number;
  maxLife: number;
  seed: number;
  color: 'gold' | 'primary';
  jitter: number;
  thickness: number;
  isFlare: boolean;
  flareLife: number;
  flareMaxLife: number;
  flareIntensity: number;
  branches: Array<{
    t: number;
    deviation: number;
    lengthFactor: number;
    polarity: 1 | -1;
    seed: number;
  }>;
  explosiveBursts?: Array<{
    t: number;
    direction: 1 | -1;
    length: number;
    life: number;
    maxLife: number;
    rays: number;
    seed: number;
    intensity: number;
  }>;
  powerBoost: number;
  cascadeChains?: Array<{
    startT: number;
    segments: Array<{
      length: number;
      drift: number;
      seed: number;
      thickness: number;
      power: number;
    }>;
  }>;
  columnGlowStrength: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  variant?: 'gold' | 'primary' | 'mixed';
}

export const ParticleBackground = ({
  particleCount = 130,
  variant = 'gold',
}: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const arcsRef = useRef<LightningArc[]>([]);
  const lastFlareTimeRef = useRef(0);
  const lastArcSpawnRef = useRef(0);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const globalFlashRef = useRef({
    intensity: 0,
    color: 'gold' as 'gold' | 'primary',
    x: 0,
    y: 0,
  });

  // Inicjalizacja cząsteczek
  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
      isGold: variant === 'mixed' ? Math.random() > 0.5 : variant === 'gold',
    }));
    arcsRef.current = [];
  }, [particleCount, variant]);

  const spawnArc = useCallback(() => {
    const particles = particlesRef.current;
    if (particles.length < 2) return;

    const nowSec = (performance?.now?.() ?? Date.now()) * 0.001;
    const spacing =
      variant === 'mixed' ? 1.4 : variant === 'gold' ? 1.8 : 2.1;
    if (nowSec - lastArcSpawnRef.current < spacing) return;

    const arcRange = variant === 'mixed' ? 460 : variant === 'gold' ? 400 : 360;
    const minDistance = arcRange * 0.42;
    const minVertical = arcRange * 0.25;
    const maxArcs = variant === 'mixed' ? 5 : 4;
    let startIndex = Math.floor(Math.random() * particles.length);
    let startParticle = particles[startIndex];
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const topCandidates = particles
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => p.y < viewportHeight * 0.45);
    if (topCandidates.length > 12 && Math.random() < 0.75) {
      const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
      startIndex = chosen.idx;
      startParticle = particles[startIndex];
    }

    let targetIndex = -1;
    let longestDistance = 0;
    for (let i = 0; i < particles.length; i++) {
      if (i === startIndex) continue;
      const candidate = particles[i];
      const dx = startParticle.x - candidate.x;
      const dy = startParticle.y - candidate.y;
      const distSq = dx * dx + dy * dy;
      const verticalDiff = candidate.y - startParticle.y;
      if (
        distSq > longestDistance &&
        distSq < arcRange * arcRange &&
        distSq > minDistance * minDistance &&
        verticalDiff >= minVertical
      ) {
        longestDistance = distSq;
        targetIndex = i;
      }
    }

    if (targetIndex === -1) {
      // fallback: wybierz najdalszą możliwą cząsteczkę w zasięgu
      for (let i = 0; i < particles.length; i++) {
        if (i === startIndex) continue;
        const candidate = particles[i];
        const dx = startParticle.x - candidate.x;
        const dy = startParticle.y - candidate.y;
        const distSq = dx * dx + dy * dy;
        const verticalDiff = candidate.y - startParticle.y;
        if (
          distSq > longestDistance &&
          distSq < arcRange * arcRange &&
          verticalDiff >= minVertical / 2
        ) {
          longestDistance = distSq;
          targetIndex = i;
        }
      }
    }

    if (targetIndex === -1) return;

    if (particles[startIndex].y > particles[targetIndex].y) {
      const temp = startIndex;
      startIndex = targetIndex;
      targetIndex = temp;
      startParticle = particles[startIndex];
    }

    const color: 'gold' | 'primary' =
      startParticle.isGold || particles[targetIndex].isGold ? 'gold' : 'primary';

    const branchCount = Math.random() < 0.35 ? 2 : 1;
    const branches = Array.from({ length: branchCount }, () => ({
      t: 0.2 + Math.random() * 0.6,
      deviation: 0.15 + Math.random() * 0.45,
      lengthFactor: 0.55 + Math.random() * 0.4,
      polarity: Math.random() > 0.5 ? 1 : -1,
      seed: Math.random() * 1000,
    }));

    const now = nowSec;
    const timeSinceLastFlare = now - lastFlareTimeRef.current;
    const flareCooldown = variant === 'mixed' ? 3.6 : 4.5;
    const flareChance = variant === 'mixed' ? 0.075 : 0.055;
    const isFlare = timeSinceLastFlare >= flareCooldown && Math.random() < flareChance;
    const flareDuration = isFlare ? 0.6 + Math.random() * 0.55 : 0;
    const flareIntensity = isFlare ? 1.5 + Math.random() * 0.9 : 0;
    if (isFlare) {
      lastFlareTimeRef.current = now;
    }

    const arcLength =
      Math.hypot(
        particles[targetIndex].x - particles[startIndex].x,
        particles[targetIndex].y - particles[startIndex].y,
      ) || 1;

    let explosiveBursts: LightningArc['explosiveBursts'] = [];
    if (isFlare && Math.random() < 0.42) {
      const burstCount = Math.random() < 0.35 ? 2 : 1;
      explosiveBursts = Array.from({ length: burstCount }, () => {
        const life = 0.45 + Math.random() * 0.4;
        return {
          t: 0.2 + Math.random() * 0.55,
          direction: Math.random() > 0.5 ? 1 : -1,
          length: 70 + Math.random() * 110,
          life,
          maxLife: life,
          rays: 4 + Math.floor(Math.random() * 4),
          seed: Math.random() * 5000,
          intensity: 0.8 + Math.random() * 0.6,
        };
      });
    }

    let cascadeChains: LightningArc['cascadeChains'] = undefined;
    const cascadeChance = isFlare ? 0.95 : variant === 'mixed' ? 0.7 : 0.6;
    if (Math.random() < cascadeChance) {
      const chainCount = isFlare && Math.random() < 0.5 ? 2 : 1;
      cascadeChains = Array.from({ length: chainCount }, () => {
        const segmentCount = 2 + Math.floor(Math.random() * (isFlare ? 3 : 2));
        return {
          startT: 0.05 + Math.random() * 0.25,
          segments: Array.from({ length: segmentCount }, (_, idx) => ({
            length: arcLength * (0.24 + Math.random() * 0.25) + idx * 45 + Math.random() * 60,
            drift: (Math.random() - 0.5) * 0.85,
            seed: Math.random() * 2000,
            thickness: 0.55 + Math.random() * 0.45 + idx * 0.05,
            power: 0.7 + Math.random() * 0.55 + (isFlare ? 0.45 : 0),
          })),
        };
      });
    }
    const columnGlowStrength = 0.45 + Math.random() * 0.55 + (isFlare ? 0.35 : 0);

    arcsRef.current.push({
      startIndex,
      endIndex: targetIndex,
      life: 1.2,
      maxLife: 1.2,
      seed: Math.random() * 1000,
      color,
      jitter: 18 + Math.random() * 18,
      thickness: 0.55 + Math.random() * 0.45,
      isFlare,
      flareLife: flareDuration,
      flareMaxLife: flareDuration,
      flareIntensity,
      branches,
      explosiveBursts,
      powerBoost: 0.65 + Math.random() * 0.7,
      cascadeChains,
      columnGlowStrength,
    });
    lastArcSpawnRef.current = now;

    if (arcsRef.current.length > maxArcs) {
      arcsRef.current.shift();
    }
  }, [variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Główna pętla animacji
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const time = (performance?.now?.() ?? Date.now()) * 0.001;
      const flashState = globalFlashRef.current;
      if (particles.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += 0.015;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Interakcja z myszą - lekkie odpychanie
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.x -= (dx / distance) * force * 0.5;
          particle.y -= (dy / distance) * force * 0.5;
        }

        // Pulsujące właściwości
        const pulseFactor = 0.5 + 0.5 * Math.sin(particle.pulse);
        const currentOpacity = particle.opacity * pulseFactor;
        const currentSize = particle.size * (0.8 + 0.4 * pulseFactor);

        // Wybierz kolor na podstawie typu cząsteczki
        const color = particle.isGold ? projectColors.gold : projectColors.primary;

        // Rysowanie zewnętrznej poświaty (gradientu) zostało usunięte w celu optymalizacji wydajności.

        // Rysuj rdzeń cząsteczki
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = hsl({ ...color, l: color.l + 20 }, currentOpacity * 1.5);
        ctx.fill();
      });

      // Aktualizuj i rysuj łuki elektryczne
      arcsRef.current = arcsRef.current.filter((arc) => {
        arc.life -= 0.02 + Math.random() * 0.01;
        if (arc.isFlare && arc.flareLife > 0) {
          arc.flareLife -= 0.03 + Math.random() * 0.01;
          if (arc.flareLife < 0) {
            arc.flareLife = 0;
          }
        }
        arc.explosiveBursts?.forEach((burst) => {
          burst.life = Math.max(0, burst.life - (0.05 + Math.random() * 0.02));
        });
        return arc.life > 0;
      });

      let frameFlashStrength = 0;
      let frameFlashX = 0;
      let frameFlashY = 0;
      let frameFlashWeight = 0;
      let frameFlashColor: 'gold' | 'primary' = flashState.color;

      arcsRef.current.forEach((arc) => {
        const start = particles[arc.startIndex];
        const end = particles[arc.endIndex];
        if (!start || !end) return;

        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const length = Math.hypot(deltaX, deltaY) || 1;
        const dirX = deltaX / length;
        const dirY = deltaY / length;
        const perpX = -deltaY / length;
        const perpY = deltaX / length;

        const segments = length > 220 ? 8 : 6;
        const pathPoints: Array<{ t: number; x: number; y: number }> = [];
        const computePoint = (t: number) => {
          const wobbleStrength = arc.jitter * (1 - Math.abs(0.5 - t) * 1.8);
          const wobble = Math.sin((t * 12 + time * 5 + arc.seed) * 1.2) * wobbleStrength;
          return {
            t,
            x: start.x + deltaX * t + perpX * wobble,
            y: start.y + deltaY * t + perpY * wobble,
          };
        };

        pathPoints.push({ t: 0, x: start.x, y: start.y });

        for (let s = 1; s < segments; s++) {
          const t = s / segments;
          const point = computePoint(t);
          pathPoints.push(point);
        }

        pathPoints.push({ t: 1, x: end.x, y: end.y });

        const strokeLightningPath = (
          width: number,
          strokeStyle: string,
          shadowBlur: number,
          shadowColor: string,
          composite?: GlobalCompositeOperation,
        ) => {
          ctx.save();
          if (composite) {
            ctx.globalCompositeOperation = composite;
          }
          ctx.beginPath();
          ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
          for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          }
          ctx.lineWidth = width;
          ctx.strokeStyle = strokeStyle;
          ctx.shadowBlur = shadowBlur;
          ctx.shadowColor = shadowColor;
          ctx.stroke();
          ctx.restore();
        };

        const intensity = Math.max(0, arc.life / arc.maxLife);
        const flicker = 0.5 + 0.5 * Math.sin((time + arc.seed) * 14);
        const arcColor = arc.color === 'gold' ? projectColors.gold : projectColors.primary;
        const flareStrength = arc.isFlare && arc.flareMaxLife > 0
          ? Math.pow(Math.max(0, arc.flareLife) / arc.flareMaxLife, 0.45) * arc.flareIntensity
          : 0;
        const totalPower = arc.powerBoost + (flareStrength > 0 ? flareStrength * 1.35 : 0);
        const columnGlow = arc.columnGlowStrength ?? 0;
        const glowAlpha = Math.min(1, 0.3 + intensity * 0.3 + totalPower * 0.3 + flicker * 0.18);
        const lineWidth = Math.max(0.18, arc.thickness * (0.3 + totalPower * 0.35));

        if (columnGlow > 0.1) {
          const haloWidth = Math.max(0.12, lineWidth * 0.2);
          strokeLightningPath(
            haloWidth,
            hsl({ ...arcColor, l: arcColor.l + 68 }, Math.min(0.6, 0.18 + columnGlow * 0.4)),
            140 * columnGlow + 50,
            hsl({ ...arcColor, l: arcColor.l + 78 }, 0.4 + columnGlow * 0.45),
            'screen',
          );
        }

        strokeLightningPath(
          lineWidth,
          hsl({ ...arcColor, l: arcColor.l + 30 + totalPower * 6 }, glowAlpha),
          55 * intensity + 36 + totalPower * 50,
          hsl({ ...arcColor, l: arcColor.l + 42 + totalPower * 5 }, 0.99),
        );

        if (flareStrength > 0.06) {
          strokeLightningPath(
            Math.max(0.2, lineWidth * 1),
            hsl({ ...arcColor, l: arcColor.l + 44 }, Math.min(0.95, 0.26 + flareStrength * 0.6)),
            68 * flareStrength + 22,
            hsl({ ...arcColor, l: arcColor.l + 50 }, 0.97),
            'lighter',
          );

          pathPoints.forEach((point, idx) => {
            if (idx === 0 || idx === pathPoints.length - 1) return;
            const pulse = 0.5 + flareStrength * 0.85;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 0.12 + pulse * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = hsl({ ...arcColor, l: arcColor.l + 48 }, Math.min(0.85, 0.25 + flareStrength * 0.4));
            ctx.fill();
          });
        }

        // Branches
        arc.branches.forEach((branch, index) => {
          const branchBase = computePoint(branch.t);
          const deviationX = perpX * branch.deviation * branch.polarity;
          const deviationY = perpY * branch.deviation * branch.polarity;
          const branchDirX = dirX * (1 - branch.deviation * 0.3) + deviationX;
          const branchDirY = dirY * (1 - branch.deviation * 0.3) + deviationY;
          const dirLength = Math.hypot(branchDirX, branchDirY) || 1;
          let normDirX = branchDirX / dirLength;
          let normDirY = branchDirY / dirLength;
          if (normDirY < 0) {
            normDirX *= -1;
            normDirY *= -1;
          }
          const branchLength = length * branch.lengthFactor;
          const steps = 3;

          ctx.beginPath();
          ctx.moveTo(branchBase.x, branchBase.y);

          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const flickerOffset = Math.sin((time * 8 + branch.seed + s * 0.7)) * branch.deviation * 6;
            const wobble = flickerOffset * (1 - t);
            const pointX = branchBase.x + normDirX * branchLength * t + perpX * wobble;
            const pointY = branchBase.y + normDirY * branchLength * t + perpY * wobble;
            ctx.lineTo(pointX, pointY);
          }

          const branchIntensity = intensity * 0.75 + totalPower * 0.4;
          const branchAlpha = Math.min(0.98, 0.2 + branchIntensity * 0.62 + flareStrength * 0.16);
          ctx.strokeStyle = hsl({ ...arcColor, l: arcColor.l + 32 + index * 2 + totalPower * 3 }, branchAlpha);
          ctx.lineWidth = Math.max(0.2, arc.thickness * 0.25 + totalPower * 0.22);
          ctx.shadowBlur = 30 * branchIntensity + 22 + totalPower * 28;
          ctx.shadowColor = hsl({ ...arcColor, l: arcColor.l + 38 + totalPower * 4 }, 0.98);
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        if (arc.cascadeChains && arc.cascadeChains.length) {
          arc.cascadeChains.forEach((chain) => {
            const cascadeOrigin = computePoint(Math.min(0.9, Math.max(0.03, chain.startT)));
            let segStartX = cascadeOrigin.x;
            let segStartY = cascadeOrigin.y;
            let lastEndX = segStartX;
            let lastEndY = segStartY;
            chain.segments.forEach((segment, segIndex) => {
              if (segment.length <= 0) return;
              const driftWave = segment.drift + Math.sin(time * 6.2 + segment.seed + segIndex) * 0.35;
              let cascadeDirX = dirX * 0.35 + driftWave * perpX + dirX * 0.15 * segIndex;
              let cascadeDirY = Math.abs(dirY) * 0.6 + 0.55 + segIndex * 0.18;
              if (cascadeDirY < 0.35) cascadeDirY = 0.35;
              const dirNorm = Math.hypot(cascadeDirX, cascadeDirY) || 1;
              cascadeDirX /= dirNorm;
              cascadeDirY /= dirNorm;
              const endX = segStartX + cascadeDirX * segment.length;
              const endY = segStartY + cascadeDirY * segment.length;
              ctx.beginPath();
              ctx.moveTo(segStartX, segStartY);
              ctx.lineTo(endX, endY);
              const cascadePower = (segment.power + arc.powerBoost * 0.4 + flareStrength * 0.3) * intensity;
              const cascadeAlpha = Math.min(0.98, 0.24 + cascadePower * 0.55);
              ctx.strokeStyle = hsl({ ...arcColor, l: arcColor.l + 32 + cascadePower * 6 }, cascadeAlpha);
              ctx.lineWidth = Math.max(0.2, lineWidth * 0.3 + segment.thickness * 0.2 + cascadePower * 0.18);
              ctx.shadowBlur = 36 + cascadePower * 36 + segIndex * 8;
              ctx.shadowColor = hsl({ ...arcColor, l: arcColor.l + 42 + cascadePower * 5 }, 0.98);
              ctx.stroke();
              ctx.shadowBlur = 0;
              segStartX = endX;
              segStartY = endY;
              lastEndX = endX;
              lastEndY = endY;
            });

            if (lastEndY < canvas.height) {
              const anchorY = Math.min(canvas.height + 80, lastEndY + (canvas.height - lastEndY) * 0.9);
              ctx.beginPath();
              ctx.moveTo(lastEndX, lastEndY);
              ctx.lineTo(lastEndX, anchorY);
              const anchorPower =
                0.5 + (arc.powerBoost + (arc.columnGlowStrength ?? 0) * 0.6 + flareStrength * 0.4);
              ctx.lineWidth = Math.max(0.18, lineWidth * 0.25 + anchorPower * 0.38);
              ctx.strokeStyle = hsl({ ...arcColor, l: arcColor.l + 44 }, Math.min(0.95, 0.28 + anchorPower * 0.35));
              ctx.shadowBlur = 50 + anchorPower * 40;
              ctx.shadowColor = hsl({ ...arcColor, l: arcColor.l + 54 }, 0.95);
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          });
        }

        if (arc.explosiveBursts && arc.explosiveBursts.length && flareStrength > 0.02) {
          arc.explosiveBursts.forEach((burst) => {
            if (!burst || burst.life <= 0) return;
            const burstBase = computePoint(Math.min(0.98, Math.max(0.02, burst.t)));
            const burstPower =
              Math.pow(burst.life / burst.maxLife, 0.55) * flareStrength * burst.intensity;
            if (burstPower <= 0.01) return;

            const sideX = perpX * burst.direction;
            const sideY = perpY * burst.direction;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineWidth = Math.max(0.6, lineWidth * 0.5 * burstPower + 0.2);
            ctx.shadowBlur = 32 * burstPower + 10;
            ctx.shadowColor = hsl({ ...arcColor, l: arcColor.l + 50 }, 0.95);
            ctx.strokeStyle = hsl({ ...arcColor, l: arcColor.l + 46 }, Math.min(0.95, 0.25 + burstPower * 0.7));

            for (let r = 0; r < burst.rays; r++) {
              const spread = burst.rays <= 1 ? 0 : (r / (burst.rays - 1) - 0.5);
              const wave = Math.sin(time * 16 + burst.seed + r * 0.7);
              let rayDirX = sideX * (1 + 0.25 * wave) + dirX * (0.25 + spread * 0.35);
              let rayDirY = sideY * (1 + 0.25 * wave) + dirY * (0.35 + spread * 0.25);
              const rayLenNorm = Math.hypot(rayDirX, rayDirY) || 1;
              rayDirX /= rayLenNorm;
              rayDirY /= rayLenNorm;
              const rayLength = burst.length * (0.45 + 0.55 * burstPower) * (0.8 + Math.abs(spread));
              ctx.beginPath();
              ctx.moveTo(burstBase.x, burstBase.y);
              ctx.lineTo(burstBase.x + rayDirX * rayLength, burstBase.y + rayDirY * rayLength);
              ctx.stroke();
            }

            ctx.restore();

            ctx.beginPath();
            ctx.arc(burstBase.x, burstBase.y, 2.2 + burstPower * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = hsl({ ...arcColor, l: arcColor.l + 52 }, Math.min(0.9, 0.35 + burstPower * 0.6));
            ctx.fill();
          });
        }

        const flashContribution = Math.max(
          0,
          flareStrength * 0.65 + totalPower * 0.15 + (arc.columnGlowStrength ?? 0) * 0.1,
        );
        if (flashContribution > 0.45 && flareStrength > 0.35) {
          const focusX = (start.x + end.x) * 0.5;
          const focusY = start.y * 0.6 + end.y * 0.4;
          frameFlashStrength = Math.max(frameFlashStrength, flashContribution);
          frameFlashX += focusX * flashContribution;
          frameFlashY += focusY * flashContribution;
          frameFlashWeight += flashContribution;
          if (flashContribution >= frameFlashStrength) {
            frameFlashColor = arc.color;
          }
        }
      });

      if (frameFlashWeight > 0) {
        flashState.intensity = flashState.intensity * 0.25 + frameFlashStrength * 0.75;
        flashState.x = frameFlashX / frameFlashWeight;
        flashState.y = frameFlashY / frameFlashWeight;
        flashState.color = frameFlashColor;
      } else {
        flashState.intensity *= 0.32;
      }

      if (flashState.intensity > 0.12) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const flashColor = flashState.color === 'gold' ? projectColors.gold : projectColors.primary;
        const radial = ctx.createRadialGradient(
          flashState.x,
          flashState.y,
          20,
          flashState.x,
          flashState.y,
          Math.max(canvas.width, canvas.height) * 0.95,
        );
        const coreAlpha = Math.min(0.85, 0.25 + flashState.intensity * 0.7);
        radial.addColorStop(0, hsl({ ...flashColor, l: flashColor.l + 60 }, coreAlpha));
        radial.addColorStop(0.35, hsl({ ...flashColor, l: flashColor.l + 50 }, coreAlpha * 0.6));
        radial.addColorStop(1, hsl({ ...flashColor, l: flashColor.l + 20 }, 0));
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = hsl({ ...flashColor, l: flashColor.l + 62 }, Math.min(0.75, flashState.intensity * 0.55));
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      const spawnChance = variant === 'mixed' ? 0.012 : variant === 'gold' ? 0.009 : 0.007;
      if (Math.random() < spawnChance) {
        spawnArc();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, spawnArc, variant]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-70"
      />
      
      {/* Ambient orb elements removed */}
    </>
  );
};

export default ParticleBackground;
