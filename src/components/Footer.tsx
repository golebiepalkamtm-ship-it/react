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

  // GSAP Premium animations with scrub
  useEffect(() => {
    if (!footerRef.current) return;
    
    const footer = footerRef.current;
    const brand = footer.querySelector('.footer-brand');
    const columns = footer.querySelectorAll('.footer-column');
    const socialIcons = footer.querySelectorAll('.social-icon');
    const bottomBar = footer.querySelector('.footer-bottom');
    
    const ctx = gsap.context(() => {
      // Main timeline with smooth scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: 'top 90%',
          end: 'top 30%',
          scrub: 1.5,
          invalidateOnRefresh: true,
          refreshPriority: -4,
        }
      });

      // Brand section - smooth slide from left
      if (brand) {
        tl.fromTo(brand,
          { 
            x: -100, 
            opacity: 0, 
            scale: 0.9
          },
          { 
            x: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.4, 
            ease: 'expo.out'
          }
        );
      }

      // Columns - cascade with stagger
      if (columns.length > 0) {
        tl.fromTo(columns,
          { 
            y: 60, 
            opacity: 0, 
            scale: 0.95
          },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.3, 
            ease: 'expo.out',
            stagger: 0.1
          },
          '-=0.2'
        );
      }

      // Social icons - smooth fade in
      if (socialIcons.length > 0) {
        tl.fromTo(socialIcons,
          { 
            y: 30,
            opacity: 0, 
          },
          { 
            y: 0,
            opacity: 1, 
            duration: 0.3, 
            ease: 'expo.out',
            stagger: 0.08
          },
          '-=0.15'
        );
      }

      // Bottom bar - slide up with fade
      if (bottomBar) {
        tl.fromTo(bottomBar,
          { 
            y: 30, 
            opacity: 0 
          },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.3, 
            ease: 'power2.out'
          },
          '-=0.1'
        );
      }
      
    }, footer);
    
    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative isolate overflow-hidden py-6 border-t border-white/15 text-white bg-black/60 backdrop-blur-sm"
      style={{ perspective: '1200px' }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="footer-brand lg:col-span-2 opacity-0" style={{ transformStyle: 'preserve-3d' }}>
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
                  className="social-icon w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm flex items-center justify-center text-white/85 hover:text-gold hover:bg-gold/10 transition-all duration-300 opacity-0"
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
          <div className="footer-column opacity-0">
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
          <div className="footer-column opacity-0">
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

        <div className="footer-bottom pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-0">
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
