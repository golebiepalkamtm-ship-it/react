import { Trophy, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Auctions", href: "#auctions" },
    { label: "Achievements", href: "#achievements" },
    { label: "Contact", href: "#contact" },
  ];

  const services = [
    "Live Auctions",
    "Breeding Consultation",
    "Pigeon Training",
    "Bloodline Selection",
    "Loft Tours",
  ];

  return (
    <footer className="bg-navy py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Trophy className="w-5 h-5 text-navy" />
              </div>
              <div>
                <span className="font-display text-lg text-primary-foreground font-semibold">
                  Polish Champion
                </span>
                <span className="block text-xs text-gold uppercase tracking-widest">
                  Racing Pigeons
                </span>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6">
              Breeding excellence since 1998. Home to Poland's finest racing
              pigeons and proud partners of national champions.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-navy-light flex items-center justify-center text-primary-foreground/60 hover:text-gold hover:bg-gold/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-primary-foreground font-semibold mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/60 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-primary-foreground font-semibold mb-6">
              Our Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-primary-foreground/60 text-sm">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-primary-foreground font-semibold mb-6">
              Stay Updated
            </h4>
            <p className="text-primary-foreground/60 text-sm mb-4">
              Get notified about new auctions and exclusive birds.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-4 py-2 rounded-lg bg-navy-light border border-gold/20 focus:border-gold outline-none text-primary-foreground text-sm placeholder:text-primary-foreground/40"
              />
              <button className="px-4 py-2 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold-light transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-sm">
            © {currentYear} Polish Champion Racing Pigeons. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-primary-foreground/40 hover:text-gold transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-primary-foreground/40 hover:text-gold transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-primary-foreground/40 hover:text-gold transition-colors"
            >
              Auction Rules
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
