import { Trophy } from "lucide-react";

const achievements = [
  {
    year: "2024",
    title: "Mistrzostwo Europy",
    description: "Złoty medal w kategorii lotów długodystansowych. Nasz gołąb 'Złoty Błysk' pokonał 1200 km z najlepszym czasem.",
    bird: "Złoty Błysk"
  },
  {
    year: "2023",
    title: "Puchar Polski",
    description: "Pierwsze miejsce w ogólnopolskim konkursie hodowców. Uznanie za najlepszą hodowlę roku.",
    bird: "Srebrna Strzała"
  },
  {
    year: "2022",
    title: "Rekord Prędkości",
    description: "Ustanowienie nowego rekordu krajowego - 112 km/h na dystansie 800 km. Niepokonany wynik do dziś.",
    bird: "Błękitny Wicher"
  }
];

const TimelineSection = () => {
  return (
    <section className="py-20 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl text-[#e6eef8] mb-4">
            Nasza <span className="text-timeline-gold">Historia</span>
          </h2>
          <p className="text-[#e6eef8]/70 max-w-2xl mx-auto">
            Lata sukcesów i pasji do hodowli gołębi pocztowych
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-timeline-gold via-timeline-gold/50 to-transparent hidden md:block" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.year}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Card */}
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="achievement-card group">
                    {/* Year */}
                    <span className="text-4xl md:text-5xl font-bold text-timeline-gold font-playfair">
                      {achievement.year}
                    </span>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-semibold text-[#e6eef8] mt-3 mb-2 font-outfit">
                      {achievement.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-[#e6eef8]/80 text-sm md:text-base leading-relaxed">
                      {achievement.description}
                    </p>
                    
                    {/* Bird Name */}
                    <div className="mt-4 flex items-center gap-2 justify-start">
                      <Trophy className="w-4 h-4 text-timeline-gold" />
                      <span className="text-timeline-gold text-sm font-medium">
                        {achievement.bird}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="w-4 h-4 rounded-full bg-timeline-gold shadow-[0_0_20px_hsla(var(--glow-color)/0.5)] border-2 border-timeline-light-shadow" />
                </div>

                {/* Spacer */}
                <div className="hidden md:block w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
