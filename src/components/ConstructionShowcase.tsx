/**
 * CONSTRUCTION SHOWCASE
 * 
 * Demonstrates Awwwards-level "construction on scroll" effects
 * Elements BUILD as you scroll - not just fade in
 */

import React, { useRef } from 'react';
import { gsap } from '@/lib/gsapConfig';
import { 
  useSVGDrawing, 
  useClipPathReveal, 
  useImageConstruction,
  useStaggerConstruction 
} from '@/hooks/useScrollConstruction';

export const ConstructionShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);

  // SVG line drawing effect
  useSVGDrawing(svgRef, {
    trigger: sectionRef as React.RefObject<HTMLElement | null>,
    scrub: 1.5,
    start: 'top 70%',
    end: 'top 30%',
  });

  // Image construction with clip-path + scale
  useImageConstruction(imageRef, {
    trigger: sectionRef as React.RefObject<HTMLElement | null>,
    scrub: 1.2,
    start: 'top 60%',
    end: 'top 20%',
  });

  // Stagger construction for cards
  useStaggerConstruction(cardsContainerRef as React.RefObject<HTMLElement | null>, {
    trigger: sectionRef as React.RefObject<HTMLElement | null>,
    selector: '.construction-card',
    stagger: 0.12,
    scrub: 1,
    start: 'top 75%',
    end: 'top 25%',
  });

  // Clip-path reveal for text block
  useClipPathReveal(textBlockRef as React.RefObject<HTMLElement | null>, {
    trigger: sectionRef as React.RefObject<HTMLElement | null>,
    direction: 'vertical',
    scrub: 1,
    start: 'top 80%',
    end: 'top 40%',
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-32 px-4 overflow-hidden"
      style={{
        perspective: '2000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Construction on Scroll
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
            Elements <span className="text-gold">Build</span> as You Scroll
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Awwwards-level progressive reveal - synchronized to scroll position
          </p>
        </div>

        {/* SVG Drawing Demo */}
        <div className="mb-32">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">SVG Line Drawing</h3>
          <div className="flex justify-center">
            <svg
              ref={svgRef}
              width="600"
              height="300"
              viewBox="0 0 600 300"
              className="max-w-full"
            >
              {/* Trophy outline */}
              <path
                d="M 150 50 L 150 100 L 120 120 L 120 180 L 180 180 L 180 120 L 150 100 Z"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 130 50 L 170 50"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 140 180 L 140 200 L 160 200 L 160 180"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Decorative lines */}
              <line x1="250" y1="80" x2="550" y2="80" stroke="url(#goldGradient)" strokeWidth="2" />
              <line x1="250" y1="120" x2="500" y2="120" stroke="url(#goldGradient)" strokeWidth="2" />
              <line x1="250" y1="160" x2="520" y2="160" stroke="url(#goldGradient)" strokeWidth="2" />
              
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
                  <stop offset="100%" stopColor="#F4D03F" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Image Construction Demo */}
        <div className="mb-32">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Image Construction</h3>
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border border-gold/30">
              <img
                ref={imageRef}
                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop"
                alt="Construction demo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Stagger Construction Demo */}
        <div className="mb-32">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Stagger Construction</h3>
          <div
            ref={cardsContainerRef}
            className="grid md:grid-cols-3 gap-8"
            style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="construction-card p-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 backdrop-blur-lg"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <span className="text-gold text-2xl font-bold">{i}</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Card {i}
                </h4>
                <p className="text-white/70 text-sm">
                  Each card builds in sequence as scroll progresses
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Clip-Path Reveal Demo */}
        <div className="mb-32">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Clip-Path Reveal</h3>
          <div
            ref={textBlockRef}
            className="max-w-3xl mx-auto p-12 rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 backdrop-blur-lg"
          >
            <h4 className="text-2xl font-bold text-gold mb-4">Progressive Reveal</h4>
            <p className="text-white/80 text-lg leading-relaxed mb-4">
              This entire block reveals via clip-path animation, creating a smooth
              "building" effect synchronized to your scroll position.
            </p>
            <p className="text-white/70">
              The clip-path changes from inset(100% 0% 0% 0%) to inset(0% 0% 0% 0%),
              creating a vertical wipe effect that feels like the content is being
              constructed in real-time.
            </p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="max-w-4xl mx-auto p-8 rounded-2xl border border-gold/20 bg-zinc-900/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-gold mb-4">Technical Implementation</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gold mt-2" />
              <span><strong className="text-white">SVG Drawing:</strong> stroke-dashoffset animation synchronized to scroll</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gold mt-2" />
              <span><strong className="text-white">Image Construction:</strong> Combined scale + clip-path for dramatic reveal</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gold mt-2" />
              <span><strong className="text-white">Stagger:</strong> Sequential element construction with 3D transforms</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gold mt-2" />
              <span><strong className="text-white">Clip-Path:</strong> Progressive mask removal creates "building" illusion</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gold mt-2" />
              <span><strong className="text-white">Scrub:</strong> All animations use scrub: true for scroll-driven progress</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ConstructionShowcase;
