import { Award, Target, Feather, Crown } from "lucide-react";
import { motion } from 'framer-motion';

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
    <motion.section
      id="about"
      className="pt-16 pb-16 section-surface-alt relative overflow-hidden"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/20 via-black/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -22, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-140px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mt-2">
                <span className="font-display text-navy font-bold text-xl">MTM</span>
              </div>
              <div>
                <p className="font-display text-foreground font-semibold">Mariusz, Tadeusz i Marcin Pałka</p>
                <p className="text-muted-foreground text-sm">Mistrzowie Hodowcy i Właściciele</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Feature Grid */}
          <motion.div
            className="features-grid grid sm:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-120px" }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.08, delayChildren: 0.08 },
              },
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-item group p-6 rounded-2xl bg-card border border-border hover:border-gold/30 hover:shadow-lg transition-all duration-300 hover-lift"
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.985, filter: 'blur(10px)' },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
