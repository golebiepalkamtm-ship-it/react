import { useState } from "react";
import { ParticleBackground } from "@/components/gallery/ParticleBackground";
import { HeroSection } from "@/components/gallery/HeroSection";
import { Carousel3D } from "@/components/gallery/Carousel3D";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { PigeonModal } from "@/components/gallery/PigeonModal";
import { pigeons, type Pigeon } from "@/data/pigeons";

const Index = () => {
  const [selectedPigeon, setSelectedPigeon] = useState<Pigeon | null>(null);

  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedPigeon) return;
    
    const currentIndex = pigeons.findIndex((p) => p.id === selectedPigeon.id);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % pigeons.length
        : (currentIndex - 1 + pigeons.length) % pigeons.length;
    
    setSelectedPigeon(pigeons[newIndex]);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <ParticleBackground />
      
      <HeroSection />
      
      <Carousel3D />
      
      <GalleryGrid onSelectPigeon={setSelectedPigeon} />
      
      <PigeonModal
        pigeon={selectedPigeon}
        onClose={() => setSelectedPigeon(null)}
        onNavigate={handleNavigate}
      />

      <footer className="relative z-10 py-12 text-center border-t border-border/20">
        <p className="text-muted-foreground text-sm">
          © 2024 Champions Gallery — Ekskluzywna Hodowla Gołębi Pocztowych
        </p>
      </footer>
    </main>
  );
};

export default Index;
