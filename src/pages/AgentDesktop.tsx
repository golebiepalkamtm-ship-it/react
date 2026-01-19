import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from '@/components/animations/RevealOnScroll';

const AgentDesktop = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-12 text-center">
          <RevealOnScroll direction="up" distance={120} duration={1}>
            <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
              Agent Desktop
            </h1>
          </RevealOnScroll>
          <RevealOnScroll direction="up" distance={100} duration={1} delay={0.1}>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Panel operacyjny dla agenta. Wersja placeholder — funkcje zostaną dodane później.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" distance={80} duration={1} delay={0.2}>
            <div className="flex items-center justify-center gap-3">
              <Button asChild className="bg-gold text-navy">
                <Link to="/">Wróć na stronę główną</Link>
              </Button>
              <Button variant="outline" asChild className="border-gold/40">
                <Link to="/auctions">Przejdź do aukcji</Link>
              </Button>
            </div>
          </RevealOnScroll>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AgentDesktop;
