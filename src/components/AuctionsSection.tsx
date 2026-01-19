import React, { useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryAuctionCard } from "@/components/auction/LuxuryAuctionCard";
import { useAuctions } from "@/hooks/useAuctions";
import { auctionService } from "@/services/auctionService";
import { motion } from 'framer-motion';
import { buttonMicro } from "@/components/motion";
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

const AuctionsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { auctions, loading } = useAuctions({ 
    status: 'active', 
    sortBy: 'newest', 
    limit: 3 
  });

  const getFirstImage = (images: string[]) => {
    return images && images.length > 0 ? images[0] : '/placeholder.svg';
  };

  useEffect(() => {
    if (!sectionRef.current || loading) return;

    const section = sectionRef.current;
    const header = headerRef.current;
    const cta = ctaRef.current;

    const ctx = gsap.context(() => {
      // Set initial states directly via GSAP
      gsap.set(section, { y: -150, opacity: 0 });
      if (header) gsap.set(header, { y: 50, opacity: 0 });
      if (cta) gsap.set(cta, { y: 50, opacity: 0 });

      // Section animation - starts when section enters viewport
      gsap.to(section, {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top 60%',
          scrub: 1.5,
          id: 'auctions-section-fall',
          invalidateOnRefresh: true,
        }
      });

      // Header animation
      if (header) {
        gsap.to(header, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1.5,
            invalidateOnRefresh: true,
          }
        });
      }

      // CTA animation
      if (cta) {
        gsap.to(cta, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cta,
            start: 'top bottom',
            end: 'top 80%',
            scrub: 1.5,
            invalidateOnRefresh: true,
          }
        });
      }

    }, section);

    return () => {
      ctx.revert();
    };
  }, [loading]);

  // Osobny efekt dla kart - uruchamia się gdy aukcje są załadowane
  useEffect(() => {
    if (loading || auctions.length === 0 || !cardsContainerRef.current || !sectionRef.current) return;

    // Daj chwilę na render kart
    const timer = setTimeout(() => {
      const cards = cardsContainerRef.current?.querySelectorAll('.auction-card');
      if (!cards || cards.length < 3) {
        return;
      }

      const ctx = gsap.context(() => {
        // Set initial states BEFORE creating animations
        gsap.set(cards[1], { scale: 0.3, opacity: 0 });
        gsap.set(cards[0], { x: -200, opacity: 0, rotateY: 45 });
        gsap.set(cards[2], { x: 200, opacity: 0, rotateY: -45 });

        // Middle card (index 1) - from depth
        gsap.to(cards[1], 
          {
            scale: 1,
            opacity: 1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'top 30%',
              scrub: 1.5,
              invalidateOnRefresh: true,
            }
          }
        );

        // Left card (index 0) - from left with rotation
        gsap.to(cards[0],
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'top 20%',
              scrub: 1.5,
              invalidateOnRefresh: true,
            }
          }
        );

        // Right card (index 2) - from right with rotation
        gsap.to(cards[2],
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'top 20%',
              scrub: 1.5,
              invalidateOnRefresh: true,
            }
          }
        );

      }, cardsContainerRef.current);

      setTimeout(() => ScrollTrigger.refresh(), 100);

      return () => ctx.revert();
    }, 300);

    return () => clearTimeout(timer);
  }, [loading, auctions]);

  return (
    <section
      ref={sectionRef}
      id="auctions"
      className="pt-0 pb-24 section-surface-alt relative overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-4">
              Aukcje Na Żywo
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-gold font-bold leading-tight">
              Zdobądź
              <span className="text-white"> Elitarne Ptaki</span>
            </h2>
          </div>
          <motion.div
            variants={buttonMicro}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Link to="/auctions">
              <Button variant="outline" className="mt-6 md:mt-0 group border-gold/50 hover:bg-gold hover:text-navy">
                Zobacz Wszystkie Aukcje
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Auction Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={`auction-skeleton-${i}`} className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] h-96 animate-pulse" />
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div 
            ref={cardsContainerRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {auctions.slice(0, 3).map((auction, index) => (
              <div 
                key={auction.id || `auction-${index}`} 
                className="auction-card"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <LuxuryAuctionCard
                  id={auction.id}
                  title={auction.title}
                  image={getFirstImage(auction.images)}
                  currentBid={auction.currentPrice}
                  timeLeft={auctionService.calculateTimeLeft(auction.endTime)}
                  ringNumber={auction.pigeon?.ringNumber || 'Brak numeru'}
                  featured={index === 1}
                  watchCount={auction._count?.watchlist}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Obecnie brak aktywnych aukcji</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div ref={ctaRef} className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Gotowy na zdobycie swojego mistrza?
          </p>
          <motion.div
            variants={buttonMicro}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Link to="/auctions">
              <Button variant="gold" size="lg" className="whitespace-nowrap">
                Zobacz Wszystkie Aukcje
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AuctionsSection);
