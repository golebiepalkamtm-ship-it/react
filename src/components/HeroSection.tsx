import { Button } from "@/components/ui/button";
import { ChevronDown, Trophy, Award, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-[center_20%]"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Animated particles overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-navy/30 to-navy" />
        {/* Main overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-8 animate-fade-up">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-gold text-sm font-medium tracking-wide">
            Polish National Champion Breeder
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground font-bold leading-tight mb-6 animate-fade-up">
          Excellence in
          <span className="block text-gradient-gold">Racing Pigeons</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-fade-up-delayed leading-relaxed">
          Decades of championship breeding. Unmatched sprint performance.
          Acquire elite racing pigeons from Poland's most decorated loft.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up-delayed">
          <Button variant="heroGold" size="xl">
            Explore Auctions
          </Button>
          <Button variant="hero" size="xl">
            Our Legacy
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-up-delayed">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-gold mr-2" />
              <span className="font-display text-4xl md:text-5xl text-primary-foreground font-bold">
                47
              </span>
            </div>
            <span className="text-primary-foreground/60 text-sm uppercase tracking-widest">
              Championships
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-gold mr-2" />
              <span className="font-display text-4xl md:text-5xl text-primary-foreground font-bold">
                25+
              </span>
            </div>
            <span className="text-primary-foreground/60 text-sm uppercase tracking-widest">
              Years Experience
            </span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-gold mr-2" />
              <span className="font-display text-4xl md:text-5xl text-primary-foreground font-bold">
                #1
              </span>
            </div>
            <span className="text-primary-foreground/60 text-sm uppercase tracking-widest">
              Sprint Category
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <a href="#about" className="flex flex-col items-center gap-2 text-primary-foreground/50 hover:text-gold transition-colors">
          <span className="text-xs uppercase tracking-widest">Discover</span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
