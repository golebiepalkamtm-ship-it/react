import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import heroPigeons from '@/assets/hero-pigeons.jpg';

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroPigeons}
          alt="Gołębie pocztowe w locie o wschodzie słońca"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <span className="w-2 h-2 rounded-full bg-primary animate-shimmer" />
            <span className="text-sm text-primary font-medium tracking-wide">
              Ponad 30 lat doświadczenia
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <span className="text-foreground">Pałka</span>{' '}
            <span className="text-gradient-gold">M.T.M.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-display text-2xl md:text-3xl text-muted-foreground mb-4 tracking-wider animate-fade-up" style={{ animationDelay: '600ms' }}>
            Mistrzowie Sprintu
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '800ms' }}>
            Hodowla gołębi pocztowych najwyższej klasy. 
            Pasja, tradycja i wieloletnie doświadczenie w świecie lotów gołębi.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '1000ms' }}>
            <Button variant="hero" size="xl">
              Poznaj nasze gołębie
            </Button>
            <Button variant="heroOutline" size="xl">
              O hodowli
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-float"
      >
        <span className="text-xs tracking-widest uppercase">Przewiń</span>
        <ChevronDown className="w-5 h-5" />
      </a>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
    </section>
  );
};
