import React from 'react';
import { Trophy, Facebook, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal, StaggeredList, fadeInUp, iconMicro } from "@/components/motion";
import { motion } from "framer-motion";

const Footer = () => {

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/PalkaGolebiepl/?locale=pl_PL", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const footerLinks = {
    company: [
      { name: 'O nas', href: '/#about' },
      { name: 'Nasze Osiągnięcia', href: '/achievements' },
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

  return (
    <footer className="relative isolate overflow-hidden py-6 border-t border-white/15 text-white bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 relative z-10">
        <Reveal variants={fadeInUp}>
          <StaggeredList 
            staggerDelay={0.1}
            delayChildren={0.1}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
          >
            {/* Brand */}
            <div className="lg:col-span-2">
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
                    className="w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm flex items-center justify-center text-white/85 hover:text-gold hover:bg-gold/10 transition-all duration-300"
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

            {/* Quick Links */}
            <div>
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

            {/* Services */}
            <div>
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
          </StaggeredList>
        </Reveal>

        <Reveal variants={fadeInUp} delay={0.2}>
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p 
              className="text-white/75 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              © 2025 MTM Pałka. Wszystkie prawa zastrzeżone.
            </motion.p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <div key={link.name}>
                  <motion.div
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
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
