import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import AccountModal from './AccountModal';
import AdminModal from './AdminModal';

const Header = () => {
  const { user, profile, loading } = useAuth();
  const { locale, toggleLocale } = useLocale();
  const navigate = useNavigate();
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
  const isContactPage = location.pathname.startsWith('/contact');
  const isReferencesPage = location.pathname.startsWith('/references');
  const isOverlay = useMemo(() => !isScrolled && (isHomePage || isBreederPage || isAuctionsPage || isAchievementsPage || isContactPage || isReferencesPage), [isScrolled, isHomePage, isBreederPage, isAuctionsPage, isAchievementsPage, isContactPage, isReferencesPage]);
  const accountHref = user ? "/account" : "/auth";
  const displayName = profile?.display_name || user?.email || user?.phone || null;
  const showUserBadge = !!user;

  const navLinks = useMemo(() => {
    const baseLinks = [
      { label: "Start", href: "/#home" },
      { label: "Aukcje", href: "/auctions" },
      { label: "Osiągnięcia", href: "/achievements" },
      { label: "Championzy", href: "/champions" },
      { label: "Spotkania z hodowcami", href: "/breeder-meetings" },
      { label: "Referencje", href: "/references" },
      { label: "Prasa i media", href: "/press" },
      { label: "O nas", href: "/#about" },
      { label: "Kontakt", href: "/#contact" },
      { label: "Konto", href: accountHref },
    ];

    // Add admin link for admins
    if (profile?.role === 'ADMIN') {
      baseLinks.splice(baseLinks.length - 1, 0, { label: 'Panel admina', href: '/admin' });
    }

    return baseLinks;
  }, [profile?.role, accountHref]);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

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

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('openAccount') === '1') {
      if (user) {
        setShowAccountModal(true);
        params.delete('openAccount');
        navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
      } else {
        navigate('/auth?mode=login&callbackUrl=/account', { replace: true });
      }
    }
  }, [location.pathname, location.search, navigate, user, loading]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isOverlay
          ? "bg-transparent py-3"
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
          {navLinks.map((link) => {
            if (link.href === '/account') {
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    if (user) {
                      setShowAccountModal(true);
                    } else {
                      navigate('/auth?mode=login&callbackUrl=/account', { replace: true });
                    }
                  }}
                  className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary`}
                >
                  {link.label}
                </button>
              );
            }

            if (link.href === '/admin') {
              return (
                <button key={link.label} onClick={() => setShowAdminModal(true)} className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary`}>
                  {link.label}
                </button>
              );
            }

            return (
              <HashLink key={link.label} to={link.href} smooth className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary`}>
                {link.label}
              </HashLink>
            );
          })}
          {showUserBadge && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 border border-white/15" title="Jesteś zalogowany">
              {displayName || 'Zalogowany'}
            </span>
          )}
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-md border border-white/15 bg-black/30 px-2 py-1 text-xs font-semibold tracking-widest text-white/90 hover:bg-black/40"
            aria-label={locale === 'pl' ? 'Zmień język na angielski' : 'Switch language to Polish'}
          >
            {locale.toUpperCase()}
          </button>
          <ThemeToggle />
        </nav>

        <AccountModal open={showAccountModal} onClose={() => setShowAccountModal(false)} />
        <AdminModal open={showAdminModal} onClose={() => setShowAdminModal(false)} />

        <button
          className={`md:hidden p-2 text-white`}
          onClick={toggleMobileMenu}
          ref={mobileMenuButtonRef}
          aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
          aria-controls={mobileNavId}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-hero-gradient/95 backdrop-blur-md border-t border-primary/20">
          <nav id={mobileNavId} aria-label="Menu mobilne" className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              if (link.href === '/account' && user) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    className="text-left transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary"
                    onClick={() => {
                      setShowAccountModal(true);
                      closeMobileMenu();
                    }}
                    ref={link.label === navLinks[0]?.label ? (el) => {
                      firstMobileLinkRef.current = el as HTMLAnchorElement | null;
                    } : undefined}
                  >
                    {link.label}
                  </button>
                );
              }

              if (link.href === '/admin' && profile?.role === 'ADMIN') {
                return (
                  <button
                    key={link.label}
                    type="button"
                    className="text-left transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary"
                    onClick={() => {
                      setShowAdminModal(true);
                      closeMobileMenu();
                    }}
                  >
                    {link.label}
                  </button>
                );
              }

              return (
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
              );
            })}
            {showUserBadge && (
              <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 border border-white/15" title="Jesteś zalogowany">
                {displayName || 'Zalogowany'}
              </span>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default memo(Header);
