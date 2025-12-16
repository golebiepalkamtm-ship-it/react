import { Trophy, Medal, Star, Award, Target, Zap } from "lucide-react";

const AchievementsSection = () => {
  const achievements = [
    {
      icon: Trophy,
      value: "47",
      label: "National Championships",
      description: "First place victories in Polish national competitions",
    },
    {
      icon: Medal,
      value: "156",
      label: "Race Victories",
      description: "Individual race wins across all categories",
    },
    {
      icon: Star,
      value: "12",
      label: "International Titles",
      description: "European and world championship recognitions",
    },
    {
      icon: Target,
      value: "98.7%",
      label: "Return Rate",
      description: "Exceptional homing accuracy across all distances",
    },
  ];

  const highlights = [
    { year: "2023", title: "Polish Sprint Champion", bird: "Golden Thunderbolt" },
    { year: "2022", title: "European Cup Winner", bird: "Royal Phoenix" },
    { year: "2021", title: "National Grand Prix", bird: "Silver Streak" },
    { year: "2020", title: "International Marathon", bird: "Storm Chaser" },
    { year: "2019", title: "Polish Champion of Champions", bird: "Diamond Wing" },
  ];

  return (
    <section id="achievements" className="py-24 bg-navy relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 border border-gold rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-gold rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/50 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Our Achievements
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-primary-foreground font-bold leading-tight mb-4">
            Decades of
            <span className="text-gradient-gold block">Racing Dominance</span>
          </h2>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Our track record speaks for itself. Year after year, our pigeons
            continue to set standards in competitive racing.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {achievements.map((item, index) => (
            <div
              key={item.label}
              className="group p-8 rounded-2xl bg-navy-light/50 border border-gold/10 hover:border-gold/30 transition-all duration-300 text-center hover-lift"
            >
              <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                <item.icon className="w-7 h-7 text-gold" />
              </div>
              <p className="font-display text-4xl text-primary-foreground font-bold mb-2">
                {item.value}
              </p>
              <p className="text-gold font-medium mb-2">{item.label}</p>
              <p className="text-primary-foreground/50 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Highlights */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-10">
            <Award className="w-6 h-6 text-gold" />
            <h3 className="font-display text-2xl text-primary-foreground font-semibold">
              Recent Highlights
            </h3>
          </div>

          <div className="space-y-4">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="group flex items-center gap-6 p-5 rounded-xl bg-navy-light/30 border border-gold/5 hover:border-gold/20 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                  <span className="font-display text-navy font-bold">
                    {highlight.year}
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="text-primary-foreground font-semibold text-lg">
                    {highlight.title}
                  </p>
                  <p className="text-primary-foreground/50 text-sm flex items-center gap-2">
                    <Zap className="w-3 h-3 text-gold" />
                    {highlight.bird}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Trophy className="w-8 h-8 text-gold/30 group-hover:text-gold transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
