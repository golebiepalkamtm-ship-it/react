import Header from "@/components/Header";
import { useEffect, useState } from 'react';
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AuctionsSection from "@/components/AuctionsSection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Carousel3D } from '@/components/gallery/Carousel3D';
import { useAuth } from "@/contexts/AuthContext";
import UnifiedModal from "@/components/ui/UnifiedModal";

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
      // Check if we should show the welcome message
      // We can use a session storage flag to ensure it only shows once per session
      const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
      if (!hasShownWelcome) {
        const timer = setTimeout(() => {
          setShowAuthMessage(true);
          sessionStorage.setItem('hasShownWelcome', 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, profile]);

  const getAuthMessage = () => {
    if (!user || !profile) return null;
    switch (profile.role) {
      case 'USER_REGISTERED':
        return {
          type: 'warning' as const,
          title: 'Wymagana weryfikacja',
          text: 'Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę odbiorczą, aby uzyskać pełny dostęp.',
          action: () => window.location.reload(),
          actionText: 'Odśwież'
        };
      case 'USER_EMAIL_VERIFIED':
        return {
          type: 'info' as const,
          title: 'Witaj w Pałka MTM!',
          text: `Jesteś zalogowany jako ${profile.email || user.email}. Uzupełnij profil i zweryfikuj telefon, aby licytować.`,
        };
      case 'USER_FULL_VERIFIED':
      case 'ADMIN':
        return {
          type: 'success' as const,
          title: 'Witaj w Pałka MTM!',
          text: `Cieszymy się, że jesteś z nami, ${profile.first_name || profile.name || user.email}! Życzymy udanych licytacji.`,
        };
      default:
        return null;
    }
  };

  const authMessage = getAuthMessage();

  return (
    <div className="min-h-screen relative">
      <Header />
      {authMessage && (
        <UnifiedModal
          isOpen={showAuthMessage}
          onClose={() => setShowAuthMessage(false)}
          type={authMessage.type}
          title={authMessage.title}
          message={authMessage.text}
          confirmButton={authMessage.action ? {
            text: authMessage.actionText,
            onClick: authMessage.action
          } : {
            text: 'OK',
            onClick: () => setShowAuthMessage(false)
          }}
        />
      )}
      <main className="relative z-10">
        <HeroSection />
        
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
