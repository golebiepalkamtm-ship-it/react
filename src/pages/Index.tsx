/**
 * ============================================================================
 * INDEX PAGE - Unified Premium Homepage
 * ============================================================================
 * 
 * Integracja:
 * 1. Premium animacji (Awwwards level) z HomePage.tsx
 * 2. Logiki biznesowej (Auth, Modals, Debug) z Index.tsx
 * 
 * Features:
 * - Luxury smooth scroll (Lenis + GSAP)
 * - Video backgrounds
 * - Multi-layer parallax
 * - Magnetic interactions
 * - Auth flow handling
 */

import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { registerCustomEasings, gsapEasings } from '@/lib/customEasings';
import { ArrowRight, Trophy, Zap, Award, ChevronDown, Star } from 'lucide-react';
import { useSpringPhysics, customExpoEase, customBezier, splitTextToChars, splitTextToWords } from '@/hooks/useCustomPhysics';
import Header from '@/components/Header';
import { Carousel3D } from '@/components/gallery/Carousel3D';
import AboutSection from '@/components/AboutSection';
import PressSection from '@/components/PressSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  DepthLayer,
  FloatingElement,
  MagneticElement,
  CursorFollower,
  PremiumTextReveal,
  CountUp,
  GradientText,
  SeamlessSection,
  RevealOnScroll,
  ProgressIndicator,
} from '@/components/animations';

registerCustomEasings();

