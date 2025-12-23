import { useState, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
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
    { label: "Kontakt", href: "/contact" },
    { label: "Rejestracja", href: "/register" },
    { label: "Logowanie", href: "/login" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-navy/90 backdrop-blur-lg shadow-lg py-3"
          : "bg-linear-to-b from-navy/95 via-navy/50 to-transparent py-8"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <RouterLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold to-gold-light flex items-center justify-center">
            <span className="font-display font-bold text-lg text-navy">M</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-display text-lg font-semibold tracking-wide ${isOverlay ? 'text-white' : 'text-primary-foreground'}`}>
              MTM Pałka
            </span>
            <span className={`text-xs uppercase tracking-widest ${isOverlay ? 'text-white/80' : 'text-gold'}`}>
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
              className={`transition-colors duration-300 text-sm font-medium tracking-wide ${isOverlay ? 'text-white/90 hover:text-amber-300' : 'text-primary-foreground/80 hover:text-gold'}`}
            >
              {link.label}
            </HashLink>
          ))}
        </nav>

        <button
          className={`md:hidden p-2 ${isOverlay ? 'text-white' : 'text-primary-foreground'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-navy/98 backdrop-blur-md border-t border-gold/10">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <HashLink 
                key={link.label} 
                to={link.href} 
                smooth 
                className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-amber-300" 
                onClick={() => setIsMobileMenuOpen(false)}
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

export default Header;
