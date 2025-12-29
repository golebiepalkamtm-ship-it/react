import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const attemptVideoPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === 'function') p.catch(() => {});
  }, []);

  useEffect(() => {
    attemptVideoPlay();
  }, [attemptVideoPlay]);

  return (
    <section id="home" className="relative h-[85vh] md:h-[90vh] lg:h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Video w środku */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="max-w-4xl max-h-[600px] object-contain"
        src="/pigeon-tlo-Picsart-BackgroundRemover.mp4"
      />

      {/* Text content */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 top-1 w-full">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl text-foreground font-bold leading-tight mb-2">PAŁKA <span className="text-gradient-gold">MTM</span></h1>
          <p className="text-lg text-muted-foreground">Mistrzowie sprintu</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button className="bg-gold text-navy">Przejdź do aukcji</Button>
            <Button variant="outline" className="border-gold/40">Poznaj hodowlę</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
