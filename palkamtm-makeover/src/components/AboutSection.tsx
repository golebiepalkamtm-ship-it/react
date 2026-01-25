import { Trophy, Award, Medal, Target } from 'lucide-react';

const stats = [
  {
    icon: Trophy,
    value: '150+',
    label: 'Zwycięstw',
    description: 'W lotach krajowych i międzynarodowych',
  },
  {
    icon: Award,
    value: '30+',
    label: 'Lat doświadczenia',
    description: 'Tradycja hodowlana od pokoleń',
  },
  {
    icon: Medal,
    value: '25+',
    label: 'Tytułów mistrzowskich',
    description: 'W kategorii sprintów',
  },
  {
    icon: Target,
    value: '98%',
    label: 'Skuteczność powrotów',
    description: 'Z najtrudniejszych tras',
  },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            O nas
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 text-foreground">
            Pasja zapisana w <span className="text-gradient-gold">genach</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Hodowla Pałka M.T.M. to efekt wieloletniej pracy, selekcji i nieustannego 
            dążenia do doskonałości. Nasze gołębie to wynik starannego doboru 
            najlepszych linii hodowlanych z całej Europy.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group p-8 rounded-2xl bg-card/50 border border-border hover:border-primary/50 hover:bg-card transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:shadow-gold transition-all duration-500">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="mt-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Historia naszej hodowli
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Nasza przygoda z gołębiami pocztowymi rozpoczęła się ponad 30 lat temu. 
                Od pierwszego momentu wiedzieliśmy, że to więcej niż hobby – to prawdziwa pasja.
              </p>
              <p>
                Przez lata doskonaliliśmy nasze metody hodowlane, zdobywając wiedzę 
                od najlepszych hodowców w Europie. Każdy gołąb w naszej hodowli jest 
                efektem starannej selekcji i wieloletniego doświadczenia.
              </p>
              <p>
                Specjalizujemy się w gołębiach sprinterskich – szybkich, wytrzymałych 
                i inteligentnych ptakach, które wielokrotnie udowodniły swoją wartość 
                na najtrudniejszych trasach lotowych.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                  <span className="font-display text-5xl font-bold text-primary-foreground">P</span>
                </div>
                <p className="font-display text-2xl font-semibold text-foreground">Pałka M.T.M.</p>
                <p className="text-muted-foreground text-sm mt-2 tracking-widest uppercase">
                  Est. 1990
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
