/**
 * ============================================================================
 * PREMIUM GSAP ANIMATIONS - PRZYKŁADY UŻYCIA W REACT
 * ============================================================================
 * 
 * Gotowe komponenty React wykorzystujące nowy system animacji GSAP.
 * Kopiuj i wklejaj do swoich komponentów!
 */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapConfig';
import { initAllAnimations } from '@/lib/gsapAnimations';

/**
 * ============================================================================
 * PRZYKŁAD 1: Hero Section z Ultra-Smooth Animations
 * ============================================================================
 */
export const PremiumHeroSection = () => {
  useEffect(() => {
    initAllAnimations();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Parallax */}
      <div 
        data-speed="0.5" 
        className="absolute inset-0 z-0"
      >
        <div data-parallax-container className="w-full h-full">
          <img 
            data-parallax-image
            data-clip-reveal
            src="/images/hero-pigeon.jpg"
            alt="Champion Pigeon"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 
          data-split-text
          className="text-7xl font-bold text-white mb-6"
        >
          Champion Pigeon Auctions
        </h1>
        
        <p 
          data-word-reveal
          className="text-2xl text-white/90 mb-12"
        >
          Najlepsze Gołębie Rasowe w Europie
        </p>
        
        <button 
          data-magnetic 
          data-magnetic-strength="0.3"
          className="px-12 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Przeglądaj Aukcje
        </button>
      </div>

      {/* Decorative Elements */}
      <div data-speed="1.5" className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      <div data-speed="0.8" className="absolute bottom-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
    </section>
  );
};

/**
 * ============================================================================
 * PRZYKŁAD 2: Feature Cards z Grid Staggering
 * ============================================================================
 */
export const PremiumFeatureGrid = () => {
  useEffect(() => {
    initAllAnimations();
  }, []);

  const features = [
    {
      title: "Aukcje Online",
      description: "System licytacji w czasie rzeczywistym",
      icon: "🎯"
    },
    {
      title: "Certyfikaty",
      description: "Pełna dokumentacja hodowlana",
      icon: "📜"
    },
    {
      title: "Transport",
      description: "Bezpieczna dostawa do całej Europy",
      icon: "🚚"
    },
    {
      title: "Wsparcie",
      description: "Zespół ekspertów 24/7",
      icon: "💬"
    },
    {
      title: "Galeria",
      description: "Profesjonalne zdjęcia HD",
      icon: "📸"
    },
    {
      title: "Gwarancja",
      description: "100% satysfakcji",
      icon: "✅"
    },
  ];

  return (
    <section data-fade-in className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 
          data-scale-scroll
          className="text-6xl font-bold text-center mb-20"
        >
          Nasze Usługi
        </h2>

        <div 
          data-reveal-container
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              data-reveal-item
              className="group bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl hover:from-gray-800 hover:to-gray-700 transition-all duration-500"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * ============================================================================
 * PRZYKŁAD 3: Gallery z Różnymi Reveal Effects
 * ============================================================================
 */
export const PremiumGallery = () => {
  useEffect(() => {
    initAllAnimations();
  }, []);

  const images = [
    { src: "/images/pigeon-1.jpg", reveal: "clip-reveal" },
    { src: "/images/pigeon-2.jpg", reveal: "slice-reveal" },
    { src: "/images/pigeon-3.jpg", reveal: "clip-reveal" },
    { src: "/images/pigeon-4.jpg", reveal: "slice-reveal" },
  ];

  return (
    <section data-fade-in className="py-32 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 
          data-word-reveal
          className="text-6xl font-bold text-center mb-20 text-white"
        >
          Galeria Championów
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-2xl">
              <img 
                data-clip-reveal={image.reveal === "clip-reveal" ? "" : undefined}
                data-slice-reveal={image.reveal === "slice-reveal" ? "" : undefined}
                src={image.src}
                alt={`Champion Pigeon ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * ============================================================================
 * PRZYKŁAD 4: Custom GSAP Timeline (Advanced)
 * ============================================================================
 */
export const AdvancedTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1.5,
      }
    });

    tl.fromTo('.timeline-title', 
      {
        scale: 0.8,
        opacity: 0,
        y: 100,
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
      }
    )
    .fromTo('.timeline-item',
      {
        x: -100,
        opacity: 0,
        skewX: -5,
      },
      {
        x: 0,
        opacity: 1,
        skewX: 0,
        duration: 0.8,
        stagger: {
          amount: 1.2,
          from: 'start',
          ease: 'power2.inOut'
        },
        ease: 'expo.out',
      },
      '-=0.5' // Overlap z poprzednią animacją
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="py-32 px-4">
      <h2 className="timeline-title text-6xl font-bold text-center mb-20">
        Nasza Historia
      </h2>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="timeline-item bg-gray-900 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">2020 - Początek</h3>
          <p className="text-gray-400">Pierwsza aukcja online</p>
        </div>
        <div className="timeline-item bg-gray-900 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">2021 - Rozwój</h3>
          <p className="text-gray-400">100+ hodowców na platformie</p>
        </div>
        <div className="timeline-item bg-gray-900 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">2023 - Ekspansja</h3>
          <p className="text-gray-400">Rozszerzenie na całą Europę</p>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * PRZYKŁAD 5: Magnetic CTA Section
 * ============================================================================
 */
export const MagneticCTASection = () => {
  useEffect(() => {
    initAllAnimations();
  }, []);

  return (
    <section data-fade-in className="py-32 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          data-word-reveal
          className="text-6xl font-bold mb-8 text-white"
        >
          Gotowy na Start?
        </h2>
        
        <p className="text-2xl text-white/90 mb-12">
          Dołącz do najlepszej platformy aukcyjnej dla hodowców gołębi
        </p>

        <div className="flex gap-6 justify-center flex-wrap">
          <button 
            data-magnetic 
            data-magnetic-strength="0.4"
            className="px-12 py-5 bg-white text-blue-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors shadow-2xl"
          >
            Rozpocznij Teraz
          </button>
          
          <button 
            data-magnetic 
            data-magnetic-strength="0.3"
            className="px-12 py-5 bg-transparent border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white/10 transition-colors"
          >
            Dowiedz Się Więcej
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * ============================================================================
 * PRZYKŁAD 6: Full Page z Wszystkimi Efektami
 * ============================================================================
 */
export const PremiumFullPage = () => {
  return (
    <>
      <PremiumHeroSection />
      <PremiumFeatureGrid />
      <PremiumGallery />
      <AdvancedTimeline />
      <MagneticCTASection />
    </>
  );
};

export default PremiumFullPage;
