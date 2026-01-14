import React, { useRef } from 'react';
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxuryAuctionCard } from "@/components/auction/LuxuryAuctionCard";
import { useAuctions } from "@/hooks/useAuctions";
import { auctionService } from "@/services/auctionService";
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal, StaggeredList, fadeInUp, fadeInLeft, buttonMicro } from "@/components/motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations/ScrollReveal";

const AuctionsSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const { auctions, loading } = useAuctions({ 
    status: 'active', 
    sortBy: 'newest', 
    limit: 6 
  });

  const getFirstImage = (images: string[]) => {
    return images && images.length > 0 ? images[0] : '/placeholder.svg';
  };

  return (
    <section
      ref={sectionRef}
      id="auctions"
      className="pt-16 pb-24 section-surface-alt relative overflow-hidden"
      data-reveal
    >
      {/* Animated background with parallax */}
      <div 
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-gold/20 blur-[120px] pointer-events-none"
        data-speed="0.7"
      />
      <div 
        className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] pointer-events-none"
        data-speed="0.6"
      />
      <div className="container mx-auto px-4">
        {/* Header */}
        <Reveal variants={fadeInLeft} delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-4">
              Aukcje Na Żywo
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight">
              Zdobądź
              <span className="text-gradient-gold"> Elitarne Ptaki</span>
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
        </Reveal>

        {/* Auction Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] h-96 animate-pulse" />
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-stagger-container
          >
            {auctions.map((auction, index) => (
              <div key={auction.id} data-stagger-item>
                <LuxuryAuctionCard
                  id={auction.id}
                  title={auction.title}
                  image={getFirstImage(auction.images)}
                  currentBid={auction.currentPrice}
                  timeLeft={auctionService.calculateTimeLeft(auction.endTime)}
                  ringNumber={auction.pigeon?.ringNumber || 'Brak numeru'}
                  featured={index < 2}
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
        <Reveal variants={fadeInUp} delay={0.3}>
          <div className="mt-16 text-center">
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
        </Reveal>
      </div>
    </section>
  );
};

export default React.memo(AuctionsSection);
