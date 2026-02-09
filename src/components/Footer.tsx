import React, { useRef, useEffect } from 'react';
import { Trophy, Facebook, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { iconMicro } from "@/components/motion";
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/PalkaGolebiepl/?locale=pl_PL", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const footerLinks = {
    company: [
      { name: 'O nas', href: '/#about' },
      { name: 'Kontakt', href: '/#contact' },
    ],
    services: [
      { name: 'Aukcje', href: '/auctions' },
      { name: 'Referencje', href: '/references' },
    ],
    legal: [
      { name: 'Regulamin', href: '/terms' },
      { name: 'Polityka Prywatności', href: '/privacy' },
      { name: 'Warunki Sprzedaży', href: '/sales-terms' },
    ],
  };

  useEffect(() => {
    // Global GSAP handles the cinema reveals via data-attributes
  }, []);

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative isolate overflow-hidden py-12 border-t border-white/15 text-white bg-black/60 backdrop-blur-sm"
      style={{ 
        perspective: '1200px',
        background: 'linear-gradient(180deg, hsl(230, 50%, 6%) 0%, hsl(230, 55%, 4%) 100%)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
        borderTopColor: 'rgba(212, 175, 55, 0.2)'
      }}
      data-section-reveal
    >
      <div className="container mx-auto px-4 relative z-10" data-stagger-container>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="footer-brand lg:col-span-2" style={{ transformStyle: 'preserve-3d' }} data-stagger-item>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display text-lg text-white font-semibold">
                  MTM Pałka
                </span>
                <span className="block text-xs text-gold uppercase tracking-widest">
                  Gołębie pocztowe
                </span>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-3 max-w-md">
              Witamy w świecie MTM Pałka – hodowli gołębi pocztowych, której fundamentem jest
              historia trzech pokoleń, a siłą napędową bezgraniczna miłość do lotu. W sercu Dolnego
              Śląska, pod niebem Lubania, od ponad czterdziestu pięciu lat piszemy sagę, w której
              precyzja genetyki łączy się z siłą rodzinnych więzi.
            </p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Mail size={16} className="text-gold" />
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
            <h4 className="font-display text-white font-semibold mb-3">
              Firma
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {link.href.startsWith('/#') ? (
                      <a href={link.href} className="text-white/85 hover:text-gold transition-colors text-sm">{link.name}</a>
                    ) : (
                      <Link to={link.href} className="text-white/85 hover:text-gold transition-colors text-sm">{link.name}</Link>
                    )}
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column" data-stagger-item>
            <h4 className="font-display text-white font-semibold mb-3">
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
                      className="text-white/85 hover:text-gold transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4" data-stagger-item>
          <p className="text-white/75 text-xs">
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
                  className="text-white/75 hover:text-gold transition-colors text-xs"
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
