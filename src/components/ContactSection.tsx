import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Navigation,
  Copy,
  Check,
  Facebook,
} from "lucide-react";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { contactService } from "@/services/contactService";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { gsap } from "@/lib/gsapConfig";

const ContactFormCard = ({
  handleSubmit,
  formData,
  setFormData,
  isSubmitting,
}: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

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
        className="relative overflow-hidden rounded-2xl bg-champion-teal h-full p-8"
        style={{
          rotateX,
          rotateY,
          border: "2px solid rgba(166,142,78,0.7)",
          boxShadow:
            "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent pointer-events-none" />

        <div className="relative z-20">
          <h3 className="font-display text-2xl font-semibold mb-6 text-[#C8AE68]">
            Wyślij wiadomość
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5 contact-form">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-fullName" className="block text-sm font-medium text-[#C8AE68] mb-2">
                  Imię i Nazwisko
                </label>
                <input
                  id="contact-fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground relative z-30"
                  placeholder="Jan Kowalski"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-[#C8AE68] mb-2">
                  Adres Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground relative z-30"
                  placeholder="twoj@email.pl"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-[#C8AE68] mb-2">
                Temat
              </label>
              <input
                id="contact-subject"
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground relative z-30"
                placeholder="Temat wiadomości"
                required
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-[#C8AE68] mb-2">
                Wiadomość
              </label>
              <textarea
                id="contact-message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground resize-none relative z-30"
                placeholder="Napisz nam o swoich zainteresowaniach..."
                required
              />
            </div>
            <div className="relative z-40">
              <Button
                type="submit"
                className="w-full inline-flex items-center justify-center bg-[#A68E4E] text-zinc-900 font-bold py-5 rounded-full hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-gold/20 uppercase tracking-widest"
                disabled={isSubmitting}
              >
                <Send className="w-5 h-5 mr-3" />
                {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
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
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const address = "ul. Stawowa 6, 59-800 Lubań";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

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
        type: "error",
        title: "Błąd",
        message:
          "Schowek jest niedostępny w Twojej przeglądarce lub na niezabezpieczonej stronie.",
      });
      return;
    }
    navigator.clipboard.writeText(address).then(
      () => {
        setModalState({
          isOpen: true,
          type: "success",
          title: "Skopiowano!",
          message: "Adres został pomyślnie skopiowany do schowka.",
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      },
      (err) => {
        setModalState({
          isOpen: true,
          type: "error",
          title: "Błąd kopiowania",
          message: "Nie udało się skopiować adresu.",
        });
        console.error("Failed to copy address: ", err);
      },
    );
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-champion-teal transition-all duration-300"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          border: "2px solid rgba(166,142,78,0.7)",
          boxShadow:
            "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
        }}
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
            size="sm"
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-[#A68E4E] text-zinc-900 font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg px-6 h-10"
            onClick={handleCopyAddress}
          >
            {isCopied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            <span>{isCopied ? "Skopiowano" : "Kopiuj"}</span>
          </Button>
          <Button
            size="sm"
            asChild
            className="flex-1 sm:flex-none inline-flex items-center justify-center bg-[#A68E4E] text-zinc-900 font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg px-6 h-10"
          >
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-4 h-4 mr-2" />
              <span>Nawiguj</span>
            </a>
          </Button>
        </div>
      </motion.div>
      <UnifiedModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmButton={{
          text: "OK",
          onClick: () => setModalState((prev) => ({ ...prev, isOpen: false })),
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

const StyledContactCard = ({
  info,
  index,
}: {
  info: ContactInfoItem;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

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
      window.open(info.href, "_blank", "noopener,noreferrer");
    } else if (info.action === "call") {
      window.location.href = `tel:${info.value.replace(/\s+/g, "")}`;
    } else if (info.action === "mail") {
      window.location.href = `mailto:${info.value}`;
    }
  };

  const cardContent = (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl bg-champion-teal h-full p-8"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        border: "2px solid rgba(166,142,78,0.7)",
        boxShadow:
          "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 24px 60px rgba(0,0,0,0.6)",
      }}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      <div className="relative z-10 flex flex-col items-center text-center h-full">
        <div
          className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "#A68E4E",
            boxShadow: "0 2px 12px rgba(166,142,78,0.5)",
            border: "1px solid rgba(166,142,78,0.8)",
          }}
        >
          <info.icon className="w-7 h-7 text-black" />
        </div>
        <h3 className="font-bold text-lg text-[#C8AE68]">{info.label}</h3>
        <p className="text-white text-sm mt-1">{info.value}</p>
        <p className="text-white/80 text-xs mt-2 flex-grow">{info.detail}</p>
      </div>
      <motion.div className="absolute inset-0 pointer-events-none" />
    </motion.div>
  );

  return (
    <div
      onClick={handleCardClick}
      className={`cursor-pointer ${!info.href && !info.action ? "cursor-default" : ""}`}
    >
      {cardContent}
    </div>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Używamy hooka do synchronizacji ScrollTrigger z Lenis - removed
  // const { refresh } = useScrollTriggerSync({
  //   refreshOnMount: true,
  //   refreshDelay: 200
  // });

  // Bezpośrednie animacje GSAP zamiast useScrollAnimation
  useEffect(() => {
    // Tworzymy kontekst GSAP dla czystego sprzątania
    const ctx = gsap.context(() => {
      // 1. Initial States - Hide everything
      gsap.set([titleRef.current, descRef.current], {
        opacity: 0,
        y: 60,
      });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const direction = i % 2 === 0 ? -1 : 1;
        gsap.set(card, {
          opacity: 0,
          y: 100,
          x: direction * 50, // Większe przesunięcie
          rotateY: direction * 15,
          scale: 0.8,
        });
      });

      // 2. Title & Description Animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      }).to(
        descRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.8",
      );

      // 3. Cards Animation
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        gsap.to(card, {
          opacity: 1,
          y: 0,
          x: 0,
          rotateY: 0,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          delay: i * 0.15, // Większy stagger
          scrollTrigger: {
            trigger: card, // Indywidualne triggery dla lepszego efektu przy scrollowaniu
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // 4. Form Animation
      const formElements = document.querySelectorAll(
        ".contact-form input, .contact-form textarea, .contact-form button",
      );
      if (formElements.length > 0 && formElements[0]) {
        gsap.fromTo(
          formElements,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: formElements[0] as HTMLElement,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, sectionRef);

    // Sprzątanie po odmontowaniu komponentu
    return () => ctx.revert();
  }, []);

  const contactInfo: ContactInfoItem[] = [
    {
      icon: MapPin,
      label: "Adres",
      value: "ul. Stawowa 6",
      detail: "59-800 Lubań, Polska",
      href: `https://www.google.com/maps/search/?api=1&query=ul.+Stawowa+6,+59-800+Lubań`,
    },
    {
      icon: Phone,
      label: "Telefon",
      value: "75 722 47 29",
      detail: "Dostępny Pon-Pt, 9-17",
      action: "call",
    },
    {
      icon: Mail,
      label: "Email",
      value: "kontakt@palkamtm.pl",
      detail: "Odpowiadamy w 24h",
      action: "mail",
    },
    {
      icon: Clock,
      label: "Godziny pracy",
      value: "9:00 - 17:00",
      detail: "Poniedziałek - Piątek",
    },
    {
      icon: Facebook,
      label: "Facebook",
      value: "MTM Pałka",
      detail: "Obserwuj nasz profil",
      href: "https://www.facebook.com/PalkaGolebiepl/",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactService.submitContactForm(formData);
      setShowSuccessModal(true);
      setFormData({ fullName: "", email: "", subject: "", message: "" });
    } catch (error) {
      setErrorMessage(
        "Nie udało się wysłać wiadomości. Spróbuj ponownie później.",
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      data-section="contact"
      ref={sectionRef}
      className="flex items-center py-24 md:py-32 text-foreground relative overflow-hidden"
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center mb-16"
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2
            ref={titleRef}
            className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-[0.18em] mb-8"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <span className="heading-black">Kontakt</span>
            {" – "}
            <span className="gold-heading">Porozmawiajmy o Mistrzach</span>
          </h2>
          <p
            ref={descRef}
            className="mt-6 text-lg md:text-xl text-white max-w-2xl mx-auto font-light leading-relaxed"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            Masz pytania lub chcesz dowiedzieć się więcej o naszej hodowli?
            Napisz lub zadzwoń!
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
          style={{
            perspective: "1500px",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <StyledContactCard info={info} index={index} />
                </div>
              ))}
            </div>
            <div
              ref={(el) => {
                cardsRef.current[4] = el;
              }}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <GoogleMapCard />
            </div>
          </div>
          <div
            ref={(el) => {
              cardsRef.current[5] = el;
            }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
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
        confirmButton={{
          text: "OK",
          onClick: () => setShowSuccessModal(false),
        }}
      />

      <UnifiedModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Błąd Wysyłania"
        message={errorMessage}
        confirmButton={{
          text: "Zamknij",
          onClick: () => setShowErrorModal(false),
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
    </section>
  );
};

export default React.memo(ContactSection);
