import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);
  const mobileNavId = "mobile-nav";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isBreederPage = location.pathname.startsWith('/breeder-meetings');
  const isAuctionsPage = location.pathname.startsWith('/auctions');
  const isAchievementsPage = location.pathname.startsWith('/achievements');
  const isChampionsPage = location.pathname.startsWith('/champions');
  const isContactPage = location.pathname.startsWith('/contact');
  const isReferencesPage = location.pathname.startsWith('/references');
  const isOverlay = !isScrolled && (isHomePage || isBreederPage || isAuctionsPage || isAchievementsPage || isChampionsPage || isContactPage || isReferencesPage);

  const navLinks = [
    { label: "Start", href: "/#home" },
    { label: "Aukcje", href: "/auctions" },
    { label: "Championy", href: "/champions" },
    { label: "Osiągnięcia", href: "/achievements" },
    { label: "Spotkania z hodowcami", href: "/breeder-meetings" },
    { label: "Referencje", href: "/references" },
    { label: "Prasa i media", href: "/press" },
    { label: "O nas", href: "/#about" },
    { label: "Kontakt", href: "/#contact" },
    { label: "Rejestracja", href: "/register" },
    { label: "Logowanie", href: "/login" },
  ];

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      firstMobileLinkRef.current?.focus();
      return;
    }

    mobileMenuButtonRef.current?.focus();
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isOverlay
          ? "bg-transparent py-6"
          : "bg-hero-gradient/90 backdrop-blur-lg shadow-lg py-3"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <RouterLink to="/" className="flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-gold to-gold-light flex items-center justify-center">
            <span className="font-display font-bold text-lg text-white">M</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-display text-lg md:text-xl font-semibold tracking-wide text-white`}>
              MTM Pałka
            </span>
            <span className="text-xs uppercase tracking-widest text-white/80">
              Gołębie pocztowe
            </span>
          </div>
        </RouterLink>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <HashLink 
              key={link.label} 
              to={link.href} 
              smooth 
              className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary`}
            >
              {link.label}
            </HashLink>
          ))}
          <ThemeToggle />
        </nav>

        <button
          className={`md:hidden p-2 text-white`}
          onClick={toggleMobileMenu}
          ref={mobileMenuButtonRef}
          aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls={mobileNavId}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-hero-gradient/95 backdrop-blur-md border-t border-primary/20">
          <nav id={mobileNavId} aria-label="Menu mobilne" className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <HashLink 
                key={link.label} 
                to={link.href} 
                smooth 
                className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary" 
                onClick={closeMobileMenu}
                ref={link.label === navLinks[0]?.label ? (el) => {
                  firstMobileLinkRef.current = el;
                } : undefined}
              >
                {link.label}
              </HashLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default memo(Header);
