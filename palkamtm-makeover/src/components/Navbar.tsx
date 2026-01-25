import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const navLinks = [
  { name: 'Start', href: '#hero' },
  { name: 'O nas', href: '#about' },
  { name: 'Osiągnięcia', href: '#achievements' },
  { name: 'Hodowla', href: '#breeding' },
  { name: 'Kontakt', href: '#contact' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass-dark py-3' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <span className="font-display font-bold text-primary-foreground text-lg">P</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              Pałka M.T.M.
            </span>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Mistrzowie Sprintu
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 tracking-wide"
            >
              {link.name}
            </a>
          ))}
          <Link to="/auth">
            <Button variant="hero" size="sm">
              Konto
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-dark mt-3 mx-4 rounded-lg p-6 animate-fade-up">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="hero" className="mt-4 w-full">
                Konto
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
