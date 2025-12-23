import ChampionsCarousel3D from "./ChampionsCarousel3D";
import { useEffect, useState } from "react";
import { championsService } from "@/services/championsService";

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
      <div className="py-24 bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="rounded-2xl border border-gold/10 bg-navy-light/20 px-6 py-8 text-center">
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="champions" className="py-24 relative" style={{backgroundImage: 'url(/hero-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-navy/80" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ChampionsCarousel3D champions={champions} />
      </div>
    </section>
  );
};

export default ChampionsSection;
