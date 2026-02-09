import React, { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, Navigation, Copy, Check } from "lucide-react";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { contactService } from "@/services/contactService";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap } from '@/lib/gsapConfig';

const ContactFormCard = ({ handleSubmit, formData, setFormData, isSubmitting }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group h-full"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] h-full p-8"
        style={{
          rotateX,
          rotateY,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)' }}
          animate={{ opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent pointer-events-none" />
        
        <div className="relative z-20">
          <h3 className="font-display text-2xl text-foreground font-semibold mb-6">
            Wyślij wiadomość
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Imię i Nazwisko</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground relative z-30"
                  placeholder="Jan Kowalski"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Adres Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground relative z-30"
                  placeholder="twoj@email.pl"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Temat</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground relative z-30"
                placeholder="Temat wiadomości"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Wiadomość</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground resize-none relative z-30"
                placeholder="Napisz nam o swoich zainteresowaniach..."
                required
              />
            </div>
            <div className="relative z-40">
              <Button 
                type="submit"
                variant="gold" 
                size="lg" 
                className="w-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.7)]" 
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </Button>
            </div>
          </form>
        </div>
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent pointer-events-none"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: true }}
        />
      </motion.div>
    </motion.div>
  );
};

const GoogleMapCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const address = "ul. Stawowa 6, 59-800 Lubań";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCopyAddress = () => {
    if (!navigator.clipboard) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: "Błąd",
        message: "Schowek jest niedostępny w Twojej przeglądarce lub na niezabezpieczonej stronie."
      });
      return;
    }
    navigator.clipboard.writeText(address).then(() => {
      setModalState({
        isOpen: true,
        type: 'success',
        title: "Skopiowano!",
        message: "Adres został pomyślnie skopiowany do schowka."
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }, (err) => {
      setModalState({
        isOpen: true,
        type: 'error',
        title: "Błąd kopiowania",
        message: "Nie udało się skopiować adresu."
      });
      console.error('Failed to copy address: ', err);
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-zinc-900 shadow-lg"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2518.801815397259!2d15.2833333157461!3d51.0469444795620!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4708e5d3b0d3b3d3%3A0x3f3b3b3b3b3b3b3b!2sStawowa+6%2C+59-800+Luba%C5%84%2C+Poland!5e0!3m2!1sen!2sus!4v1689264800000"
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa lokalizacji MTM Pałka"
          className="grayscale-[70%] contrast-120 group-hover:grayscale-0 transition-all duration-500"
        ></iframe>
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            className="shadow-lg"
            onClick={handleCopyAddress}
          >
            {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {isCopied ? 'Skopiowano' : 'Kopiuj'}
          </Button>
          <Button
            variant="gold"
            size="sm"
            asChild
            className="shadow-lg"
          >
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">
              <Navigation className="w-4 h-4 mr-2" />
              Nawiguj
            </a>
          </Button>
        </div>
      </motion.div>
      <UnifiedModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmButton={{
          text: "OK",
          onClick: () => setModalState(prev => ({ ...prev, isOpen: false }))
        }}
      />
    </motion.div>
  );
};

type ContactInfoItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  action?: string;
  href?: string;
};

const StyledContactCard = ({ info, index }: { info: ContactInfoItem; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCardClick = () => {
    if (info.href) {
      window.open(info.href, '_blank', 'noopener,noreferrer');
    } else if (info.action === 'call') {
      window.location.href = `tel:${info.value.replace(/\s+/g, '')}`;
    } else if (info.action === 'mail') {
      window.location.href = `mailto:${info.value}`;
    }
  };

  const cardContent = (
    <motion.div
      ref={cardRef}
      className="relative w-full h-full p-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/80 via-zinc-900/80 to-zinc-800/80 shadow-[0_0_30px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      <div className="relative z-10 flex flex-col items-center text-center h-full">
        <div className="mb-4 text-gold">
          <info.icon className="w-8 h-8" />
        </div>
        <h4 className="font-bold text-lg text-foreground">{info.label}</h4>
        <p className="text-foreground/80 text-sm mt-1">{info.value}</p>
        <p className="text-foreground/60 text-xs mt-2 flex-grow">{info.detail}</p>
      </div>
      <motion.div 
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[150%] h-24 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.15) 0%, transparent 60%)' }}
        animate={{ opacity: isHovered ? [0.4, 0.7, 0.4] : 0.2 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );

  return (
    <div onClick={handleCardClick} className={`cursor-pointer ${!info.href && !info.action ? 'cursor-default' : ''}`}>
      {cardContent}
    </div>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll(".contact-card-reveal");
    const header = section.querySelector('h2');
    const subtext = section.querySelector('p');
    
    const ctx = gsap.context(() => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 40%',
          scrub: 1.5,
        }
      });
      
      if (header) headerTl.fromTo(header, 
        { y: 80, opacity: 0, skewY: 2 },
        { y: 0, opacity: 1, skewY: 0, duration: 0.5, ease: 'expo.out' }
      );
      if (subtext) headerTl.fromTo(subtext,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      );
      
      // Cards animation with stagger
      gsap.fromTo(cards, 
        { y: 100, opacity: 0, scale: 0.9, rotateY: -10 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 85%',
            end: 'top 30%',
            scrub: 1.5,
          }
        }
      );
    }, section);
    
    return () => ctx.revert();
  }, []);

  const contactInfo: ContactInfoItem[] = [
    { icon: MapPin, label: "Adres", value: "ul. Stawowa 6", detail: "59-800 Lubań, Polska", href: `https://www.google.com/maps/search/?api=1&query=ul.+Stawowa+6,+59-800+Lubań` },
    { icon: Phone, label: "Telefon", value: "75 722 47 29", detail: "Dostępny Pon-Pt, 9-17", action: 'call' },
    { icon: Mail, label: "Email", value: "kontakt@palkamtm.pl", detail: "Odpowiadamy w 24h", action: 'mail' },
    { icon: Clock, label: "Godziny pracy", value: "9:00 - 17:00", detail: "Poniedziałek - Piątek" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactService.submitContactForm(formData);
      setShowSuccessModal(true);
      setFormData({ fullName: '', email: '', subject: '', message: '' });
    } catch (error) {
      setErrorMessage("Nie udało się wysłać wiadomości. Spróbuj ponownie później.");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="py-20 sm:py-32 text-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gold">
            Skontaktuj się z nami
          </h2>
          <p className="mt-4 text-lg text-foreground/80 max-w-3xl mx-auto">
            Masz pytania lub chcesz dowiedzieć się więcej? Jesteśmy tutaj, aby pomóc. Wypełnij formularz lub skorzystaj z poniższych informacji kontaktowych.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-card-reveal">
                  <StyledContactCard info={info} index={index} />
                </div>
              ))}
            </div>
            <div className="contact-card-reveal">
              <GoogleMapCard />
            </div>
          </div>
          <div className="contact-card-reveal">
            <ContactFormCard 
              handleSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>

      <UnifiedModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Wiadomość Wysłana"
        message="Dziękujemy za kontakt! Twoja wiadomość została wysłana pomyślnie. Odpowiemy najszybciej jak to możliwe."
        confirmButton={{ text: "OK", onClick: () => setShowSuccessModal(false) }}
      />

      <UnifiedModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Błąd Wysyłania"
        message={errorMessage}
        confirmButton={{ text: "Zamknij", onClick: () => setShowErrorModal(false) }}
      />
    </section>
  );
};

export default React.memo(ContactSection);
