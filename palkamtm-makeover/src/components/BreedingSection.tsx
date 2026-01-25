import { Zap, Heart, Shield, Users } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Najwyższa szybkość',
    description: 'Nasze gołębie to mistrzowie sprintu – szybkie, zdecydowane i nieustępliwe w walce o zwycięstwo.',
  },
  {
    icon: Heart,
    title: 'Pasja i oddanie',
    description: 'Każdy ptak w naszej hodowli jest traktowany z najwyższą troską i otrzymuje najlepszą opiekę.',
  },
  {
    icon: Shield,
    title: 'Sprawdzona genetyka',
    description: 'Wieloletnia selekcja i sprawdzone linie hodowlane gwarantują najwyższą jakość potomstwa.',
  },
  {
    icon: Users,
    title: 'Współpraca z najlepszymi',
    description: 'Współpracujemy z czołowymi hodowcami z Belgii, Holandii i Niemiec.',
  },
];

export const BreedingSection = () => {
  return (
    <section id="breeding" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Hodowla
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 text-foreground">
            Dlaczego <span className="text-gradient-gold">Pałka M.T.M.</span>?
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Nasza hodowla wyróżnia się kompleksowym podejściem do każdego aspektu 
            pracy z gołębiami pocztowymi.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl border border-border bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-gold transition-all duration-500">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-secondary p-12 border border-border">
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Zainteresowany współpracą?
            </h3>
            <p className="text-muted-foreground text-lg mb-8">
              Skontaktuj się z nami, aby poznać aktualną ofertę i dowiedzieć się więcej 
              o naszych gołębiach.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-gold text-primary-foreground font-semibold hover:shadow-gold hover:scale-105 transition-all duration-300"
            >
              Skontaktuj się
            </a>
          </div>
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
};
