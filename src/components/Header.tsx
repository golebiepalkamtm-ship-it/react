import { useState, useEffect, useCallback, memo, useRef, useMemo, lazy, Suspense } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Gavel,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const UserPanel = lazy(() => import("./UserPanel"));
const AdminPanel = lazy(() => import("./AdminPanel"));
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { fadeInDown, iconMicro } from "@/components/motion";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { NotificationModal } from "@/components/NotificationModal";
import { notificationService } from "@/services/notificationService";

const Header = () => {
  const { user, profile, session } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerControls = useAnimation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isHeaderAdminPanelOpen, setIsHeaderAdminPanelOpen] = useState(false);
  const [verificationSuccessModalOpen, setVerificationSuccessModalOpen] =
    useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Debug log
  useEffect(() => {
    if (isHeaderAdminPanelOpen) {
      console.log("🔍 Header: Admin Modal OPENED");
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
    window.addEventListener("showUserPanel", handleShowUserPanel);
    return () =>
      window.removeEventListener("showUserPanel", handleShowUserPanel);
  }, []);

  const fetchUnreadCount = useCallback(() => {
    if (user && session?.access_token) {
      notificationService
        .getUnreadNotifications(session.access_token)
        .then((notes) =>
          setUnreadCount(Array.isArray(notes) ? notes.length : 0),
        )
        .catch((err) => {
          console.error("Failed to fetch unread count", err);
          setUnreadCount(0);
        });
    }
  }, [user, session]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount, showNotificationModal]);

  const shouldOpenFromLocation = Boolean(location.state?.openAccount);
  const needsFullVerification = Boolean(location.state?.needsFullVerification);
  const shouldShowVerificationFromLocation = Boolean(
    location.state?.showVerificationSuccess,
  );
  const isAccountModalOpen =
    showAccountModal ||
    (shouldOpenFromLocation && !shouldShowVerificationFromLocation) ||
    needsFullVerification;
  const isVerificationModalOpen =
    verificationSuccessModalOpen ||
    (shouldOpenFromLocation && shouldShowVerificationFromLocation);

  useEffect(() => {
    if (shouldOpenFromLocation || needsFullVerification) {
      navigate(".", { replace: true, state: undefined });
    }
  }, [shouldOpenFromLocation, needsFullVerification, navigate]);

  const handleVerificationModalClose = () => {
    setVerificationSuccessModalOpen(false);
    setShowAccountModal(true);
    navigate(".", { replace: true, state: undefined });
  };

  useEffect(() => {
    // Lenis zarządza scrollem — podpinamy się przez window.lenis lub fallback
    const handleScroll = ({ scroll }: { scroll: number }) => {
      const currentY = scroll;
      const diff = currentY - lastScrollY.current;

      setIsScrolled(currentY > 50);

      if (currentY < 80) {
        setIsHidden(false);
      } else if (diff > 6) {
        setIsHidden(true);
      } else if (diff < -4) {
        setIsHidden(false);
      }

      lastScrollY.current = currentY;
    };

    // Poczekaj aż Lenis się zainicjuje
    const attachLenis = () => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.on("scroll", handleScroll);
        return () => lenis.off("scroll", handleScroll);
      }
      // fallback — natywny scroll
      const fallback = () => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;
        setIsScrolled(currentY > 50);
        if (currentY < 80) setIsHidden(false);
        else if (diff > 6) setIsHidden(true);
        else if (diff < -4) setIsHidden(false);
        lastScrollY.current = currentY;
      };
      window.addEventListener("scroll", fallback, { passive: true });
      return () => window.removeEventListener("scroll", fallback);
    };

    // Krótkie opóźnienie żeby Lenis zdążył się zamontować
    let cleanup: (() => void) | undefined;
    const t = setTimeout(() => {
      cleanup = attachLenis();
    }, 300);

    return () => {
      clearTimeout(t);
      if (cleanup) cleanup();
    };
  }, []);

  // Animacja wejściowa
  useEffect(() => {
    headerControls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    });
  }, [headerControls]);

  // Chowanie/pokazywanie przy scrollu
  useEffect(() => {
    if (isHidden) {
      headerControls.start({
        y: "-100%",
        opacity: 0,
        transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
      });
    } else {
      headerControls.start({
        y: "0%",
        opacity: 1,
        transition: { duration: 0.32, ease: [0, 0, 0.2, 1] },
      });
    }
  }, [isHidden, headerControls]);

  const isHomePage =
    location.pathname === "/" ||
    location.pathname === "/homepage" ||
    location.pathname === "/homepage-premium";
  const isOverlay = useMemo(() => true, []);
  const accountHref = user
    ? "ACCOUNT_MODAL_TRIGGER"
    : "/auth?mode=login&callbackUrl=ACCOUNT_MODAL_TRIGGER";

  const navLinks = useMemo(() => {
    return [
      { label: "Aukcje", href: "/auctions", tutorialId: "nav-auctions" },
      { label: "Championy", href: "/champions", tutorialId: "nav-champions" },
      { label: "Wyniki lotowe", href: "/flight-results" },
      { label: "Spotkania z hodowcami", href: "/breeder-meetings" },
      { label: "Referencje", href: "/references", tutorialId: "nav-references" },
      { label: "Prasa i media", href: "/press" },
      { label: "O nas", href: "/#about" },
      { label: "Kontakt", href: "/#contact" },
    ];
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const scrollToAnchor = useCallback(
    (anchor: string) => {
      // Jeśli nie jesteśmy na stronie głównej, nawiguj na / z informacją dokąd scrollować
      if (!isHomePage) {
        navigate("/", { state: { scrollTo: anchor } });
        closeMobileMenu();
        return;
      }

      // dla "home" jedziemy na samą górę
      if (anchor === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        closeMobileMenu();
        return;
      }

      const el = document.getElementById(anchor);
      if (el) {
        const headerHeight = headerRef.current?.offsetHeight ?? 88;
        let offset = headerHeight + 32;

        if (anchor === "about") {
          offset = headerHeight + 64; // sekcja wysoka – trochę niżej
        } else if (anchor === "contact") {
          offset = headerHeight + 16; // nagłówek sekcji bliżej górnej krawędzi
        }

        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }

      closeMobileMenu();
    },
    [closeMobileMenu, isHomePage, navigate],
  );

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

  const ariaExpanded: "true" | "false" = isMobileMenuOpen ? "true" : "false";

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
    const rect =
      headerRectRef.current || e.currentTarget.getBoundingClientRect();
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
    setIsHeaderAdminPanelOpen(value);
  };

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: "-100%", opacity: 0 }}
      animate={headerControls}
      onMouseEnter={handleHeaderMouseEnter}
      onMouseMove={handleHeaderMouseMove}
      onMouseLeave={handleHeaderMouseLeave}
      className="fixed top-0 left-0 right-0 z-[500] bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-2 shadow-2xl"
    >
      {/* Efekt podświetlenia dla nagłówka */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            [headerGlowX, headerGlowY, headerGlowOpacity],
            ([x, y, o]) =>
              `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(212, 175, 55, ${o as number}), transparent 30%)`,
          ),
          opacity: headerGlowOpacity,
        }}
      />
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-14">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-shrink-0"
        >
          <RouterLink
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Strona główna"
          >
            <Gavel className="w-6 h-6 text-gold group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-white font-bold text-sm tracking-wider uppercase hidden xl:block group-hover:text-gold transition-colors duration-300">
              PigeonAuction
            </span>
          </RouterLink>
        </motion.div>

        {/* Desktop Nav - centered */}
        <motion.nav
          className="hidden lg:flex items-center gap-1 xl:gap-2"
          data-tutorial="main-nav"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0.1 },
            },
          }}
        >
          {navLinks.map((link) => (
            <motion.div
              key={link.label}
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              {...(link.tutorialId ? { "data-tutorial": link.tutorialId } : {})}
            >
              {link.href?.startsWith("/#") ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const anchor = (link.href || "").split("#")[1];
                    if (anchor) scrollToAnchor(anchor);
                  }}
                  className="nav-link-premium text-[11px] font-semibold tracking-wide text-white/80 hover:text-white uppercase px-2 py-1"
                >
                  {link.label}
                </button>
              ) : (
                <RouterLink
                  to={link.href || "/"}
                  className="nav-link-premium text-[11px] font-semibold tracking-wide text-white/80 hover:text-white uppercase px-2 py-1"
                >
                  {link.label}
                </RouterLink>
              )}
            </motion.div>
          ))}
        </motion.nav>

        {/* Right side: user controls */}
        <div className="flex-shrink-0 flex items-center gap-2.5">
          {user && profile ? (
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Notification Bell */}
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2.5 rounded-xl bg-slate-900/60 border border-[#d4af37]/20 hover:border-[#d4af37]/60 text-white/90 hover:text-white transition-all shadow-lg hover:shadow-[#d4af37]/20 group cursor-pointer backdrop-blur-md"
                aria-label="Powiadomienia"
                data-tutorial="notification-bell"
              >
                <div className="relative">
                  <Bell className="w-4 h-4 text-[#d4af37] group-hover:rotate-12 transition-transform duration-300" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-slate-950 shadow-md"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </div>
              </motion.button>

              {/* Admin Panel Button if ADMIN */}
              {profile.role === "ADMIN" && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setAdminModalWithTrace(true)}
                  className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-purple-900/80 border border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] cursor-pointer backdrop-blur-xl"
                  title="Otwórz Panel Administratora"
                >
                  <div className="relative flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
                  </div>
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-purple-200 group-hover:text-white">
                    Panel Admina
                  </span>
                </motion.button>
              )}

              {/* User Panel Button */}
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="relative group flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0b1329]/90 via-[#0e1936]/90 to-[#070d1e]/90 border border-[#d4af37]/40 hover:border-[#d4af37] text-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] cursor-pointer backdrop-blur-xl"
                title="Otwórz Panel Użytkownika"
                data-tutorial="user-pill"
              >
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] shadow-inner">
                  <User className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-950 ${
                      profile.role === "ADMIN"
                        ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        : profile.role === "USER_FULL_VERIFIED"
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    }`}
                  />
                </div>

                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-white group-hover:text-[#d4af37] transition-colors max-w-[120px] truncate">
                    {profile.full_name || user.email?.split("@")[0] || "Użytkownik"}
                  </span>
                  <span className="text-[9px] font-black text-[#d4af37]/90 uppercase tracking-widest">
                    {profile.role === "ADMIN"
                      ? "Admin"
                      : profile.role === "USER_FULL_VERIFIED"
                        ? "Zweryfikowany"
                        : "Zalogowany"}
                  </span>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all hidden md:block" />
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RouterLink
                to="/auth?mode=login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#b8972e] text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] border border-white/40 transition-all"
                data-tutorial="login-btn"
              >
                <User className="w-4 h-4 text-slate-950" />
                <span>Zaloguj się</span>
              </RouterLink>
            </motion.div>
          )}

          {/* Mobile: Bell button */}
          {user && (
            <motion.button
              className="sm:hidden p-2 text-white/90 relative"
              onClick={() => setShowNotificationModal(true)}
              whileTap={{ scale: 0.95 }}
              aria-label="Powiadomienia"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-1 ring-black/50">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Hamburger - mobile only (< lg) */}
          <motion.button
            className="lg:hidden p-2 text-white relative"
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
              animate={
                isMobileMenuOpen
                  ? { scale: [0, 1.2, 1], opacity: [0, 0.6, 0.2] }
                  : { scale: 0, opacity: 0 }
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
      </div>

      <AnimatePresence>
        {isAccountModalOpen && (
          <Suspense fallback={null}>
            <UserPanel onClose={() => setShowAccountModal(false)} />
          </Suspense>
        )}
        {isHeaderAdminPanelOpen && (
          <Suspense fallback={null}>
            <AdminPanel
              key="admin-panel"
              isOpen={true}
              onClose={() => setAdminModalWithTrace(false)}
            />
          </Suspense>
        )}
        {showNotificationModal && (
          <NotificationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            onNotificationsChange={setUnreadCount}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/10"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{
              duration: 0.35,
              height: { duration: 0.35, type: "spring", stiffness: 400, damping: 30 },
            }}
          >
            <motion.nav
              id={mobileNavId}
              aria-label="Menu mobilne"
              className="container mx-auto px-6 py-5 flex flex-col gap-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.04, delayChildren: 0.05 },
                },
              }}
            >
              {navLinks.map((link) => {
                const mobileLinkClass =
                  "flex items-center py-3 px-2 text-sm font-medium text-white/80 hover:text-gold hover:bg-white/5 rounded-lg transition-all duration-200 border-b border-white/5";
                if (link.href === "ACCOUNT_MODAL_TRIGGER") {
                  return (
                    <motion.button
                      key={link.label}
                      className={mobileLinkClass + " w-full text-left"}
                      onClick={() => { setShowAccountModal(true); closeMobileMenu(); }}
                      ref={link.label === navLinks[0]?.label
                        ? (el: HTMLElement | null) => { firstMobileLinkRef.current = el; }
                        : undefined}
                      variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User className="w-4 h-4 mr-3 text-gold/70" />
                      {link.label}
                    </motion.button>
                  );
                }
                if (link.href === "/admin") {
                  return (
                    <motion.button
                      key={link.label}
                      className={mobileLinkClass + " w-full text-left text-gold"}
                      onClick={() => { setAdminModalWithTrace(true); closeMobileMenu(); }}
                      variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      {link.label}
                    </motion.button>
                  );
                }
                return (
                  <motion.div
                    key={link.label}
                    variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.href?.startsWith("/#") ? (
                      <a
                        href={link.href}
                        className={mobileLinkClass}
                        onClick={(e) => {
                          e.preventDefault();
                          const anchor = (link.href || "").split("#")[1];
                          if (anchor) scrollToAnchor(anchor);
                        }}
                        ref={link.label === navLinks[0]?.label
                          ? (el: HTMLElement | null) => { firstMobileLinkRef.current = el; }
                          : undefined}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <RouterLink
                        to={link.href || "/"}
                        className={mobileLinkClass}
                        onClick={closeMobileMenu}
                        ref={link.label === navLinks[0]?.label
                          ? (el: HTMLElement | null) => { firstMobileLinkRef.current = el; }
                          : undefined}
                      >
                        {link.label}
                      </RouterLink>
                    )}
                  </motion.div>
                );
              })}

              {/* ── Mobile-only: Account & Admin buttons ───── */}
              {user && profile && (
                <>
                  <motion.div
                    className="mt-2 pt-2 border-t border-white/10"
                    variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                  >
                    <button
                      className="flex items-center w-full py-3 px-2 text-sm font-medium text-[#d4af37] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                      onClick={() => { setShowAccountModal(true); closeMobileMenu(); }}
                    >
                      <User className="w-4 h-4 mr-3 text-[#d4af37]/70" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{profile.full_name || user.email?.split("@")[0] || "Mój profil"}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/50">
                          {profile.role === "ADMIN" ? "Admin" : profile.role === "USER_FULL_VERIFIED" ? "Zweryfikowany" : "Panel użytkownika"}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                  {profile.role === "ADMIN" && (
                    <motion.div
                      variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <button
                        className="flex items-center w-full py-3 px-2 text-sm font-medium text-purple-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                        onClick={() => { setAdminModalWithTrace(true); closeMobileMenu(); }}
                      >
                        <Shield className="w-4 h-4 mr-3 text-purple-400" />
                        Panel Admina
                      </button>
                    </motion.div>
                  )}
                </>
              )}
              {!user && (
                <motion.div
                  className="mt-2 pt-2 border-t border-white/10"
                  variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                >
                  <RouterLink
                    to="/auth?mode=login"
                    className="flex items-center w-full py-3 px-2 text-sm font-bold text-[#d4af37] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                    onClick={closeMobileMenu}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Zaloguj się
                  </RouterLink>
                </motion.div>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      <UnifiedModal
        isOpen={isVerificationModalOpen}
        onClose={handleVerificationModalClose}
        type="success"
        title="Email zweryfikowany pomyślnie!"
        message="Prosimy o uzupełnienie danych profilowych, aby móc w pełni korzystać z serwisu."
        confirmButton={{
          text: "OK",
          onClick: handleVerificationModalClose,
        }}
        showCloseButton={true}
        closeOnBackdrop={false}
        closeOnEscape={false}
        size="md"
      />
    </motion.header>
  );
};

export default memo(Header);
