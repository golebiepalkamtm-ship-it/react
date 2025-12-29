import Header from "@/components/Header";
import { useEffect, useState } from 'react';
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AuctionsSection from "@/components/AuctionsSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Carousel3D } from "@/components/gallery/Carousel3D";
import { ParticleBackground } from "@/components/gallery/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  // ensure body has a class on the homepage so we can target header/background reliably
  useEffect(() => {
    document.body.classList.add('home-page');
    return () => document.body.classList.remove('home-page');
  }, []);

  useEffect(() => {
    // Show message once after login
    if (!loading && user && profile) {
      const timer = setTimeout(() => {
        setShowAuthMessage(true);
        setTimeout(() => setShowAuthMessage(false), 8000);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [loading, user, profile]);

  const getAuthMessage = () => {
    if (!user || !profile) return null;
    switch (profile.role) {
      case 'USER_REGISTERED':
        return {
          type: 'warning',
          title: 'Witaj!',
          text: 'Zalogowano. Sprawdź skrzynkę i potwierdź adres email, aby odblokować wszystkie funkcje.',
        };
      case 'USER_EMAIL_VERIFIED':
        return {
          type: 'info',
          title: 'Zalogowano',
          text: `Jesteś zalogowany jako ${profile.email || user.email}`,
        };
      case 'USER_FULL_VERIFIED':
      case 'ADMIN':
        return {
          type: 'success',
          title: 'Zalogowano',
          text: `Witaj ${profile.name || profile.email || user.email}`,
        };
      default:
        return null;
    }
  };

  const authMessage = getAuthMessage();

  return (
    <div className="min-h-screen relative">
      {/* Particle Background - efekt cząsteczek z ethereal-canvas */}
      <ParticleBackground particleCount={80} variant="gold" />
      
      <Header />
      {authMessage && showAuthMessage && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2">
          <div
            className={`rounded-xl border px-6 py-4 shadow-lg backdrop-blur-md ${
              authMessage.type === 'warning'
                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200'
                : authMessage.type === 'info'
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-200'
                : 'border-green-500/30 bg-green-500/10 text-green-200'
            }`}
          >
            <div className="text-sm font-semibold">{authMessage.title}</div>
            <div className="mt-1 text-xs">{authMessage.text}</div>
            {authMessage.type === 'warning' && (
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                  Odśwież
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <main className="relative z-10">
        <HeroSection />
        
        {/* Karuzela 3D Championów z ethereal-canvas */}
        <Carousel3D />
        
        <AboutSection />
        <AuctionsSection />
        <PressSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
