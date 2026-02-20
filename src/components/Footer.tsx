import React, { useRef, useEffect } from "react";
import {
  Trophy,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { iconMicro } from "@/components/motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/PalkaGolebiepl/?locale=pl_PL",
      label: "Facebook",
    },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const footerLinks = {
    company: [
      { name: "O nas", href: "/#about" },
      { name: "Kontakt", href: "/#contact" },
    ],
    services: [
      { name: "Aukcje", href: "/auctions" },
      { name: "Referencje", href: "/references" },
    ],
    legal: [
      { name: "Regulamin", href: "/terms" },
      { name: "Polityka Prywatności", href: "/privacy" },
      { name: "Warunki Sprzedaży", href: "/sales-terms" },
    ],
  };

  useEffect(() => {
    // Global GSAP handles the cinema reveals via data-attributes
  }, []);

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative isolate overflow-hidden py-32 border-t-[8px] border-[#D4AF37] text-[#D4AF37]"
      style={{
        perspective: "1200px",
        background:
          "linear-gradient(135deg, #D4AF37 0%, #1A1A1A 50%, #000000 100%)",
      }}
      data-section-reveal
    >
      {/* Ekstremalnie mocna złota linia i poświata */}
      <div className="absolute top-0 left-0 w-full h-[40px] bg-gradient-to-b from-[#D4AF37]/70 to-transparent pointer-events-none blur-3xl opacity-80" />
      <div className="absolute top-0 left-0 w-full h-[4px] bg-[#D4AF37] shadow-[0_0_60px_rgba(212,175,55,1),0_0_120px_rgba(212,175,55,0.4)]" />

      <div
        className="container mx-auto px-4 relative z-10"
        data-stagger-container
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div
            className="footer-brand lg:col-span-2"
            style={{ transformStyle: "preserve-3d" }}
            data-stagger-item
          >
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#A68E4E] flex items-center justify-center shadow-lg shadow-gold/30">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="font-display text-lg text-[#A68E4E] font-bold uppercase tracking-tight">
                  MTM Pałka
                </span>
                <span className="block text-xs text-[#A68E4E]/80 font-bold uppercase tracking-widest">
                  Gołębie pocztowe
                </span>
              </div>
            </div>
            <p className="text-[#A68E4E]/90 text-sm leading-relaxed mb-4 max-w-md font-light">
              Witamy w świecie MTM Pałka – hodowli gołębi pocztowych, której
              fundamentem jest historia trzech pokoleń, a siłą napędową
              bezgraniczna miłość do lotu.
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-[#A68E4E]/80 text-sm font-medium">
                <Mail size={16} className="text-[#A68E4E]" />
                <span>kontakt@palkamtm.pl</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm flex items-center justify-center text-white/85 hover:text-gold hover:bg-gold/10 transition-all duration-300"
                  aria-label={social.label}
                  variants={iconMicro}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="footer-column" data-stagger-item>
            <h4 className="font-display text-[#A68E4E] font-semibold mb-3">
              Firma
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {link.href.startsWith("/#") ? (
                      <a
                        href={link.href}
                        className="text-[#A68E4E]/80 hover:text-[#A68E4E] transition-colors text-sm font-light uppercase tracking-widest"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-white/70 hover:text-white transition-colors text-sm font-light uppercase tracking-widest"
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column" data-stagger-item>
            <h4 className="font-display text-[#A68E4E] font-semibold mb-3">
              Usługi
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      to={link.href}
                      className="text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-sm font-light uppercase tracking-widest"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="footer-bottom pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
          data-stagger-item
        >
          <p className="text-[#A68E4E]/60 text-xs text-center md:text-left">
            © 2025 MTM Pałka. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <motion.div
                key={link.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={link.href}
                  className="text-[#A68E4E]/60 hover:text-[#A68E4E] transition-colors text-xs"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