const HeroPremium = memo(() => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* 
   * VIDEO ENCODING FOR SCRUBBING:
   * To ensure smooth seeking, the video must be encoded with a high density of keyframes (GOP size).
   * FFmpeg command: 
   * ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -g 1 -keyint_min 1 -an output_scrub.mp4
   * "-g 1" ensures every frame is a keyframe (Intra-frame only), allowing instant seeking without decoding artifacts.
   */

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use a loadedmetadata handler to properly set up the ScrollTrigger duration/start
    const handleLoadedMetadata = () => {
      let progress = 0;
      let lastRenderedTime = -1;

      // 1. ScrollTrigger updates progress ONLY (very light)
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.0,
        onUpdate: (self) => {
          progress = self.progress;
        }
      });

      // 2. GSAP Ticker handles the actual render (decoupled from scroll frequency)
      const render = () => {
        if (!video.duration) return;

        const targetTime = video.duration * progress;

        // Threshold + Throttling
        if (Math.abs(targetTime - lastRenderedTime) > 0.033) { // ~30fps target for seek
          lastRenderedTime = targetTime;

          if ('fastSeek' in video) {
            (video as any).fastSeek(targetTime);
          } else {
            video.currentTime = targetTime;
          }
        }
      };

      gsap.ticker.add(render);
      return render;
    };

    let tickerRef: any = null;
    video.addEventListener('loadedmetadata', () => {
      tickerRef = handleLoadedMetadata();
    });

    // Trigger handler immediately if metadata already loaded
    if (video.readyState >= 1) tickerRef = handleLoadedMetadata();

    return () => {
      if (tickerRef) gsap.ticker.remove(tickerRef);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    // Premium Text Reveal Animation
    const content = contentRef.current;
    if (!content) return;

    // Dynamically import MotionSystem to ensure architecture is used
    import('@/lib/MotionSystem').then(({ PhysicsUtils, AnimationController }) => {
      // Ensure the controller is running
      const controller = AnimationController.getInstance();

      // Manual Split Text Implementation
      const splitTargets = content.querySelectorAll('[data-split-text]');
      splitTargets.forEach(target => {
        if (!target.textContent) return;
        const chars = splitTextToChars(target.textContent);
        target.innerHTML = chars.map(char =>
          `<span class="char" style="display:inline-block; will-change:transform;">${char}</span>`
        ).join('');
      });

      const titleChars = content.querySelectorAll('[data-split-text] .char');
      const stats = content.querySelectorAll('.hero-stat-item');

      const tl = gsap.timeline({
        delay: 0.5,
        defaults: { ease: PhysicsUtils.premiumEase } // Use the architectural ease
      });

      // 1. Staggered Character Reveal (translate3d/scale for optimization)
      if (titleChars.length > 0) {
        gsap.set(titleChars, { opacity: 0, scale: 0.8, y: 100, rotateX: -90 });
        tl.to(titleChars, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.02,
          duration: 1.4,
          force3D: true // Ensure GPU acceleration
        });
      }

      // 2. Stats Reveal
      if (stats.length > 0) {
        gsap.set(stats, { opacity: 0, y: 30, scale: 0.95 });
        tl.to(stats, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          force3D: true,
          ease: 'power3.out'
        }, "-=0.8");
      }
    });
  }, []);

  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;

    const content = contentRef.current;
    const badge = content.querySelector('.inline-flex'); // Badge
    const paragraph = content.querySelector('p');
    const button = content.querySelector('a');


    const ctx = gsap.context(() => {
      // Timeline dla elementów hero (po h1 i statsach)
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
      });

      // Badge
      if (badge) {
        gsap.set(badge, { opacity: 0, y: 30 });
        tl.to(badge, { opacity: 1, y: 0, duration: 1 }, 0.3);
      }

      // Paragraph (po h1 split-text animation)
      if (paragraph) {
        gsap.set(paragraph, { opacity: 0, y: 40 });
        tl.to(paragraph, { opacity: 1, y: 0, duration: 1.2 }, 1.5);
      }

      // Button
      if (button) {
        gsap.set(button, { opacity: 0, y: 30, scale: 0.95 });
        tl.to(button, { opacity: 1, y: 0, scale: 1, duration: 1 }, 1.8);
      }

    }, content);

    // Parallax on scroll with Custom Bezier
    const parallaxTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4, // Smoother follow
      },
    });

    parallaxTl.to(content, {
      y: 200,
      opacity: 0,
      ease: (t) => customBezier(t, 0.76, 0, 0.24, 1),
    }, 0);

    return () => {
      ctx.revert();
      parallaxTl.kill();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-section="hero"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
          muted
          playsInline
          preload="auto"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-lightbulb-hanging-in-the-dark-turning-on-and-off-repeatedly-30928-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>
      <div
        ref={contentRef}
        className="relative z-10 max-w-6xl mx-auto px-4 text-left"
      >
        <MagneticElement strength={0.1} className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium backdrop-blur-sm">
            <Star className="w-4 h-4 fill-gold" />
            <span>Hodowla Gołębi Pocztowych od 1979</span>
          </span>
        </MagneticElement>

        <h1
          data-split-text
          className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white mb-6"
        >
          Pałka MTM - Geny Zwycięzców
        </h1>

        <p
          className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 leading-relaxed"
        >
          Wyniki budowane przez pokolenia. Topowe gołębie pocztowe z Dolnego Śląska.
        </p>

        <div className="flex flex-col sm:flex-row items-start justify-start gap-4 mb-20">
          <Link
            to="/champions"
            data-magnetic
            data-magnetic-strength="0.3"
            className="group flex items-center gap-3 px-8 py-4 bg-gold text-navy rounded-full font-semibold text-lg hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
            style={{ willChange: 'transform' }}
          >
            <span>Zobacz Championy</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto hero-stats"
        >
          {[
            { icon: Trophy, value: 150, suffix: '+', label: 'Mistrzostw' },
            { icon: Award, value: 45, suffix: '+', label: 'Lat Doświadczenia' },
            { icon: Zap, value: 3, suffix: '', label: 'Pokolenia Hodowców' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="hero-stat-item"
            >
              <MagneticElement strength={0.08}>
                <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-gold/30 transition-colors">
                  <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      delay={0.5 + i * 0.2}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              </MagneticElement>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <FloatingElement amplitude={8} frequency={0.5}>
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs uppercase tracking-widest">Przewiń</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </FloatingElement>
      </div>
    </section>
  );
});

interface FeatureData {
  icon: React.ElementType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCardPremium = memo(({
  feature,
  index
}: {
  feature: FeatureData;
  index: number
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);

    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;

    gsap.to(glowRef.current, {
      '--glow-x': `${glowX}%`,
      '--glow-y': `${glowY}%`,
      duration: 0.5,
      ease: 'expo.out',
    });
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <MagneticElement strength={0.05}>
      <motion.div
        ref={cardRef}
        className="group h-full"
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="h-full flex flex-col p-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 shadow-[0_0_30px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-lg relative overflow-hidden"
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformStyle: 'preserve-3d',
            '--glow-x': '50%',
            '--glow-y': '50%',
            minHeight: '260px',
          } as React.CSSProperties}
          whileHover={{ translateY: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div
            ref={glowRef}
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(212,175,55,0.15) 0%, transparent 50%)',
            }}
          />

          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: '0 0 30px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          />

          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[150%] h-24 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 60%)' }}
          />

          <DepthLayer depth={index} className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors duration-500">
              <feature.icon className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-lg font-semibold font-display text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {feature.description}
            </p>
          </DepthLayer>
        </motion.div>
      </motion.div>
    </MagneticElement>
  );
});

