import ChampionsGallery from "./ChampionsGallery";
import { useEffect, useState } from "react";
import { championsService } from "@/services/championsService";
import { motion } from 'framer-motion';

import type { Champion } from "@/services/championsService";

const ChampionsSection = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const data = await championsService.getChampions();
        setChampions(data);
      } catch (error) {
        setError("Nie udało się pobrać championów.");
        setChampions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  if (loading) {
    return (
      <div className="py-24 section-surface-alt flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="py-24 section-surface-alt relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md px-6 py-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <motion.section
      id="champions"
      className="py-20 section-surface-alt relative overflow-hidden"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-140px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Czempiony
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
            Nasze <span className="text-gradient-gold">gwiazdy</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zobacz wybrane ptaki, które budują renomę hodowli — zdjęcia, numery obrączek i rodowody.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChampionsGallery champions={champions} />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ChampionsSection;
