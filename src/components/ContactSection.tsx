import { MapPin, Phone, Mail, Clock, Send, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contactService";
import { motion } from 'framer-motion';

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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
    <motion.section
      id="contact"
      className="pt-20 pb-24 section-surface-alt"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-140px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Kontakt
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
            Skontaktuj się
            <span className="text-gradient-gold"> z nami</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chcesz nabyć gołębie z mistrzowskich linii? Masz pytania dotyczące naszej hodowli?
            Jesteśmy tutaj, aby pomóc Ci znaleźć idealne ptaki do Twojego gołębnika.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            className="p-8 rounded-2xl bg-card border border-border shadow-lg"
            initial={{ opacity: 0, x: -18, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
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
              <Button variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-120px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {contactInfo.map((info) => (
              <motion.div
                key={info.label}
                className="group flex items-start gap-5 p-6 rounded-2xl bg-card border border-border hover:border-gold/30 transition-all duration-300 hover-lift"
                variants={{
                  hidden: { opacity: 0, y: 18, scale: 0.99 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <info.icon className="w-6 h-6 text-gold" />
                </div>
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
            ))}

            {/* Google Maps */}
            <motion.div
              className="rounded-2xl overflow-hidden border border-border shadow-lg"
              variants={{
                hidden: { opacity: 0, y: 18, scale: 0.99 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              <div className="h-64">
                <iframe
                  src="https://maps.google.com/maps?q=ul.+Stawowa+6,+59-800+Lubań,+Poland&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa hodowli MTM Pałka - ul. Stawowa 6, Lubań"
                />
              </div>
              <div className="p-4 bg-card flex flex-col sm:flex-row gap-3">
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
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;
