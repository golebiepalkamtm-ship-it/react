import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AuctionsSection from "@/components/AuctionsSection";
import ChampionsSection from "@/components/ChampionsSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <AuctionsSection />
        <ChampionsSection />
        <PressSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
