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
import { useGSAP } from "@gsap/react";

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

  useGSAP(() => {
    // 1. Initial States
    gsap.set(".footer-column", { opacity: 0, y: 50, filter: "blur(5px)" });
    gsap.set(".footer-bottom", { opacity: 0, scaleX: 0.9, filter: "blur(5px)" });

    // 2. Animation Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      }
    });

    tl.to(".footer-column", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      clearProps: "filter, opacity, transform" // Usunięcie filtrów po zakończeniu
    })
    .to(".footer-bottom", {
      opacity: 1,
      scaleX: 1,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "expo.out",
      clearProps: "filter, opacity, transform" // Usunięcie filtrów po zakończeniu
    }, "-=0.6");

  }, { scope: footerRef });

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative isolate overflow-hidden py-24 border-t border-gold/30 bg-champion-teal text-zinc-400"
    >
      {/* Ekstremalnie mocna złota linia i poświata */}
      <div className="absolute top-0 left-0 w-full h-[40px] bg-gradient-to-b from-[#A68E4E]/70 to-transparent pointer-events-none opacity-90" />
      <div className="absolute top-0 left-0 w-full h-[4px] bg-[#A68E4E] shadow-[0_0_60px_rgba(166,142,78,1),0_0_120px_rgba(166,142,78,0.4)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2 footer-column">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#A68E4E] flex items-center justify-center shadow-xl shadow-gold/10">
                <Trophy className="w-7 h-7 text-zinc-950" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-zinc-900 font-bold uppercase tracking-tighter">
                  MTM Pałka
                </h3>
                <p className="text-xs text-gold font-bold uppercase tracking-[0.3em]">
                  Heritage since 1979
                </p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-md font-light">
              Trzy pokolenia pasji, setki sukcesów i bezgraniczna miłość do
              lotu. Dostarczamy elitarne gołębie pocztowe hodowcom na całym
              świecie.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <Mail size={18} className="text-gold" />
                <span>kontakt@palkamtm.pl</span>
              </div>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="font-display text-[#A68E4E] font-bold uppercase tracking-widest text-sm mb-8">
              Firma
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("/#") ? (
                    <a
                      href={link.href}
                      className="text-zinc-500 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-zinc-500 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="font-display text-[#A68E4E] font-bold uppercase tracking-widest text-sm mb-8">
              Usługi
            </h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-zinc-500 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 footer-bottom">
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
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
