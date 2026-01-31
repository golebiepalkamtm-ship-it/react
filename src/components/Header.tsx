import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import UserPanel from './UserPanel';
import AdminPanel from './AdminPanel';
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { fadeInDown, iconMicro } from "@/components/motion";

const Header = () => {
  const { user, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isHeaderAdminPanelOpen, setIsHeaderAdminPanelOpen] = useState(false);
  
  // Debug log
  useEffect(() => {
    if (isHeaderAdminPanelOpen) {
      console.log('🔍 Header: Admin Modal OPENED');
      console.trace('🔍 Stack trace for Admin Modal open:');
    }
  }, [isHeaderAdminPanelOpen]);
  
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLElement | null>(null);
  const mobileNavId = "mobile-nav";
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleShowUserPanel = () => setShowAccountModal(true);
    window.addEventListener('showUserPanel', handleShowUserPanel);
    return () => window.removeEventListener('showUserPanel', handleShowUserPanel);
  }, []);

  useEffect(() => {
    if (location.state?.openAccount) {
      // Odłóż ustawienie stanu na mikro-tick, aby uniknąć ostrzeżenia lintra o setState w efekcie
      setTimeout(() => setShowAccountModal(true), 0);
      if (location.state?.showVerificationSuccess) {
        setTimeout(() => {
           toast.success("Email zweryfikowany pomyślnie!", {
             description: "Prosimy o uzupełnienie danych profilowych, aby móc w pełni korzystać z serwisu.",
             duration: 5000,
           });
        }, 500);
      }
      // Wyczyść state nawigacji zgodnie z API React Router
      navigate(".", { replace: true, state: undefined });
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = location.pathname === "/";
  const isBreederPage = location.pathname.startsWith('/breeder-meetings');
  const isAuctionsPage = location.pathname.startsWith('/auctions');
  const isContactPage = location.pathname.startsWith('/contact');
  const isReferencesPage = location.pathname.startsWith('/references');
  const isOverlay = useMemo(() => !isScrolled && (isHomePage || isBreederPage || isAuctionsPage || isContactPage || isReferencesPage), [isScrolled, isHomePage, isBreederPage, isAuctionsPage, isContactPage, isReferencesPage]);
  const accountHref = user ? "/account" : "/auth";

  const navLinks = useMemo(() => {
    const baseLinks = [
      { label: "Start", href: "/#home" },
      { label: "Aukcje", href: "/auctions" },
      { label: "Championy", href: "/champions" },
      { label: "Historia", href: "/achievements" },
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

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const scrollToAnchor = useCallback((anchor: string) => {
    if (location.pathname !== '/') {
      window.location.assign(`/#${anchor}`);
      return;
    }

    // dla "home" jedziemy na samą górę
    if (anchor === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMobileMenu();
      return;
    }

    const el = document.getElementById(anchor);
    if (el) {
      const headerHeight = headerRef.current?.offsetHeight ?? 88;
      const isAbout = anchor === 'about';
      // About potrzebuje mocnego ujemnego offsetu (sekcja pinowana); reszta standardowy offset
      const safeOffset = isAbout ? -(headerHeight + 520) : headerHeight + 32;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - safeOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }

    closeMobileMenu();
  }, [closeMobileMenu, location.pathname]);

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

  const ariaExpanded: 'true' | 'false' = isMobileMenuOpen ? 'true' : 'false';

  // Efekt podświetlenia dla tła nagłówka
  const headerGlowX = useMotionValue(0);
  const headerGlowY = useMotionValue(0);
  const headerGlowOpacity = useMotionValue(0);
  
  // Cache header dimensions to avoid layout thrashing on mousemove
  const headerRectRef = useRef<DOMRect | null>(null);

  const handleHeaderMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    headerRectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleHeaderMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = headerRectRef.current || e.currentTarget.getBoundingClientRect();
    if (!headerRectRef.current) headerRectRef.current = rect;
    
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    headerGlowX.set(x);
    headerGlowY.set(y);
    headerGlowOpacity.set(0.15);
  };
  
  const handleHeaderMouseLeave = () => {
    headerGlowOpacity.set(0);
    headerRectRef.current = null; // Clear cache on leave
  };

  const setAdminModalWithTrace = (value: boolean) => {
    if (value) {
      console.group('🔍 Header: Opening Admin Modal');
      console.log('Value:', value);
      console.trace('Stack trace:');
      console.groupEnd();
    }
    setIsHeaderAdminPanelOpen(value);
  };

  return (
    <motion.header
      ref={headerRef}
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
      onMouseEnter={handleHeaderMouseEnter}
      onMouseMove={handleHeaderMouseMove}
      onMouseLeave={handleHeaderMouseLeave}
      className={`fixed top-0 left-0 right-0 z-[500] transition-all duration-500 ${
        isOverlay
          ? "bg-transparent py-0"
          : "bg-hero-gradient/90 backdrop-blur-lg shadow-lg py-0"
      }`}
    >
      {/* Efekt podświetlenia dla nagłówka */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [headerGlowX, headerGlowY, headerGlowOpacity],
            ([x, y, o]) => `radial-gradient(circle at ${x as number * 100}% ${y as number * 100}%, rgba(212, 175, 55, ${o as number}), transparent 30%)`
          ),
          opacity: headerGlowOpacity
        }}
      />
      <div className="container mx-auto px-4 flex items-center justify-between">
        <motion.div
          variants={iconMicro}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <RouterLink to="/" className="flex items-center gap-4 group relative">
            <motion.div 
              className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center relative z-10"
              whileHover={{
                boxShadow: ["0 0 0 0 rgba(212,175,55,0)", "0 0 20px 5px rgba(212,175,55,0.5)", "0 0 0 0 rgba(212,175,55,0)"],
                transition: { duration: 1.5, repeat: Infinity }
              }}
            >
              <motion.span 
                className="font-display font-bold text-lg text-white"
                animate={{ 
                  textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 10px rgba(255,255,255,0.8)", "0 0 0px rgba(255,255,255,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                M
              </motion.span>
            </motion.div>
            <div className="flex flex-col">
              <motion.span 
                className={`font-display text-lg md:text-xl font-semibold tracking-wide text-white`}
                initial={{ backgroundPosition: "0% 50%" }}
                whileHover={{
                  backgroundImage: "linear-gradient(90deg, #ffffff, #D4AF37, #ffffff)",
                  backgroundSize: "200% 100%",
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  transition: { duration: 1.5, repeat: Infinity }
                }}
                style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                MTM Pałka
              </motion.span>
              <span className="text-xs uppercase tracking-widest text-white/80">
                Gołębie pocztowe
              </span>
            </div>
            
            {/* Efekt cząsteczek */}
            <AnimatePresence>
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-gold/80"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0.5],
                    x: [0, (i - 1) * 15],
                    y: [0, -10 - i * 5]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.2, 
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              ))}
            </AnimatePresence>
          </RouterLink>
        </motion.div>

        <motion.nav 
          className="hidden md:flex items-center gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0.1 }
            }
          }}
        >
          {navLinks.map((link, index) => {
            if (link.href === '/account') {
              return (
                <motion.button 
                  key={link.label} 
                  onClick={() => setShowAccountModal(true)} 
                  className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary relative overflow-hidden group`}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <span className="relative z-10">{link.label}</span>
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-gold"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gold/10 rounded-md pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              );
            }
            if (link.href === '/admin') {
              return (
                <motion.button 
                  key={link.label} 
                  onClick={() => setAdminModalWithTrace(true)} 
                  className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary relative overflow-hidden group`}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <span className="relative z-10">{link.label}</span>
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-gold"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gold/10 rounded-md pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              );
            }
            return (
              <motion.div
                key={link.label}
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {link.href.startsWith('/#') ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const anchor = link.href.split('#')[1];
                      scrollToAnchor(anchor);
                    }}
                    className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <RouterLink to={link.href} className={`transition-colors duration-300 text-sm font-medium tracking-wide text-white/90 hover:text-primary relative overflow-hidden group`}>
                    <span className="relative z-10">{link.label}</span>
                    <motion.span 
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-gold"
                      initial={{ scaleX: 0, originX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gold/10 rounded-md pointer-events-none"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </RouterLink>
                )}
              </motion.div>
            );
          })}
          
          {/* User Status Diode - only for logged in users */}
          {user && profile && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex items-center"
            >
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="relative group p-2 rounded-full hover:bg-white/5 transition-colors"
                title={`Status: ${
                  profile.role === 'ADMIN' ? 'Administrator' :
                  profile.role === 'USER_FULL_VERIFIED' ? 'Konto zweryfikowane' :
                  profile.role === 'USER_EMAIL_VERIFIED' ? 'Uzupełnij profil i zweryfikuj telefon' :
                  'Zweryfikuj adres email'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {/* Diode Background Glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute w-3 h-3 rounded-full blur-[2px] ${
                      profile.role === 'ADMIN' ? 'bg-purple-500' :
                      profile.role === 'USER_FULL_VERIFIED' ? 'bg-green-500' :
                      profile.role === 'USER_EMAIL_VERIFIED' ? 'bg-gold' :
                      'bg-amber-500'
                    }`}
                  />
                  {/* Main Diode */}
                  <div className={`relative w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                    profile.role === 'ADMIN' ? 'bg-purple-400' :
                    profile.role === 'USER_FULL_VERIFIED' ? 'bg-green-400' :
                    profile.role === 'USER_EMAIL_VERIFIED' ? 'bg-gold' :
                    'bg-amber-400'
                  }`} />
                </div>
                
                {/* Tooltip hint on hover */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {profile.role === 'ADMIN' ? 'Admin' :
                   profile.role === 'USER_FULL_VERIFIED' ? 'Zweryfikowany' :
                   profile.role === 'USER_EMAIL_VERIFIED' ? 'Uzupełnij profil' :
                   'Zweryfikuj email'}
                </span>
              </button>
            </motion.div>
          )}
        </motion.nav>

        <AnimatePresence>
          {showAccountModal && (
            <UserPanel onClose={() => setShowAccountModal(false)} />
          )}
          {isHeaderAdminPanelOpen && (
            <AdminPanel 
              key="admin-panel" 
              isOpen={true} 
              onClose={() => setAdminModalWithTrace(false)} 
            />
          )}
        </AnimatePresence>

        <motion.button
          className="md:hidden p-2 text-white relative"
          onClick={toggleMobileMenu}
          ref={mobileMenuButtonRef}
          aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={ariaExpanded}
          aria-controls={mobileNavId}
          variants={iconMicro}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div 
            className="absolute inset-0 rounded-full bg-gold/20"
            initial={{ scale: 0, opacity: 0 }}
            animate={isMobileMenuOpen ? 
              { scale: [0, 1.2, 1], opacity: [0, 0.6, 0.2] } : 
              { scale: 0, opacity: 0 }
            }
            transition={{ duration: 0.4 }}
          />
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden absolute top-full left-0 right-0 bg-hero-gradient border-t border-primary/20"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ 
              duration: 0.4,
              height: { duration: 0.4, type: "spring", stiffness: 500, damping: 30 }
            }}
          >
            <motion.nav 
              id={mobileNavId} 
              aria-label="Menu mobilne" 
              className="container mx-auto px-4 py-6 flex flex-col gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                }
              }}
            >
              {navLinks.map((link) => {
                if (link.href === '/account') {
                  return (
                    <motion.button
                      key={link.label}
                      className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary text-left"
                      onClick={() => {
                        setShowAccountModal(true);
                        closeMobileMenu();
                      }}
                      ref={link.label === navLinks[0]?.label ? (el: HTMLElement | null) => {
                        firstMobileLinkRef.current = el;
                      } : undefined}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.button>
                  );
                }
                if (link.href === '/admin') {
                  return (
                    <motion.button
                      key={link.label}
                      className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary text-left"
                      onClick={() => {
                        setAdminModalWithTrace(true);
                        closeMobileMenu();
                      }}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.button>
                  );
                }
                return (
                  <motion.div
                    key={link.label}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.href.startsWith('/#') ? (
                      <a
                        href={link.href}
                        className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary block"
                        onClick={(e) => {
                          e.preventDefault();
                          const anchor = link.href.split('#')[1];
                          scrollToAnchor(anchor);
                        }}
                        ref={link.label === navLinks[0]?.label ? (el: HTMLElement | null) => {
                          firstMobileLinkRef.current = el;
                        } : undefined}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <RouterLink
                        to={link.href}
                        className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary block"
                        onClick={closeMobileMenu}
                        ref={link.label === navLinks[0]?.label ? (el: HTMLElement | null) => {
                          firstMobileLinkRef.current = el;
                        } : undefined}
                      >
                        {link.label}
                      </RouterLink>
                    )}
                  </motion.div>
                );
              })}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default memo(Header);
