import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Gavel,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserPanel from "./UserPanel";
import AdminPanel from "./AdminPanel";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { fadeInDown, iconMicro } from "@/components/motion";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { NotificationModal } from "@/components/NotificationModal";
import { Bell } from "lucide-react";
import { notificationService } from "@/services/notificationService";

const Header = () => {
  const { user, profile, session } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
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
      console.trace("🔍 Stack trace for Admin Modal open:");
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

  useEffect(() => {
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

  const shouldOpenFromLocation = Boolean(location.state?.openAccount);
  const shouldShowVerificationFromLocation = Boolean(
    location.state?.showVerificationSuccess,
  );
  const isAccountModalOpen =
    showAccountModal ||
    (shouldOpenFromLocation && !shouldShowVerificationFromLocation);
  const isVerificationModalOpen =
    verificationSuccessModalOpen ||
    (shouldOpenFromLocation && shouldShowVerificationFromLocation);

  useEffect(() => {
    if (shouldOpenFromLocation) {
      navigate(".", { replace: true, state: undefined });
    }
  }, [shouldOpenFromLocation, navigate]);

  const handleVerificationModalClose = () => {
    setVerificationSuccessModalOpen(false);
    setShowAccountModal(true);
    navigate(".", { replace: true, state: undefined });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage =
    location.pathname === "/" ||
    location.pathname === "/homepage" ||
    location.pathname === "/homepage-premium";
  const isBreederPage = location.pathname.startsWith("/breeder-meetings");
  const isAuctionsPage = location.pathname.startsWith("/auctions");
  const isContactPage = location.pathname.startsWith("/contact");
  const isReferencesPage = location.pathname.startsWith("/references");
  const isOverlay = useMemo(() => true, []);
  const accountHref = user
    ? "ACCOUNT_MODAL_TRIGGER"
    : "/auth?mode=login&callbackUrl=ACCOUNT_MODAL_TRIGGER";

  const navLinks = useMemo(() => {
    const baseLinks = [
      { label: "Start", href: "/#home" },
      { label: "Aukcje", href: "/auctions" },
      { label: "Championy", href: "/champions" },
      { label: "Wyniki lotowe", href: "/flight-results" },
      { label: "Spotkania z hodowcami", href: "/breeder-meetings" },
      { label: "Referencje", href: "/references" },
      { label: "Prasa i media", href: "/press" },
      { label: "O nas", href: "/#about" },
      { label: "Kontakt", href: "/#contact" },
      { label: "Konto", href: accountHref },
    ];

    // Add admin link for admins
    if (profile?.role === "ADMIN") {
      baseLinks.splice(baseLinks.length - 1, 0, {
        label: "Panel admina",
        href: "/admin",
      });
    }

    return baseLinks;
  }, [profile?.role, accountHref]);

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
    if (value) {
      console.group("🔍 Header: Opening Admin Modal");
      console.log("Value:", value);
      console.trace("Stack trace:");
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
      className="fixed top-0 left-0 right-0 z-[500] transition-all duration-500 bg-transparent py-2"
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
      <div className="container mx-auto px-4 flex items-center justify-center">
        <motion.nav
          className="hidden md:flex items-center justify-between w-full"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0.1 },
            },
          }}
        >
          {navLinks.map((link, index) => {
            if (link.href === "ACCOUNT_MODAL_TRIGGER") {
              return (
                <motion.button
                  key={link.label}
                  onClick={() => setShowAccountModal(true)}
                  className="nav-link-premium text-sm font-semibold tracking-widest text-white/80 hover:text-white uppercase"
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {link.label}
                </motion.button>
              );
            }
            if (link.href === "/admin") {
              return (
                <motion.button
                  key={link.label}
                  onClick={() => setAdminModalWithTrace(true)}
                  className="nav-link-premium text-sm font-semibold tracking-widest text-gold hover:text-white uppercase"
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {link.label}
                </motion.button>
              );
            }
            return (
              <motion.div
                key={link.label}
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {link.href?.startsWith("/#") ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const anchor = (link.href || "").split("#")[1];
                      if (anchor) scrollToAnchor(anchor);
                    }}
                    className="nav-link-premium text-sm font-semibold tracking-widest text-white/80 hover:text-white uppercase"
                  >
                    {link.label}
                  </button>
                ) : (
                  <RouterLink
                    to={link.href || "/"}
                    className="nav-link-premium text-sm font-semibold tracking-widest text-white/80 hover:text-white uppercase"
                  >
                    {link.label}
                  </RouterLink>
                )}
              </motion.div>
            );
          })}

          {/* User Status Diode - only for logged in users */}
          {user && profile && (
            <div className="flex items-center gap-2">
              <motion.button
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors group"
                aria-label="Powiadomienia"
              >
                <div className="relative">
                  <Bell className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black/50"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </div>
              </motion.button>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="flex items-center"
              >
                <button
                  type="button"
                  onClick={() => setShowAccountModal(true)}
                  className="relative group p-2 rounded-full hover:bg-white/5 transition-colors"
                  title={`Status: ${
                    profile.role === "ADMIN"
                      ? "Administrator"
                      : profile.role === "USER_FULL_VERIFIED"
                        ? "Konto zweryfikowane"
                        : profile.role === "USER_EMAIL_VERIFIED"
                          ? "Uzupełnij profil i zweryfikuj telefon"
                          : "Zweryfikuj adres email"
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
                        ease: "easeInOut",
                      }}
                      className={`absolute w-3 h-3 rounded-full blur-[2px] ${
                        profile.role === "ADMIN"
                          ? "bg-purple-500"
                          : profile.role === "USER_FULL_VERIFIED"
                            ? "bg-green-500"
                            : profile.role === "USER_EMAIL_VERIFIED"
                              ? "bg-gold"
                              : "bg-amber-500"
                      }`}
                    />
                    {/* Main Diode */}
                    <div
                      className={`relative w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                        profile.role === "ADMIN"
                          ? "bg-purple-400"
                          : profile.role === "USER_FULL_VERIFIED"
                            ? "bg-green-400"
                            : profile.role === "USER_EMAIL_VERIFIED"
                              ? "bg-gold"
                              : "bg-amber-400"
                      }`}
                    />
                  </div>

                  {/* Tooltip hint on hover */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {profile.role === "ADMIN"
                      ? "Admin"
                      : profile.role === "USER_FULL_VERIFIED"
                        ? "Zweryfikowany"
                        : profile.role === "USER_EMAIL_VERIFIED"
                          ? "Uzupełnij profil"
                          : "Zweryfikuj email"}
                  </span>
                </button>
              </motion.div>
            </div>
          )}
        </motion.nav>

        <AnimatePresence>
          {isAccountModalOpen && (
            <UserPanel onClose={() => setShowAccountModal(false)} />
          )}
          {isHeaderAdminPanelOpen && (
            <AdminPanel
              key="admin-panel"
              isOpen={true}
              onClose={() => setAdminModalWithTrace(false)}
            />
          )}
          {showNotificationModal && (
            <NotificationModal
              isOpen={showNotificationModal}
              onClose={() => setShowNotificationModal(false)}
              onNotificationsChange={setUnreadCount}
            />
          )}
        </AnimatePresence>

        {user && (
          <motion.div className="md:hidden relative mr-2">
            <motion.button
              className="p-2 text-white/90 relative"
              onClick={() => setShowNotificationModal(true)}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-1 ring-black/50">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          </motion.div>
        )}

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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-hero-gradient border-t border-primary/20"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{
              duration: 0.4,
              height: {
                duration: 0.4,
                type: "spring",
                stiffness: 500,
                damping: 30,
              },
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
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              }}
            >
              {navLinks.map((link) => {
                if (link.href === "ACCOUNT_MODAL_TRIGGER") {
                  return (
                    <motion.button
                      key={link.label}
                      className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary text-left"
                      onClick={() => {
                        setShowAccountModal(true);
                        closeMobileMenu();
                      }}
                      ref={
                        link.label === navLinks[0]?.label
                          ? (el: HTMLElement | null) => {
                              firstMobileLinkRef.current = el;
                            }
                          : undefined
                      }
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.button>
                  );
                }
                if (link.href === "/admin") {
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
                        visible: { opacity: 1, x: 0 },
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
                      visible: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.href?.startsWith("/#") ? (
                      <a
                        href={link.href}
                        className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary block"
                        onClick={(e) => {
                          e.preventDefault();
                          const anchor = (link.href || "").split("#")[1];
                          if (anchor) scrollToAnchor(anchor);
                        }}
                        ref={
                          link.label === navLinks[0]?.label
                            ? (el: HTMLElement | null) => {
                                firstMobileLinkRef.current = el;
                              }
                            : undefined
                        }
                      >
                        {link.label}
                      </a>
                    ) : (
                      <RouterLink
                        to={link.href || "/"}
                        className="transition-colors duration-300 text-base font-medium py-2 text-white/90 hover:text-primary block"
                        onClick={closeMobileMenu}
                        ref={
                          link.label === navLinks[0]?.label
                            ? (el: HTMLElement | null) => {
                                firstMobileLinkRef.current = el;
                              }
                            : undefined
                        }
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
