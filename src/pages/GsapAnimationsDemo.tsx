import React from 'react';
import {
  GsapFadeInUp,
  GsapSlideInLeft,
  GsapSlideInRight,
  GsapScaleIn,
  GsapParallax,
  GsapStaggeredList,
  GsapTextReveal,
  GsapCountUp,
  GsapRotateIn,
  GsapBlurIn,
} from '../components/animations';

const GsapAnimationsDemo: React.FC = () => {
  const demoItems = [
    'Animacja 1',
    'Animacja 2',
    'Animacja 3',
    'Animacja 4',
    'Animacja 5',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-900 to-navy-dark text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold opacity-5 blur-3xl"></div>
        
        <GsapFadeInUp className="text-center z-10">
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-4 text-gold">
            GSAP Scroll Animations
          </h1>
          <p className="text-xl md:text-2xl text-gold-light mb-8">
            ScrollTrigger powered animations
          </p>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Scrolluj w dół, aby zobaczyć zaawansowane animacje GSAP w akcji
          </p>
        </GsapFadeInUp>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Section 1: Fade In Up */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Fade In Up
            </h2>
            <p className="text-lg text-gray-300">
              Elementy pojawiają się z fade i przesunięciem do góry
            </p>
          </GsapFadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <GsapFadeInUp
                key={item}
                delay={item * 0.1}
                className="bg-gold/10 border border-gold/30 rounded-xl p-8 hover:bg-gold/20 transition-colors"
              >
                <div className="aspect-video bg-gradient-gold rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold text-gold mb-2">Card {item}</h3>
                <p className="text-gray-300">
                  Profesjonalna animacja fade in z opóźnieniem
                </p>
              </GsapFadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Slide In */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Slide In Animations
            </h2>
            <p className="text-lg text-gray-300">
              Elementy wślizgują się z boku
            </p>
          </GsapFadeInUp>

          <div className="space-y-8">
            <GsapSlideInLeft className="bg-gold/10 border border-gold/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gold mb-2">Slide In Left</h3>
              <p className="text-gray-300">
                Element wślizga się z lewej strony ekranu
              </p>
            </GsapSlideInLeft>

            <GsapSlideInRight className="bg-gold/10 border border-gold/30 rounded-xl p-8 ml-auto md:w-2/3">
              <h3 className="text-2xl font-bold text-gold mb-2">Slide In Right</h3>
              <p className="text-gray-300">
                Element wślizga się z prawej strony ekranu
              </p>
            </GsapSlideInRight>
          </div>
        </div>
      </section>

      {/* Section 3: Scale In */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Scale In
            </h2>
            <p className="text-lg text-gray-300">
              Elementy pojawiają się ze skalowaniem
            </p>
          </GsapFadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <GsapScaleIn key={item} delay={item * 0.15}>
                <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl p-12 aspect-square flex items-center justify-center border border-gold/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gold mb-2">{item}</div>
                    <p className="text-gold-light">Scale Animation</p>
                  </div>
                </div>
              </GsapScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Parallax */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
        <GsapParallax speed={0.3} className="absolute inset-0 -z-10">
          <div className="w-full h-full bg-gradient-to-b from-gold/10 to-transparent"></div>
        </GsapParallax>

        <div className="max-w-4xl w-full relative z-10">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Parallax Effect
            </h2>
            <p className="text-lg text-gray-300">
              Tło porusza się wolniej niż reszta strony
            </p>
          </GsapFadeInUp>

          <div className="bg-navy-900/80 backdrop-blur border border-gold/30 rounded-xl p-12 text-center">
            <p className="text-xl text-gray-300">
              Efekt parallax jest generowany dynamicznie w tle. 
              Obserwuj jak tło porusza się w innym tempie niż zawartość!
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Staggered List */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Staggered List
            </h2>
            <p className="text-lg text-gray-300">
              Lista elementów animowana sekwencyjnie
            </p>
          </GsapFadeInUp>

          <GsapStaggeredList staggerDelay={0.15} className="space-y-4">
            {demoItems.map((item, index) => (
              <div
                key={index}
                data-stagger-item
                className="bg-gold/10 border border-gold/30 rounded-lg p-6 hover:bg-gold/20 transition-colors cursor-pointer"
              >
                <h3 className="text-lg font-bold text-gold">{item}</h3>
                <p className="text-gray-300 text-sm">
                  Element #{index + 1} - animowany sekwencyjnie
                </p>
              </div>
            ))}
          </GsapStaggeredList>
        </div>
      </section>

      {/* Section 6: Text Reveal */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Text Reveal
            </h2>
            <p className="text-lg text-gray-300">
              Każdy znak pojawia się sekwencyjnie
            </p>
          </GsapFadeInUp>

          <div className="text-center">
            <GsapTextReveal
              text="CHAMPION PIGEON AUCTIONS"
              className="text-4xl md:text-5xl font-display font-bold text-gold"
            />
          </div>
        </div>
      </section>

      {/* Section 7: Count Up */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Count Up Animation
            </h2>
            <p className="text-lg text-gray-300">
              Liczniki animowane przy przewijaniu
            </p>
          </GsapFadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GsapScaleIn className="text-center">
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-8">
                <GsapCountUp
                  end={1250}
                  duration={2}
                  suffix="+"
                  className="text-5xl font-bold text-gold"
                />
                <p className="text-gold-light mt-2">Aukcji</p>
              </div>
            </GsapScaleIn>

            <GsapScaleIn delay={0.1} className="text-center">
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-8">
                <GsapCountUp
                  end={4850}
                  duration={2}
                  suffix="+"
                  className="text-5xl font-bold text-gold"
                />
                <p className="text-gold-light mt-2">Uczestników</p>
              </div>
            </GsapScaleIn>

            <GsapScaleIn delay={0.2} className="text-center">
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-8">
                <GsapCountUp
                  end={98}
                  duration={2}
                  suffix="%"
                  className="text-5xl font-bold text-gold"
                />
                <p className="text-gold-light mt-2">Zadowolenia</p>
              </div>
            </GsapScaleIn>
          </div>
        </div>
      </section>

      {/* Section 8: Rotate In */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Rotate In
            </h2>
            <p className="text-lg text-gray-300">
              Elementy pojawiają się z rotacją
            </p>
          </GsapFadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GsapRotateIn angle={360} delay={0} className="flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-gold/30 to-gold/10 rounded-full border-4 border-gold/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-gold">Rotate 360°</span>
              </div>
            </GsapRotateIn>

            <GsapRotateIn angle={180} delay={0.2} className="flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-gold/30 to-gold/10 rounded-full border-4 border-gold/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-gold">Rotate 180°</span>
              </div>
            </GsapRotateIn>
          </div>
        </div>
      </section>

      {/* Section 9: Blur In */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full">
          <GsapFadeInUp className="text-center mb-12">
            <h2 className="text-5xl font-display font-bold text-gold mb-4">
              Blur In
            </h2>
            <p className="text-lg text-gray-300">
              Elementy pojawiają się z blur efektem
            </p>
          </GsapFadeInUp>

          <GsapBlurIn className="bg-gradient-to-r from-gold/20 to-gold/5 border border-gold/30 rounded-xl p-12 text-center">
            <h3 className="text-3xl font-bold text-gold mb-4">
              Blur In Effect
            </h3>
            <p className="text-lg text-gray-300">
              Element pojawia się z rozmyciem które stopniowo znika
            </p>
          </GsapBlurIn>
        </div>
      </section>

      {/* Final Section */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full text-center">
          <GsapFadeInUp>
            <h2 className="text-5xl font-display font-bold text-gold mb-8">
              Gotowy do użytku!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Wszystkie te animacje są zoptymalizowane i gotowe do użytku w Twoim projekcie
            </p>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-8">
              <pre className="text-left text-sm text-gray-300 overflow-x-auto">
                {`import { GsapFadeInUp } from '@/components/animations';

export const MyComponent = () => (
  <GsapFadeInUp>
    <h1>Hello World!</h1>
  </GsapFadeInUp>
);`}
              </pre>
            </div>
          </GsapFadeInUp>
        </div>
      </section>
    </div>
  );
};

export default GsapAnimationsDemo;
