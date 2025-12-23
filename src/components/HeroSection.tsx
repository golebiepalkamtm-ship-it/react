import { useEffect, useRef } from 'react';
const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Try to play programmatically (some browsers require a user gesture otherwise)
    const p = v.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        // ignore play rejection (autoplay blocked) — video still available with controls if needed
      });
    }
  }, []);
  // WebGPU is initialized globally in main.tsx
  return (
    <section id="home" className="relative h-[120vh] flex items-end justify-center overflow-hidden" style={{backgroundImage: 'url(/hero-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      {/* Video Background positioned to bottom so pigeon stands at the very bottom of the section */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute left-1/2 bottom-0 h-[60vh] w-auto -translate-x-1/2 object-cover opacity-90"
        >
          <source src="/pigeon-tlo-Picsart-BackgroundRemover.mp4" type="video/mp4" />
        </video>

        {/* Animated particles overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-navy/20 to-navy/70" />
        {/* Main overlay (keep gradient) */}
        <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/20 to-navy/50" />
      </div>

      {/* Text above the pigeon (positioned above the video head) */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 text-center bottom-[calc(60vh+2rem)] w-full">
        {/* Entrance effects moved to global canvas; year lettering removed per request */}

        <h2 className="hero-title relative text-3xl md:text-5xl lg:text-6xl">
          PAŁKA MTM
        </h2>
        <p className="hero-subtitle mt-2 text-lg md:text-2xl tracking-wide">
          MISTRZOWIE SPRINTU
        </p>
      </div>
    </section>
  );
};
export default HeroSection;