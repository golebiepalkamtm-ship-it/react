import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: "Location",
      value: "Kraków, Poland",
      detail: "Visit our loft by appointment",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+48 123 456 789",
      detail: "Mon-Sat, 8AM-6PM",
    },
    {
      icon: Mail,
      label: "Email",
      value: "info@polishchampion.pl",
      detail: "We respond within 24 hours",
    },
    {
      icon: Clock,
      label: "Visiting Hours",
      value: "By Appointment",
      detail: "Schedule a loft tour",
    },
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wide mb-6">
            Get In Touch
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
            Start Your
            <span className="text-gradient-gold"> Journey</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ready to acquire championship bloodlines? Have questions about our birds?
            We're here to help you find the perfect addition to your loft.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="p-8 rounded-2xl bg-card border border-border shadow-lg">
            <h3 className="font-display text-2xl text-foreground font-semibold mb-6">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
                    placeholder="jan@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground"
                  placeholder="Inquiry about auctions"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground resize-none"
                  placeholder="Tell us about your interest in our pigeons..."
                  required
                />
              </div>
              <Button variant="gold" size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="group flex items-start gap-5 p-6 rounded-2xl bg-card border border-border hover:border-gold/30 transition-all duration-300 hover-lift"
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
              </div>
            ))}

            {/* Map Placeholder */}
            <div className="h-64 rounded-2xl overflow-hidden border border-border bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gold mx-auto mb-3 animate-pulse-soft" />
                <p className="text-foreground font-semibold">Kraków, Poland</p>
                <p className="text-muted-foreground text-sm">
                  Schedule a visit to our world-class facility
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