FeatureCardPremium.displayName = 'FeatureCardPremium';

const FeaturesSectionPremium = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const features: FeatureData[] = [
    {
      icon: Trophy,
      title: 'Elitarne Rodowody',
      description: 'Każdy gołąb pochodzi z linii wielokrotnych mistrzów i championów.',
    },
    {
      icon: Zap,
      title: 'Prędkość & Wytrzymałość',
      description: 'Rekordy prędkości i dystansu potwierdzone w najważniejszych zawodach.',
    },
    {
      icon: Award,
      title: 'Gwarancja Jakości',
      description: 'Pełna dokumentacja, badania DNA i historia lotów każdego ptaka.',
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const header = section.querySelector('.features-header');
    const cards = section.querySelectorAll('.feature-card-item');

    const ctx = gsap.context(() => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
        }
      });

      if (header) {
        headerTl.fromTo(header,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }
        );
      }

      // Cards animation with stagger
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 80, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'expo.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: cards[0],
              start: 'top 85%',
              end: 'top 35%',
              scrub: 1.5,
            }
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <SeamlessSection
      className="py-24 px-4 relative overflow-hidden"
      transitionIn="fade"
      data-section="features"
    >
      <div ref={sectionRef} className="max-w-6xl mx-auto">
        <div className="features-header mb-16">
          <span className="inline-block px-4 py-1 border border-gold/30 rounded-full text-xs tracking-[0.2em] text-gold/70 uppercase mb-4">
            Dlaczego my
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-gold">
            Najwyższa Jakość Hodowli
          </h2>
          <p className="text-white/70 max-w-xl leading-relaxed">
            Od ponad 50 lat dostarczamy championów hodowcom na całym świecie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card-item">
              <FeatureCardPremium feature={feature} index={index} />
            </div>
          ))}
        </div>
      </div>
    </SeamlessSection>
  );
};

