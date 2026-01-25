import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Lokalizacja',
    value: 'Polska',
    description: 'Województwo Małopolskie',
  },
  {
    icon: Phone,
    label: 'Telefon',
    value: '+48 XXX XXX XXX',
    description: 'Pon-Pt: 8:00 - 18:00',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'kontakt@palkamtm.pl',
    description: 'Odpowiadamy w 24h',
  },
  {
    icon: Clock,
    label: 'Wizyty',
    value: 'Po umówieniu',
    description: 'Zapraszamy na gołębnik',
  },
];

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Kontakt
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 text-foreground">
            Porozmawiajmy
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Masz pytania dotyczące naszych gołębi lub hodowli? 
            Chętnie odpowiemy na wszystkie pytania.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 p-6 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="p-8 rounded-2xl bg-card/50 border border-border">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              Wyślij wiadomość
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  placeholder="Jan Kowalski"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  placeholder="jan@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Wiadomość
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Twoja wiadomość..."
                />
              </div>
              <Button variant="hero" size="lg" className="w-full">
                Wyślij wiadomość
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
