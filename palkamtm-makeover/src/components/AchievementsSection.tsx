const achievements = [
  { year: '2024', title: 'Mistrzostwo Regionu', category: 'Sprint 300km' },
  { year: '2023', title: '1. miejsce - Lot Krajowy', category: 'Sprint 250km' },
  { year: '2023', title: '3x Top 10', category: 'Loty Międzynarodowe' },
  { year: '2022', title: 'Mistrz Federacji', category: 'Młode Gołębie' },
  { year: '2022', title: 'Best Velocity', category: 'Sprint Championship' },
  { year: '2021', title: '5x Pierwsze miejsce', category: 'Loty Regionalne' },
];

export const AchievementsSection = () => {
  return (
    <section id="achievements" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Osiągnięcia
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 text-foreground">
            Nasze <span className="text-gradient-gold">sukcesy</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Wieloletnia praca i pasja przynoszą efekty. Oto niektóre z naszych 
            najważniejszych osiągnięć w lotach gołębi pocztowych.
          </p>
        </div>

        {/* Achievements Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            {achievements.map((achievement, index) => (
              <div
                key={`${achievement.year}-${achievement.title}`}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-gold" />

                {/* Content Card */}
                <div
                  className={`ml-8 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}
                >
                  <div className="p-6 rounded-xl bg-card/50 border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                      {achievement.year}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {achievement.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