const CTASectionPremium = () => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctaRef.current) return;

    const section = ctaRef.current;
    const heading = section.querySelector('h2');
    const paragraph = section.querySelector('p');
    const button = section.querySelector('a');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
        }
      });

      if (heading) tl.fromTo(heading,
        { y: 80, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'expo.out' }
      );

      if (paragraph) tl.fromTo(paragraph,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
        '-=0.2'
      );

      if (button) tl.fromTo(button,
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'expo.out' },
        '-=0.15'
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <SeamlessSection className="py-24 px-4" transitionIn="fade" data-section="cta">
      <div ref={ctaRef} className="max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-bold font-display text-gold mb-6"
        >
          Gotowy na swojego Championa?
        </h2>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Przeglądaj naszą ekskluzywną kolekcję i znajdź idealnego gołębia
          dla swojej hodowli.
        </p>

        <Link
          to="/champions"
          data-magnetic
          data-magnetic-strength="0.4"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          <span>Eksploruj Galerię</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </SeamlessSection>
  );
};

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);


  const cursorSpring = useSpringPhysics({ stiffness: 0.15, damping: 0.25 });
  const followerSpring = useSpringPhysics({ stiffness: 0.08, damping: 0.3 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorSpring.setTarget(e.clientX, e.clientY);
      followerSpring.setTarget(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animateCursor = () => {
      const cursorPos = cursorSpring.update();
      const followerPos = followerSpring.update();

      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: cursorPos.x,
          y: cursorPos.y,
          xPercent: -50,
          yPercent: -50
        });
      }

      if (followerRef.current) {
        gsap.set(followerRef.current, {
          x: followerPos.x,
          y: followerPos.y,
          xPercent: -50,
          yPercent: -50
        });
      }

      requestAnimationFrame(animateCursor);
    };

    animateCursor();
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorSpring, followerSpring]);

  useEffect(() => {
    document.body.classList.add('home-page');
    ScrollTrigger.refresh();

    return () => {
      document.body.classList.remove('home-page');
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section], section'));
    if (sections.length > 1) {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const snapPoints = sections.map((sec) => {
        const top = sec.getBoundingClientRect().top + window.scrollY;
        const progress = top / (docHeight - window.innerHeight);
        return Math.min(1, Math.max(0, progress));
      });
      const st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.2, max: 0.8 },
          delay: 0.05,
          ease: 'power1.inOut',
        },
      });
      return () => st.kill();
    }
  }, []);

  // Debug hotkeys logic preserved from original Index.tsx
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === 'd' && e.ctrlKey && e.shiftKey) {
        const scrollY = window.scrollY;
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
        const nearest = sections.reduce<HTMLElement | null>((acc, sec) => {
          const top = sec.getBoundingClientRect().top + window.scrollY;
          const dist = Math.abs(scrollY - top);
          if (!acc) return sec;
          const accTop = acc.getBoundingClientRect().top + window.scrollY;
          return dist < Math.abs(scrollY - accTop) ? sec : acc;
        }, null);
      }

      if (e.key && e.key.toLowerCase() === 'g' && e.ctrlKey && e.shiftKey) {
        console.clear();
        import('@/debug/gsap-diagnostic').then(module => {
          module.runGSAPDiagnostic();
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auth message logic preserved from original Index.tsx

  // Auth message logic preserved from original Index.tsx
  useEffect(() => {
    if (!loading && user && profile) {
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
      if (!hasShownWelcome) {
        const timer = setTimeout(() => {
          setShowAuthMessage(true);
          sessionStorage.setItem('hasShownWelcome', 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, profile]);

  const getAuthMessage = () => {
    if (!user || !profile) return null;
    switch (profile.role) {
      case 'USER_REGISTERED':
        return {
          type: 'warning' as const,
          title: 'Wymagana weryfikacja',
          text: 'Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę odbiorczą, aby uzyskać pełny dostęp.',
          action: () => window.location.reload(),
          actionText: 'Odśwież'
        };
      case 'USER_EMAIL_VERIFIED':
        return {
          type: 'info' as const,
          title: 'Witaj w Pałka MTM!',
          text: `Jesteś zalogowany jako ${profile.email || user.email}. Uzupełnij profil i zweryfikuj telefon, aby licytować.`,
        };
      case 'USER_FULL_VERIFIED':
      case 'ADMIN':
        return {
          type: 'success' as const,
          title: 'Witaj w Pałka MTM!',
          text: `Cieszymy się, że jesteś z nami, ${profile.first_name || profile.name || user.email}! Życzymy udanych licytacji.`,
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reveals = document.querySelectorAll('[data-reveal]');
      reveals.forEach((el) => {
        const type = el.getAttribute('data-reveal');

        // COMMON CONFIG: Soft Rise & Blur (Premium Feel)
        const softBase = {
          opacity: 0,
          y: 30, // Subtle movement
          filter: 'blur(10px)', // Cinematic blur
          scale: 0.98,
        };

        const visibleBase = {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1.4,
          ease: 'power3.out', // Smooth deceleration
        };

        switch (type) {
          case 'slide-up':
          case 'stagger':
            gsap.fromTo(el, softBase, {
              ...visibleBase,
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            });
            break;
          case 'scale':
            gsap.fromTo(el,
              { ...softBase, scale: 0.95 },
              {
                ...visibleBase,
                duration: 1.6,
                scrollTrigger: {
                  trigger: el,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse'
                }
              }
            );
            break;
          case 'clip':
            gsap.fromTo(el,
              { clipPath: 'inset(10% 0 5% 0)', opacity: 0, filter: 'blur(5px)' },
              {
                clipPath: 'inset(0% 0 0% 0)',
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 80%',
                  toggleActions: 'play none none reverse'
                }
              }
            );
            break;
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const authMessage = getAuthMessage();

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      <Header />

      <ProgressIndicator />


      <div
        ref={cursorRef}
        className="custom-cursor-main"
      />
      <div
        ref={followerRef}
        className="cursor-follower-main"
      />



      <div className="fixed inset-0 -z-10 pointer-events-none">
      </div>

      {authMessage && (
        <UnifiedModal
          isOpen={showAuthMessage}
          onClose={() => setShowAuthMessage(false)}
          type={authMessage.type}
          title={authMessage.title}
          message={authMessage.text}
          confirmButton={authMessage.action ? {
            text: authMessage.actionText,
            onClick: authMessage.action
          } : {
            text: 'OK',
            onClick: () => setShowAuthMessage(false)
          }}
        />
      )}

      {/* Increased spacing to prevent overlapping (space-y-48) */}
      <div className="relative z-10 space-y-48">
        <HeroPremium />

        <div data-reveal="slide-up">
          <AboutSection />
        </div>

        <div id="champions" data-reveal="scale" data-section="champions">
          <Carousel3D />
        </div>

        <SeamlessSection pin scrub={1} transitionIn="fade">
          <FeaturesSectionPremium />
        </SeamlessSection>

        <div data-reveal="slide-up">
          <PressSection />
        </div>

        <div data-reveal="scale">
          <CTASectionPremium />
        </div>

        <div data-reveal="clip">
          <ContactSection />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
