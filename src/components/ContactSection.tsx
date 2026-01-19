import React, { useState, useRef, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, Navigation, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

// Contact Form Card z efektami ChampionCard
const ContactFormCard = ({ handleSubmit, formData, setFormData, isSubmitting }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });
  
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
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
      className="relative group"
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="p-8 rounded-2xl bg-black/90 border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shadow-lg overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection - wzmocnione */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${lightX.get()}% ${lightY.get()}%, rgba(212,175,55,0.5) 0%, rgba(255,255,255,0.25) 30%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Dodatkowa górna poświata */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.35) 0%, transparent 60%)',
          }}
        />
        
        {/* Glow border on hover - JASNY */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )`
            }}
          />
        </motion.div>
        
        <h3 className="font-display text-2xl text-foreground font-semibold mb-6">
          Wyślij wiadomość
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Imię i Nazwisko
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
                placeholder="Jan Kowalski"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Adres Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
                placeholder="twoj@email.pl"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Temat
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
              placeholder="Temat wiadomości"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Wiadomość
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground resize-none"
              placeholder="Napisz nam o swoich zainteresowaniach..."
              required
            />
          </div>
          <MagneticButton strength={0.3}>
            <Button 
              variant="gold" 
              size="lg" 
              className="w-full shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.7)]" 
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
            </Button>
          </MagneticButton>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Google Map Card z efektami ChampionCard
const GoogleMapCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });
  
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
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
      className="relative group"
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="rounded-2xl overflow-hidden border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] shadow-lg"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection - wzmocnione */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${lightX.get()}% ${lightY.get()}%, rgba(212,175,55,0.5) 0%, rgba(255,255,255,0.25) 30%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Dodatkowa górna poświata */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.35) 0%, transparent 60%)',
          }}
        />
        
        {/* Glow border on hover - JASNY */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )`
            }}
          />
        </motion.div>
        
        <div className="h-64">
          <iframe
            src="https://maps.google.com/maps?q=ul.+Stawowa+6,+59-800+Lubań,+Poland&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            className="contact-map-iframe"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa hodowli MTM Pałka - ul. Stawowa 6, Lubań"
          />
        </div>
        <div className="p-4 bg-black/70 backdrop-blur-xl flex flex-col sm:flex-row gap-3">
          <a
            href="https://www.google.com/maps/search/?api=1&query=ul.+Stawowa+6,+59-800+Lubań"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold font-medium transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Zobacz na mapie
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=ul.+Stawowa+6,+59-800+Lubań"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold font-medium transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Wyznacz trasę
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Contact Info Card z efektami ChampionCard
const ContactInfoCard = ({ info, index }: { info: any; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });
  
  const lightX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const lightY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  
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
      className="relative group"
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="flex items-start gap-5 p-6 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ scale: { duration: 0.2 } }}
      >
        {/* Dynamic light reflection - wzmocnione */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${lightX.get()}% ${lightY.get()}%, rgba(212,175,55,0.5) 0%, rgba(255,255,255,0.25) 30%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Dodatkowa górna poświata */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.35) 0%, transparent 60%)',
          }}
        />
        
        {/* Glow border on hover - JASNY */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered
              ? '0 0 30px rgba(150, 150, 200, 0.3), inset 0 0 20px rgba(150, 150, 200, 0.1)'
              : 'none',
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )`
            }}
          />
        </motion.div>
        
        <motion.div 
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center flex-shrink-0 group-hover:from-gold/40 group-hover:to-gold/20 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, -5, 0],
            transition: { duration: 0.5 }
          }}
        >
          <info.icon className="w-6 h-6 text-gold drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
        </motion.div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
            {info.label}
          </p>
          <p className="text-foreground font-semibold text-lg mb-1">
            {info.value}
          </p>
          <p className="text-muted-foreground text-sm">{info.detail}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoCardsRef = useRef<HTMLDivElement>(null);

  // GSAP WOW animations
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
          invalidateOnRefresh: true,
          refreshPriority: -3,
        }
      });

      // Header - dramatic entrance
      if (headerBadge) {
        tl.fromTo(headerBadge,
          { y: -60, opacity: 0, scale: 0.3, rotateZ: -10 },
          { y: 0, opacity: 1, scale: 1, rotateZ: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' }
        );
      }
      
      if (headerTitle) {
        tl.fromTo(headerTitle,
          { y: 100, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
          { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power4.out' },
          '-=0.4'
        );
      }
      
      if (headerDesc) {
        tl.fromTo(headerDesc,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.5'
        );
      }

      // Form card - sweeping entrance from left with 3D rotation
      if (formCard) {
        tl.fromTo(formCard,
          { 
            x: -400, 
            opacity: 0, 
            rotateY: 45,
            scale: 0.7
          },
          { 
            x: 0, 
            opacity: 1, 
            rotateY: 0,
            scale: 1,
            duration: 1.2, 
            ease: 'power3.out'
          },
          '-=0.3'
        );
      }

      // Info cards - cascade from right with different rotations
      if (infoCards && infoCards.length > 0) {
        infoCards.forEach((card, index) => {
          const directions = [
            { x: 200, rotateY: -30, rotateZ: 5 },
            { x: 250, rotateY: -45, rotateZ: -5 },
            { x: 200, rotateY: -30, rotateZ: 5 },
            { x: 250, rotateY: -45, rotateZ: -5 }
          ];
          const dir = directions[index % directions.length];
          
          tl.fromTo(card,
            { 
              x: dir.x, 
              opacity: 0, 
              rotateY: dir.rotateY,
              rotateZ: dir.rotateZ,
              scale: 0.6
            },
            { 
              x: 0, 
              opacity: 1, 
              rotateY: 0,
              rotateZ: 0,
              scale: 1,
              duration: 0.8, 
              ease: 'back.out(1.2)'
            },
            index === 0 ? '-=0.8' : '-=0.6'
          );
        });
      }

      // Map card - rise from below with scale
      if (mapCard) {
        tl.fromTo(mapCard,
          { 
            y: 150, 
            opacity: 0, 
            scale: 0.8,
            rotateX: 20
          },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            rotateX: 0,
            duration: 1, 
            ease: 'power3.out'
          },
          '-=0.4'
        );
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

  const contactInfo = [
    {
      icon: MapPin,
      label: "Lokalizacja",
      value: "Lubań, Polska",
      detail: "ul. Stawowa 6, 59-800 Lubań",
    },
    {
      icon: Phone,
      label: "Telefon",
      value: "75 722 47 29",
      detail: "Pon-Sob, 8:00-18:00",
    },
    {
      icon: Mail,
      label: "Email",
      value: "kontakt@palkamtm.pl",
      detail: "Odpowiadamy w ciągu 24h",
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
      className="pt-20 pb-24 section-surface-alt"
      style={{ perspective: '1500px' }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="contact-badge inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6 opacity-0">
            Kontakt
          </span>
          <h2 className="contact-title font-display text-3xl md:text-4xl text-gold font-bold leading-tight mb-4 opacity-0">
            Skontaktuj się
            <span className="text-white"> z nami</span>
          </h2>
          <p className="contact-desc text-muted-foreground max-w-2xl mx-auto opacity-0">
            Chcesz nabyć gołębie z mistrzowskich linii? Masz pytania dotyczące naszej hodowli?
            Jesteśmy tutaj, aby pomóc Ci znaleźć idealne ptaki do Twojego gołębnika.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div ref={formRef} className="opacity-0" style={{ transformStyle: 'preserve-3d' }}>
            <ContactFormCard handleSubmit={handleSubmit} formData={formData} setFormData={setFormData} isSubmitting={isSubmitting} />
          </div>

          {/* Contact Info */}
          <div ref={infoCardsRef} className="space-y-6" style={{ perspective: '1200px' }}>
            {contactInfo.map((info, index) => (
              <div 
                key={info.label}
                className="info-card opacity-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <ContactInfoCard info={info} index={index} />
              </div>
            ))}

            {/* Google Maps */}
            <div className="map-card opacity-0" style={{ transformStyle: 'preserve-3d' }}>
              <GoogleMapCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ContactSection);
