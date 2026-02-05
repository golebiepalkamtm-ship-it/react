import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedAuctionCard } from "@/components/auction/UnifiedAuctionCard";
import { useAuctions } from "@/hooks/useAuctions";
import { motion } from "framer-motion";
import { buttonMicro } from "@/components/motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { resolveAuctionImage } from "@/utils/image";

const AuctionsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => Date.now());

  const { auctions, isLoading } = useAuctions({ 
    status: 'active', 
    sortBy: 'newest'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || isLoading) return;

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
  }, [isLoading]);

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
            <h2 className="font-display text-2xl md:text-3xl text-gold font-bold leading-tight">
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
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={`auction-skeleton-${i}`} className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] h-96 animate-pulse" />
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div ref={cardsContainerRef} className="grid gap-8 items-stretch md:grid-cols-2 lg:grid-cols-3">
            {auctions.slice(0, 3).map((auction, index) => (
              <UnifiedAuctionCard
                key={auction.id || `auction-${index}`}
                id={auction.id}
                title={auction.title}
                image={resolveAuctionImage(auction.images?.[0])}
                currentBid={auction.currentPrice}
                startingPrice={auction.startingPrice}
                endTime={auction.endTime}
                ringNumber={auction.pigeon?.ringNumber || "Brak numeru"}
                gender={auction.pigeon?.gender}
                color={auction.pigeon?.pigeonColor}
                category={auction.category}
                location={auction.location}
                watchCount={auction._count?.watchlist ?? 0}
                viewsCount={(auction as any)?.viewsCount ?? (auction._count as any)?.views ?? 0}
                bidsCount={auction._count?.bids ?? auction.bids?.length ?? 0}
                featured={index === 1}
                nowMs={now}
              />
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
