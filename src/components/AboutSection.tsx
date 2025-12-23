import { Award, Target, Feather, Crown } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Crown,
      title: "Linie mistrzowskie",
      description:
        "Nasze gołębie pochodzą z pokoleń sprawdzonych mistrzów, starannie selekcjonowanych pod kątem prędkości, wytrzymałości i instynktu nawigacyjnego.",
    },
    {
      icon: Target,
      title: "Specjaliści od sprintów",
      description:
        "Dominujemy w kategorii sprinterskiej z ptakami wyhodowanymi specjalnie do eksplozywnej prędkości na krótkich dystansach.",
    },
    {
      icon: Feather,
      title: "Elitarna genetyka",
      description:
        "Każdy ptak nosi w sobie genetykę udoskonalaną przez dziesięciolecia strategicznej hodowli i skrupulatnej selekcji.",
    },
    {
      icon: Award,
      title: "Udowodnione wyniki",
      description:
        "Konsekwentnie zajmujemy czołowe miejsca w krajowych i międzynarodowych zawodach, rok po roku.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
              O naszej hodowli
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-6">
              Dziedzictwo
              <span className="text-gradient-gold block">doskonałości wyścigowej</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Od ponad 45 lat poświęcamy się hodowli najlepszych gołębi pocztowych w Polsce. 
              Nasze ptaki konsekwentnie sprawdzają się na najbardziej wymagających trasach, 
              odnosząc niezliczone zwycięstwa i ustanawiając rekordy, które trwają do dziś.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Jako MTM Pałka utrzymujemy najwyższe standardy w genetyce, treningu i opiece. 
              Każdy gołąb opuszczający nasz gołębnik niesie ze sobą dziedzictwo doskonałości 
              i potencjał do wielkich osiągnięć.
            </p>
            
            {/* Signature */}
            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <span className="font-display text-navy font-bold text-xl">MTM</span>
              </div>
              <div>
                <p className="font-display text-foreground font-semibold">Mariusz, Tadeusz i Marcin Pałka</p>
                <p className="text-muted-foreground text-sm">Mistrzowie Hodowcy i Właściciele</p>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-gold/30 hover:shadow-lg transition-all duration-300 hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-lg text-foreground font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
