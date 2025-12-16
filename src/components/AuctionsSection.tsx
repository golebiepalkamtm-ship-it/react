import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuctionCard from "./AuctionCard";

const AuctionsSection = () => {
  const auctions = [
    {
      id: "1",
      name: "Golden Thunderbolt",
      image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=600&h=400&fit=crop",
      currentBid: 12500,
      timeLeft: "2d 14h",
      raceWins: 23,
      bloodline: "Champion Line 2019",
      featured: true,
    },
    {
      id: "2",
      name: "Silver Streak",
      image: "https://images.unsplash.com/photo-1544923246-77307dd628b9?w=600&h=400&fit=crop",
      currentBid: 8200,
      timeLeft: "1d 6h",
      raceWins: 18,
      bloodline: "Elite Sprint Heritage",
    },
    {
      id: "3",
      name: "Royal Phoenix",
      image: "https://images.unsplash.com/photo-1555169062-013468b47731?w=600&h=400&fit=crop",
      currentBid: 15800,
      timeLeft: "3d 22h",
      raceWins: 31,
      bloodline: "National Victor Lineage",
      featured: true,
    },
    {
      id: "4",
      name: "Storm Chaser",
      image: "https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=600&h=400&fit=crop",
      currentBid: 6700,
      timeLeft: "18h 45m",
      raceWins: 12,
      bloodline: "Speed Demon Strain",
    },
    {
      id: "5",
      name: "Midnight Arrow",
      image: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=600&h=400&fit=crop",
      currentBid: 9400,
      timeLeft: "4d 8h",
      raceWins: 15,
      bloodline: "Dark Wing Dynasty",
    },
    {
      id: "6",
      name: "Diamond Wing",
      image: "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=600&h=400&fit=crop",
      currentBid: 21000,
      timeLeft: "5d 12h",
      raceWins: 27,
      bloodline: "Supreme Champion 2022",
      featured: true,
    },
  ];

  return (
    <section id="auctions" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-4">
              Live Auctions
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight">
              Acquire
              <span className="text-gradient-gold"> Elite Birds</span>
            </h2>
          </div>
          <Button variant="outline" className="mt-6 md:mt-0 group">
            View All Auctions
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Auction Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Want to be notified about new auctions and exclusive offers?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-3 rounded-xl bg-card border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="gold" size="lg" className="w-full sm:w-auto whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionsSection;
