import GoogleMap from '@/components/contact/GoogleMap';
import { Text3D } from '@/components/ui/Text3D';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { contactService } from '@/services/contactService';

// Scroll reveal hook - removed

// Styled card component matching AchievementTimeline
interface GoldenCardProps {
  children: React.ReactNode;
  className?: string;
}

function GoldenCard({ children, className = '' }: GoldenCardProps) {
  return (
    <div className="relative">
      {/* 3D Shadow layers */}
      {[...Array(11)].map((_, i) => {
        const layer = 11 - i;
        const offset = layer * 1.5;
        const opacity = Math.max(0.2, 0.7 - layer * 0.05);

        return (
          <div
            key={i}
            className="absolute inset-0 rounded-3xl border-2 backdrop-blur-sm"
            style={{
              borderColor: `rgba(0, 0, 0, ${opacity})`,
              backgroundColor: `rgba(0, 0, 0, ${opacity * 0.8})`,
              transform: `translateX(${offset}px) translateY(${offset / 2}px) translateZ(-${offset}px)`,
              zIndex: i + 1,
            }}
            aria-hidden="true"
          />
        );
      })}

      <article
        className={`glass-morphism relative z-[12] w-full rounded-3xl border-2 p-8 text-white overflow-hidden backdrop-blur-xl ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(139, 117, 66, 1) 0%, rgba(133, 107, 56, 1) 25%, rgba(107, 91, 49, 1) 50%, rgba(89, 79, 45, 1) 75%, rgba(71, 61, 38, 1) 100%)',
          borderColor: 'rgba(218, 182, 98, 1)',
          boxShadow: '0 0 30px rgba(218, 182, 98, 1), 0 0 50px rgba(189, 158, 88, 1), 0 0 70px rgba(165, 138, 78, 0.8), inset 0 0 40px rgba(71, 61, 38, 0.5), inset 0 2px 0 rgba(218, 182, 98, 1), inset 0 -2px 0 rgba(61, 51, 33, 0.6)',
        }}
      >
        {/* Inner light effects */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background: `
              radial-gradient(ellipse 800px 600px at 20% 30%, rgba(255, 245, 200, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 600px 500px at 80% 70%, rgba(218, 182, 98, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 400px 300px at 50% 50%, rgba(255, 235, 180, 0.15) 0%, transparent 60%)
            `,
            backdropFilter: 'blur(80px)',
            mixBlendMode: 'soft-light',
            zIndex: 1,
          }}
        />
        <div className={`relative z-10 h-full ${className.includes('flex') ? 'flex flex-col justify-between' : ''}`}>
          {children}
        </div>
      </article>
    </div>
  );
}

export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await contactService.submitContactForm(formData);
      toast.success('Wiadomość została wysłana pomyślnie!', {
        duration: 4000,
      });
      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania wiadomości', {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative z-10 pt-44 px-4 sm:px-6 lg:px-8 magictime twisterInDown"
        style={{ animationDuration: '1s', animationDelay: '0.2s' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="gold-text-3d mb-6">
            <div className="bg">Kontakt</div>
            <div className="fg">Kontakt</div>
          </div>
          <div className="gold-text-3d-subtitle mb-8 max-w-3xl mx-auto">
            <div className="bg">Skontaktuj się z nami, aby dowiedzieć się więcej o naszych gołębiach i hodowli</div>
            <div className="fg">Skontaktuj się z nami, aby dowiedzieć się więcej o naszych gołębiach i hodowli</div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-96 mt-12" style={{ minHeight: '1200px' }}>
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Contact Info */}
          <section className="magictime twisterInUp" style={{ animationDuration: '1s', animationDelay: '0.7s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20 xl:gap-24">
              <GoldenCard className="text-center h-full min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-700/20">
                    <Phone className="w-8 h-8 text-amber-300" />
                  </div>
                  <Text3D variant="glow" intensity="medium" className="text-xl font-bold mb-4">
                    Telefon
                  </Text3D>
                  <p className="text-white/90 mb-4">75 722 47 29</p>
                </div>
                <p className="text-white/60 text-sm">Dostępny 8:00 - 20:00</p>
              </GoldenCard>

              <GoldenCard className="text-center h-full min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-700/20">
                    <Mail className="w-8 h-8 text-amber-300" />
                  </div>
                  <Text3D variant="gradient" intensity="medium" className="text-xl font-bold mb-4">
                    Email
                  </Text3D>
                  <p className="text-white/90 mb-4">kontakt@palkamtm.pl</p>
                </div>
                <p className="text-white/60 text-sm">Odpowiadamy w ciągu 24h</p>
              </GoldenCard>

              <GoldenCard className="text-center h-full min-h-[280px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-amber-700/20">
                    <MapPin className="w-8 h-8 text-amber-300" />
                  </div>
                  <Text3D variant="neon" intensity="medium" className="text-xl font-bold mb-4">
                    Adres
                  </Text3D>
                  <p className="text-white/90 mb-4">
                    Pałka MTM
                    <br />
                    ul. Stawowa 6<br />
                    59-800 Lubań
                    <br />
                    woj. dolnośląskie
                  </p>
                </div>
                <p className="text-white/60 text-sm">Wizyty po umówieniu</p>
              </GoldenCard>
            </div>
          </section>

          {/* Google Map */}
          <div className="magictime swap" style={{ animationDuration: '1s', animationDelay: '1.2s' }}>
            <GoogleMap />
          </div>

          {/* Contact Form */}
          <section className="magictime twisterInDown" style={{ animationDuration: '1s', animationDelay: '1.7s' }}>
            <GoldenCard>
              <Text3D
                variant="shimmer"
                intensity="high"
                className="text-3xl md:text-4xl font-bold mb-8 text-center"
              >
                Napisz do nas
              </Text3D>

              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-white/90 text-sm font-medium mb-2"
                    >
                      Imię i nazwisko
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300"
                      placeholder="Twoje imię i nazwisko"
                      aria-describedby="fullName-description"
                      required
                    />
                    <div id="fullName-description" className="sr-only">
                      Wprowadź swoje imię i nazwisko
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300"
                      placeholder="twoj@email.pl"
                      aria-describedby="email-description"
                      required
                    />
                    <div id="email-description" className="sr-only">
                      Wprowadź swój adres email
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-white/90 text-sm font-medium mb-2">
                    Temat
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                    placeholder="Temat wiadomości"
                    aria-describedby="subject-description"
                    required
                  />
                  <div id="subject-description" className="sr-only">
                    Wprowadź temat wiadomości
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="message" className="block text-white/90 text-sm font-medium mb-2">
                    Wiadomość
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 glass-morphism rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
                    placeholder="Napisz swoją wiadomość..."
                    aria-describedby="message-description"
                    required
                  ></textarea>
                  <div id="message-description" className="sr-only">
                    Wprowadź treść wiadomości
                  </div>
                </div>

                <div className="text-center">
                  <UnifiedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    intensity="high"
                    glow={false}
                    className="px-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                  </UnifiedButton>
                </div>
              </form>
            </GoldenCard>
          </section>

          {/* Additional Info */}
          <section className="magictime twisterInUp" style={{ animationDuration: '1s', animationDelay: '2.2s' }}>
            <GoldenCard>
              <Text3D
                variant="glow"
                intensity="medium"
                className="text-2xl md:text-3xl font-bold mb-6 text-center"
              >
                Godziny Pracy
              </Text3D>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 xl:gap-24">
                <div className="text-center rounded-xl border border-white/5 bg-black/20 p-5">
                  <h4 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">Hodowla</h4>
                  <p className="text-white/90 mb-2">Poniedziałek - Piątek: 8:00 - 18:00</p>
                  <p className="text-white/90 mb-2">Sobota: 9:00 - 15:00</p>
                  <p className="text-white/90">Niedziela: Zamknięte</p>
                </div>
                <div className="text-center rounded-xl border border-white/5 bg-black/20 p-5">
                  <h4 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">Aukcje Online</h4>
                  <p className="text-white/90 mb-2">24/7 - Dostępne cały czas</p>
                  <p className="text-white/90 mb-2">Wsparcie: 8:00 - 20:00</p>
                  <p className="text-white/90">Email: 24h</p>
                </div>
              </div>
            </GoldenCard>
          </section>
        </div>
      </div>
    </>
  );
}
