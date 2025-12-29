/**
 * ParticleBackground - tło z animowanymi cząsteczkami
 * Zoptymalizowane dla 60 FPS z użyciem Canvas API
 * Paleta zgodna z kolorystyką projektu (gold/primary/navy)
 */
import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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

interface ParticleBackgroundProps {
  particleCount?: number;
  variant?: 'gold' | 'primary' | 'mixed';
}

export const ParticleBackground = ({
  particleCount = 80,
  variant = 'gold',
}: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

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
  }, [particleCount, variant]);

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

      particlesRef.current.forEach((particle) => {
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

      // Rysowanie połączeń między cząsteczkami zostało usunięte w celu optymalizacji wydajności.

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
  }, [initParticles, variant]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.7 }}
      />
      
      {/* Ambient orb elements removed */}
    </>
  );
};

export default ParticleBackground;
