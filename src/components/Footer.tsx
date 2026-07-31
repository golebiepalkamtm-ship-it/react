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
      href: "https://www.facebook.com/PalkaGolebiepl/",
      label: "Facebook",
    },
    // Leaving out placeholders for now, unless you want them. User asked to add FB link.
  ];

  const footerLinks = {
    company: [
      { name: "O nas", href: "/#about" },
      { name: "Kontakt", href: "/#contact" },
    ],
    services: [
      { name: "Champions Pigeon Auction", href: "/auctions" },
      { name: "Referencje", href: "/references" },
    ],
    legal: [
      { name: "Regulamin", href: "/terms" },
      { name: "Polityka Prywatności", href: "/privacy" },
      { name: "Warunki Sprzedaży", href: "/sales-terms" },
    ],
  };

  useGSAP(
    () => {
      if (!footerRef.current) return;
      const columns = footerRef.current.querySelectorAll(".footer-column");
      const bottom = footerRef.current.querySelector(".footer-bottom");

      if (columns.length > 0) {
        gsap.fromTo(
          columns,
          { opacity: 0.2, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
            },
          },
        );
      }

      if (bottom) {
        gsap.fromTo(
          bottom,
          { opacity: 0.2, scaleX: 0.95 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
            },
          },
        );
      }
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative isolate overflow-hidden py-8 border-t border-[#A68E4E]/30 shadow-[0_-24px_60px_rgba(0,0,0,0.6)] text-zinc-400"
      style={{
        background:
          "radial-gradient(circle at top, rgba(66, 192, 206, 0.15), transparent 70%), linear-gradient(185deg, rgba(2, 10, 19, 0.98) 0%, rgba(6, 35, 46, 0.95) 45%, rgba(9, 61, 77, 0.92) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Bardziej subtelna złota linia i poświata */}
      <div className="absolute top-0 left-0 w-full h-[15px] bg-gradient-to-b from-[#A68E4E]/40 to-transparent pointer-events-none opacity-90" />
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-[#A68E4E] shadow-[0_0_20px_rgba(166,142,78,0.8)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 mb-6 items-start">
          {/* Brand - Left */}
          <div className="lg:col-span-5 footer-column">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#A68E4E] flex items-center justify-center shadow-xl shadow-gold/10">
                <Trophy className="w-6 h-6 text-zinc-950" />
              </div>
              <div>
                <h3 className="font-display text-xl text-zinc-900 font-bold uppercase tracking-tighter">
                  MTM Pałka
                </h3>
                <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">
                  Heritage since 1979
                </p>
              </div>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4 max-w-md font-light">
              Trzy pokolenia pasji, setki sukcesów i bezgraniczna miłość do
              lotu. Dostarczamy elitarne gołębie pocztowe hodowcom na całym
              świecie.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <Mail size={14} className="text-gold" />
                <span>kontakt@palkamtm.pl</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#A68E4E] hover:border-[#A68E4E]/50 hover:bg-[#A68E4E]/10 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Column - Middle/Left */}
          <div className="lg:col-span-2 footer-column pt-1 lg:pt-0">
            <ul className="space-y-2">
              {[...footerLinks.company, ...footerLinks.services].map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("/#") ? (
                    <a
                      href={link.href}
                      className="text-zinc-500 hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-zinc-500 hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Disclaimer - Right */}
          <div className="lg:col-span-5 footer-column lg:text-right">
            <p className="text-zinc-600 text-[10px] leading-relaxed font-light uppercase tracking-wider max-w-md lg:ml-auto">
              Serwis palkamtm.pl ma charakter wyłącznie reklamowo-informacyjny.
              Prezentowane opisy i rodowody gołębi nie stanowią gwarancji ich
              przyszłych wyników lotowych ani rozpłodowych. Serwis jest
              skierowany wyłącznie do profesjonalnych hodowców, a sprzedaż
              realizowana jest na zasadach B2B (z wyłączeniem rękojmi). Ryzyko
              transportu żywych zwierząt ponosi wyłącznie kupujący.
            </p>
          </div>
        </div>

        {/* Legal Links & Copyright - Full Width Bottom */}
        <div className="footer-bottom mt-2 pt-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest text-center md:text-left font-bold">
            © 2025 MTM Pałka. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[#A68E4E]/60 hover:text-gold transition-colors text-[10px] md:text-xs font-bold uppercase tracking-widest"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
