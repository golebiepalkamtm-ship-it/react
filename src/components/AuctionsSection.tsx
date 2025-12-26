import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuctionCard from "./AuctionCard";
import { useAuctions } from "@/hooks/useAuctions";
import { auctionService } from "@/services/auctionService";
import { motion } from 'framer-motion';

const AuctionsSection = () => {
  const { auctions, loading } = useAuctions({ 
    status: 'active', 
    sortBy: 'newest', 
    limit: 6 
  });

  const getFirstImage = (images: string[]) => {
    return images && images.length > 0 ? images[0] : '/placeholder.svg';
  };

  return (
    <motion.section
      id="auctions"
      className="pt-16 pb-24 section-surface-alt"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-140px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-4">
              Aukcje Na Żywo
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight">
              Zdobądź
              <span className="text-gradient-gold"> Elitarne Ptaki</span>
            </h2>
          </div>
          <Link to="/auctions">
            <Button variant="outline" className="mt-6 md:mt-0 group border-gold/50 hover:bg-gold hover:text-navy">
              Zobacz Wszystkie Aukcje
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Auction Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border h-96 animate-pulse" />
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-120px" }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.08, delayChildren: 0.05 },
              },
            }}
          >
            {auctions.map((auction, index) => (
              <motion.div
                key={auction.id}
                variants={{
                  hidden: { opacity: 0, y: 22, scale: 0.985 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <AuctionCard
                  id={auction.id}
                  name={auction.title}
                  image={getFirstImage(auction.images)}
                  currentBid={auction.currentPrice}
                  timeLeft={auctionService.calculateTimeLeft(auction.endTime)}
                  raceWins={auctionService.extractWins(auction.pigeon?.achievements)}
                  bloodline={auction.pigeon?.bloodline || 'Rodowód elitarny'}
                  featured={index < 2}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Obecnie brak aktywnych aukcji</p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-muted-foreground mb-6">
            Chcesz otrzymywać powiadomienia o nowych aukcjach i ekskluzywnych ofertach?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Wprowadź swój email"
              className="w-full px-6 py-3 rounded-xl bg-card border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="gold" size="lg" className="w-full sm:w-auto whitespace-nowrap">
              Subskrybuj
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AuctionsSection;
