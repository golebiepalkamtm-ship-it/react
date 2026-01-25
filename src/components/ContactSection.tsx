import React, { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, Navigation, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap } from '@/lib/gsapConfig';

// --- Komponenty lokalne (wcześniej w osobnych plikach) ---

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
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] h-full p-8"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)' }}
          animate={{ opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="relative z-10">
          <h3 className="font-display text-2xl text-foreground font-semibold mb-6">
            Wyślij wiadomość
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Imię i Nazwisko</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground resize-none"
                placeholder="Napisz nam o swoich zainteresowaniach..."
                required
              />
            </div>
            <MagneticButton strength={0.3}>
              <Button 
                type="submit"
                variant="gold" 
                size="lg" 
                className="w-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.7)] relative z-30" 
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </Button>
            </MagneticButton>
          </form>
        </div>
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
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
    navigator.clipboard.writeText(address).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-[70%] contrast-120 group-hover:grayscale-0 transition-all duration-500"
        ></iframe>
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            className="shadow-lg"
            onClick={handleCopyAddress}
          >
import React, { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, Navigation, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap } from '@/lib/gsapConfig';

// --- Komponenty lokalne (wcześniej w osobnych plikach) ---

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
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] h-full p-8"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)' }}
          animate={{ opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="relative z-10">
          <h3 className="font-display text-2xl text-foreground font-semibold mb-6">
            Wyślij wiadomość
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Imię i Nazwisko</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
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
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground resize-none"
                placeholder="Napisz nam o swoich zainteresowaniach..."
                required
              />
            </div>
            <MagneticButton strength={0.3}>
              <Button 
                type="submit"
                variant="gold" 
                size="lg" 
                className="w-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.7)] relative z-30" 
                disabled={isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </Button>
            </MagneticButton>
          </form>
        </div>
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
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
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
      toast({
        title: "Błąd",
        description: "Schowek jest niedostępny w Twojej przeglądarce lub na niezabezpieczonej stronie.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(address).then(() => {
      toast({
        title: "Skopiowano!",
        description: "Adres został pomyślnie skopiowany do schowka.",
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }, (err) => {
      toast({
        title: "Błąd kopiowania",
        description: "Nie udało się skopiować adresu.",
        variant: "destructive",
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
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
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
    </motion.div>
  );
};

// --- Główny komponent sekcji ---

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

  return (
    <motion.div
      ref={cardRef}
      className="relative group h-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.05)] h-full flex flex-col p-6"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none" />
        <motion.div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 60%)' }}
          animate={{ opacity: isHovered ? [0.5, 0.8, 0.5] : 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <info.icon className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-grow">
            <p className="text-sm text-white/60 mb-1">{info.label}</p>
            <p className="text-white font-semibold text-lg mb-1 group-hover:text-gold transition-colors">
              {info.value}
            </p>
            <p className="text-white/60 text-sm">{info.detail}</p>
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: index * 0.1 }}
          viewport={{ once: true }}
        />
      </motion.div>
    </motion.div>
  );
};

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    
    const section = sectionRef.current;
    const headerBadge = section.querySelector('.contact-badge');
    const headerTitle = section.querySelector('.contact-title');
    const headerDesc = section.querySelector('.contact-desc');
    const formCard = formRef.current;
    const infoCards = infoCardsRef.current?.querySelectorAll('.info-card');
    const mapCard = section.querySelector('.map-card');
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        }
      });

      if (headerBadge) tl.fromTo(headerBadge, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      if (headerTitle) tl.fromTo(headerTitle, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.3');
      if (headerDesc) tl.fromTo(headerDesc, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');

      if (formCard) {
        tl.fromTo(formCard, { x: -100, opacity: 0, scale: 0.95 }, { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, '-=0.5');
      }

      if (infoCards && infoCards.length > 0) {
        tl.fromTo(infoCards, { y: 100, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.4)', stagger: 0.2 }, '-=0.7');
      }

      if (mapCard) {
        tl.fromTo(mapCard, { y: 100, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.4)' }, '-=0.5');
      }
      
    }, section);
    
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await contactService.submitContactForm({
        fullName: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      toast({
        title: "Wiadomość wysłana!",
        description: "Odezwiemy się do Ciebie tak szybko, jak to możliwe.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Błąd!",
        description: error instanceof Error ? error.message : "Nie udało się wysłać wiadomości",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo: ContactInfoItem[] = [
    {
      icon: MapPin,
      label: "Lokalizacja",
      value: "Lubań, Polska",
      detail: "ul. Stawowa 6, 59-800 Lubań",
      href: "https://www.google.com/maps/search/?api=1&query=ul.+Stawowa+6,+59-800+Lubań",
    },
    {
      icon: Phone,
      label: "Telefon",
      value: "75 722 47 29",
      detail: "Pon-Sob, 8:00-18:00",
      action: "call",
    },
    {
      icon: Mail,
      label: "Email",
      value: "kontakt@palkamtm.pl",
      detail: "Odpowiadamy w ciągu 24h",
      action: "mail",
    },
    {
      icon: Clock,
      label: "Godziny odwiedzin",
      value: "Po umówieniu",
      detail: "Zapraszamy do kontaktu",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-20 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="contact-badge inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Kontakt
          </span>
          <h2 className="contact-title font-display text-3xl md:text-4xl text-white font-bold leading-tight mb-4">
            Skontaktuj się <span className="text-gold">z nami</span>
          </h2>
          <p className="contact-desc text-white/70 max-w-2xl mx-auto">
            Chcesz nabyć gołębie z mistrzowskich linii? Masz pytania dotyczące naszej hodowli?
            Jesteśmy tutaj, aby pomóc Ci znaleźć idealne ptaki do Twojego gołębnika.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div ref={formRef} style={{ transformStyle: 'preserve-3d' }}>
            <ContactFormCard handleSubmit={handleSubmit} formData={formData} setFormData={setFormData} isSubmitting={isSubmitting} />
          </div>

          <div className="space-y-6" style={{ perspective: '1200px' }}>
            <div ref={infoCardsRef} className="space-y-6">
              {contactInfo.map((info, index) => (
                <div 
                  key={info.label}
                  className="info-card"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <StyledContactCard info={info} index={index} />
                </div>
              ))}
            </div>
            
            <div className="map-card" style={{ transformStyle: 'preserve-3d' }}>
              <GoogleMapCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ContactSection);
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ContactSection);