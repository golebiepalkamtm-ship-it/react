import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChampionsSection from "@/components/ChampionsSection";

const Champions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-navy text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/40 to-transparent" />
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
              Nasi <span className="text-gradient-gold">Mistrzowie</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Galeria najwybitniejszych gołębi z naszej hodowli, które zdobywały najwyższe laury na arenie krajowej i międzynarodowej.
            </p>
          </div>
        </section>
        <ChampionsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Champions;
