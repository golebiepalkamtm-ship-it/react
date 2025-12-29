import Header from "@/components/Header";
import AchievementsSection from "@/components/AchievementsSection";
import Footer from "@/components/Footer";
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/gallery/ParticleBackground';

const Achievements = (props) => {
  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      <ParticleBackground particleCount={60} variant="gold" />
      <Header />
      <main className="relative z-10">
        <div className="section-surface-alt">
          <section className="relative overflow-hidden text-center">
            <div className="relative z-10 container mx-auto px-4 pt-4 pb-2 md:pt-6 md:pb-4">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Trophy className="w-8 h-8 text-gold" />
                </div>
                <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">Historia <span className="text-gradient-gold">osiągnięć</span></h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Przewij czas i odkryj historię sukcesów od 2001 roku.
                </p>

                <div className="mt-8 flex items-center justify-center gap-3">
                  <Button
                    onClick={() => alert('Dodawanie osiągnięć nie jest zaimplementowane')}
                    className="bg-gold text-navy hover:bg-gold/90"
                  >
                    Dodaj osiągnięcie
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-gold/40 text-foreground hover:bg-gold/10"
                  >
                    Odśwież
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10">
            <AchievementsSection showHeader={false} />
          </section>
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Achievements;
