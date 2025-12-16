import { Award, Target, Feather, Crown } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Crown,
      title: "Championship Bloodlines",
      description:
        "Our pigeons descend from generations of proven champions, carefully selected for speed, endurance, and homing instinct.",
    },
    {
      icon: Target,
      title: "Sprint Specialists",
      description:
        "Dominating the sprint category with birds bred specifically for explosive speed over short distances.",
    },
    {
      icon: Feather,
      title: "Elite Genetics",
      description:
        "Each bird carries genetics refined through decades of strategic breeding and meticulous selection.",
    },
    {
      icon: Award,
      title: "Proven Results",
      description:
        "Consistent top placements in national and international competitions, year after year.",
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
              About Our Loft
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-6">
              A Legacy of
              <span className="text-gradient-gold block">Racing Excellence</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              For over 25 years, we have dedicated ourselves to breeding the finest
              racing pigeons in Poland. Our birds have consistently proven themselves
              on the most demanding courses, bringing home countless victories and
              setting records that stand to this day.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              As official breeders for the Polish Champion, we maintain the highest
              standards in genetics, training, and care. Every pigeon that leaves our
              loft carries with it a heritage of excellence and the potential for
              greatness.
            </p>
            
            {/* Signature */}
            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <span className="font-display text-navy font-bold text-xl">JK</span>
              </div>
              <div>
                <p className="font-display text-foreground font-semibold">Jan Kowalski</p>
                <p className="text-muted-foreground text-sm">Master Breeder & Owner</p>
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
