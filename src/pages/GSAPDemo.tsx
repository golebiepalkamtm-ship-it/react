/**
 * GSAP PREMIUM ANIMATIONS - DEMO PAGE
 * Strona demonstracyjna pokazująca wszystkie nowe efekty
 */

import { useEffect } from 'react';
import { initAllAnimations } from '@/lib/gsapAnimations';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GSAPDemo() {
  useEffect(() => {
    // Inicjalizacja wszystkich animacji
    initAllAnimations();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          to="/"
          data-magnetic
          data-magnetic-strength="0.3"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót</span>
        </Link>
      </div>

      {/* Hero with Split Text */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div data-parallax-container className="w-full h-full">
            <img 
              data-parallax-image
              src="https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1920&q=80"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 
            data-split-text
            className="text-7xl font-bold mb-6"
          >
            Premium GSAP
          </h1>
          
          <p 
            data-word-reveal
            className="text-2xl text-white/80 mb-12"
          >
            Ultra-smooth animations na poziomie Awwwards
          </p>
          
          <button
            data-magnetic
            data-magnetic-strength="0.4"
            className="px-12 py-4 bg-white text-black rounded-full text-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Scroll Down
          </button>
        </div>

        <div data-speed="1.5" className="absolute bottom-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        <div data-speed="0.8" className="absolute top-20 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      </section>

      {/* Section Fade In */}
      <section data-fade-in className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl">
          <h2 
            data-scale-scroll
            className="text-6xl font-bold mb-12 text-center"
          >
            Scroll-Linked Scale
          </h2>
          <p className="text-xl text-center text-white/70 max-w-2xl mx-auto">
            Ten nagłówek skaluje się podczas scrollowania dzięki `data-scale-scroll`
          </p>
        </div>
      </section>

      {/* Batch Card Reveal */}
      <section data-fade-in className="py-32 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 
            data-word-reveal
            className="text-5xl font-bold text-center mb-20"
          >
            Grid Staggering + Clip-Path Reveal
          </h2>

          <div data-reveal-container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                data-reveal-item
                className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl"
              >
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-3">Feature {i}</h3>
                <p className="text-gray-400">
                  Karta z efektem clip-path, skewY i blur podczas reveal.
                  Zwróć uwagę na grid-based staggering!
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clip Reveal Images */}
      <section data-fade-in className="py-32 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 
            data-word-reveal
            className="text-5xl font-bold text-center mb-20"
          >
            Cinematic Image Reveals
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="aspect-square overflow-hidden rounded-2xl">
              <img 
                data-clip-reveal
                src="https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?w=800&q=80"
                alt="Clip Reveal"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-2xl">
              <img 
                data-slice-reveal
                src="https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800&q=80"
                alt="Slice Reveal"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Clip Reveal</h3>
              <p className="text-gray-400">Odkrywa się od środka + scale + brightness</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Slice Reveal</h3>
              <p className="text-gray-400">Efekt żaluzji + skewX + grayscale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depth Parallax */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div data-speed="0.3" className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500" />
        </div>
        
        <div data-speed="0.6" className="absolute top-20 left-20 w-64 h-64 bg-yellow-500/30 rounded-full blur-3xl" />
        <div data-speed="1.2" className="absolute bottom-20 right-20 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl" />
        <div data-speed="1.5" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/30 rounded-full blur-2xl" />

        <div className="relative z-10 text-center px-4">
          <h2 
            data-word-reveal
            className="text-6xl font-bold mb-6"
          >
            Multi-Layer Parallax
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Każdy element ma inną prędkość (data-speed). <br />
            Tło: 0.3, Środek: 0.6-1.2, Pierwszy plan: 1.5
          </p>
        </div>
      </section>

      {/* Magnetic Buttons */}
      <section data-fade-in className="py-32 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            data-word-reveal
            className="text-6xl font-bold mb-12"
          >
            Magnetic Hover Effects
          </h2>
          
          <p className="text-2xl mb-16 text-white/90">
            Najedź myszką na buttony - zauważ jak "podążają" za kursorem
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            <button 
              data-magnetic 
              data-magnetic-strength="0.5"
              className="px-12 py-5 bg-white text-blue-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors shadow-2xl"
            >
              Strength: 0.5
            </button>
            
            <button 
              data-magnetic 
              data-magnetic-strength="0.3"
              className="px-12 py-5 bg-transparent border-2 border-white text-white rounded-full text-lg font-bold hover:bg-white/10 transition-colors"
            >
              Strength: 0.3
            </button>

            <button 
              data-magnetic 
              data-magnetic-strength="0.1"
              className="px-12 py-5 bg-black text-white rounded-full text-lg font-bold hover:bg-gray-900 transition-colors"
            >
              Strength: 0.1
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section data-fade-in className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center px-4">
          <h2 
            data-split-text
            className="text-7xl font-bold mb-8"
          >
            Gotowe! 🚀
          </h2>
          
          <p 
            data-word-reveal
            className="text-2xl text-white/70 mb-12"
          >
            Wszystkie animacje działają z expo.out easing i scrub 1.5-2
          </p>

          <Link
            to="/"
            data-magnetic
            data-magnetic-strength="0.4"
            className="inline-flex items-center gap-2 px-12 py-5 bg-white text-black rounded-full text-lg font-bold hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Powrót na Stronę Główną</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
