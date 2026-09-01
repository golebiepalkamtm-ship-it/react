import React, { useEffect, useState, useMemo, useRef, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FullscreenImageModal } from "@/components/ui/FullscreenImageModal";
import { SmartImage } from "@/components/ui/SmartImage";
import AddBreederMeetingForm from "@/components/breeder-meetings/AddBreederMeetingForm";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Calendar, Users, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meetingsService } from "@/services/meetingsService";
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
const UserPanel = lazy(() => import("@/components/UserPanel"));
import { useNavigate } from "react-router-dom";
import { gsap } from "@/lib/gsapConfig";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface BreederMeeting {
  id: string;
  name: string;
  location?: string;
  date?: string;
  description?: string;
  images: string[];
}

const getContainerAnim = (index: number) => {
  switch (index) {
    case 0:
      return "slideUpReturn";
    case 1:
      return "swashIn";
    case 2:
      return "swashIn";
    case 3:
      return "slideDownReturn";
    case 4:
      return "slideDownReturn";
    default:
      return "slideDownReturn";
  }
};

export default function BreederMeetings() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { info: showInfo } = useOptimizedToast();
  const [breederMeetings, setBreederMeetings] = useState<BreederMeeting[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    meetingId: string;
    imageIndex: number;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // Verification handling
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState({
    title: "",
    message: "",
  });
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const roleActions = useMemo(
    () => ({
      USER_REGISTERED: () => {
        setVerificationMessage({
          title: "Wymagana weryfikacja emaila",
          message:
            "Aby dodać spotkanie, musisz najpierw zweryfikować swój adres email.\n\nSprawdź swoją skrzynkę odbiorczą i kliknij link weryfikacyjny.",
        });
        setShowVerificationModal(true);
      },
      USER_EMAIL_VERIFIED: () => {
        setVerificationMessage({
          title: "Wymagana pełna weryfikacja",
          message:
            'Aby dodać spotkanie, musisz uzupełnić swój profil i zweryfikować numer telefonu.\n\nKliknij "Uzupełnij profil" aby kontynuować.',
        });
        setShowVerificationModal(true);
      },
      USER_FULL_VERIFIED: () => {
        setIsFormOpen(true);
      },
      ADMIN: () => {
        setIsFormOpen(true);
      },
    }),
    [],
  );

  // Inicjalizacja animacji GSAP
  useEffect(() => {
    const timer = setTimeout(() => {
      import("@/lib/gsapAnimations").then(({ initHeroTextSplit }) => {
        initHeroTextSplit();
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // useScrollAnimation: Hero and Scroll reveal
  useScrollAnimation(
    heroRef,
    [
      // Hero content stagger reveal
      {
        targets: () => heroContentRef.current?.children,
        fromVars: { opacity: 0, y: 60 },
        toVars: {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 1.5,
          ease: "expo.out",
        },
        delay: 0.3,
      },
      // Hero Parallax Scrub
      {
        targets: () => heroContentRef.current,
        toVars: {
          y: 100,
          opacity: 0.4,
          scale: 0.98,
          ease: "none",
        },
        scrollTrigger: {
          trigger: () => heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      },
      // Meeting Cards Reveal
      {
        targets: ".animate-meeting-card",
        fromVars: { opacity: 0, y: 50 },
        toVars: {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ".container",
            start: "top 80%",
          },
        },
      },
    ],
    [breederMeetings],
  );

  const [error, setError] = useState<string | null>(null);

  const fetchBreederMeetings = useCallback(async () => {
    try {
      setError(null);
      const data = await meetingsService.getMeetings();
      setBreederMeetings(Array.isArray(data) ? data : []);
      setImagesLoaded(true);
    } catch (err) {
      console.error("Błąd podczas ładowania spotkań z hodowcami:", err);
      setError("Nie udało się załadować spotkań z hodowcami. Sprawdź połączenie i spróbuj ponownie.");
      setBreederMeetings([]);
      setImagesLoaded(true);
    }
  }, []);

  useEffect(() => {
    void fetchBreederMeetings();
  }, [fetchBreederMeetings]);

  const handleAddMeeting = () => {
    if (!user) {
      setPendingRedirect("/meetings");
      setShowLoginPrompt(true);
      return;
    }

    if (!profile) {
      showInfo({ message: "Ładowanie profilu..." });
      return;
    }

    const action = roleActions[profile.role as keyof typeof roleActions];
    if (action) {
      action();
    } else {
      showInfo({ message: "Brak uprawnień do dodawania spotkań." });
    }
  };

  const handleImageClick = (meetingId: string, imageIndex: number) =>
    setSelectedImage({ meetingId, imageIndex });
  const handleCloseModal = () => setSelectedImage(null);

  if (!imagesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <div className="text-lg text-white/70">Ładowanie zdjęć...</div>
        </div>
      </div>
    );
  }

  if (error && breederMeetings.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-transparent">
        <Header />
        <main className="relative z-10 flex items-center justify-center min-h-[60vh] px-4">
          <div className="p-8 text-center max-w-md rounded-2xl bg-[#0c1427] border border-[#A68E4E]/50 shadow-2xl">
            <p className="text-red-400 mb-4 text-sm">{error}</p>
            <Button
              onClick={() => void fetchBreederMeetings()}
              className="bg-[#A68E4E] hover:bg-[#8e7a42] text-black font-bold"
            >
              Spróbuj ponownie
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <Header />
      <main className="relative z-10">
        <section
          ref={heroRef}
          className="relative overflow-hidden text-center min-h-[70vh] flex items-center"
        >
          <div className="absolute inset-0 overflow-hidden" />

          <div
            ref={heroContentRef}
            className="relative z-10 container mx-auto px-4 text-center"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
              style={{
                background: "#A68E4E",
                boxShadow: "0 2px 16px rgba(166,142,78,0.5)",
                border: "1px solid rgba(166,142,78,0.8)",
              }}
            >
              <Users className="w-12 h-12 md:w-16 md:h-16 text-black" />
            </motion.div>
            <h1
              data-split-text
              className="font-display text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            >
              <span className="text-black">Spotkania</span>{" "}
              <span className="gold-heading">z Hodowcami</span>
            </h1>
            <p className="font-display italic text-white text-lg md:text-xl max-w-3xl mx-auto mb-12">
              Galeria zdjęć z naszych spotkań z hodowcami
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                ref={triggerButtonRef}
                onClick={handleAddMeeting}
                className="bg-gradient-to-r from-gold to-gold text-black font-bold px-8 py-3 rounded-full hover:from-gold-light hover:to-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 gold-button"
              >
                <MessageSquareQuote className="w-5 h-5 mr-2 gold-icon" />
                Dodaj spotkanie
              </Button>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-20">
          <section className="pt-12">
            <div className="space-y-12">
              {breederMeetings &&
                Array.isArray(breederMeetings) &&
                breederMeetings.map((meeting, index) => (
                  <div key={meeting.id}>
                    <article
                      className={`relative rounded-2xl bg-transparent backdrop-blur-2xl backdrop-brightness-125 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] p-6 md:p-8 magictime ${getContainerAnim(index)} animate-meeting-card transition-all duration-500 stagger-${index % 11} overflow-hidden`}
                      style={{
                        border: "2px solid rgba(166,142,78,0.7)",
                        boxShadow:
                          "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08), 0 32px 64px -16px rgba(0,0,0,0.4)",
                      }}
                    >
                      {/* Very thin bright highlights only */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                      {/* Atmospheric glow - purely white, very low opacity */}
                      <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 w-full h-32 pointer-events-none opacity-20"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 80%)",
                        }}
                      />
                      <div className="mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-center gold-heading">
                          {meeting.name}
                        </h3>
                      </div>

                      <div
                        className="relative grid gap-5 rounded-2xl bg-transparent backdrop-brightness-110 p-4 md:p-6 mt-6 overflow-hidden"
                        style={{
                          border: "2px solid rgba(166,142,78,0.7)",
                          boxShadow:
                            "0 0 12px rgba(166,142,78,0.25), 0 0 30px rgba(166,142,78,0.1), inset 0 0 0 1px rgba(166,142,78,0.08)",
                        }}
                      >
                        <div className="absolute inset-0 bg-white/[0.03] pointer-events-none" />
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.isArray(meeting.images) &&
                            meeting.images.map((image, imageIndex) => (
                              <div
                                key={imageIndex}
                                className="relative h-48 overflow-hidden rounded-xl cursor-pointer group bg-white shadow"
                                style={{
                                  border: "2px solid rgba(166,142,78,0.7)",
                                  boxShadow: "0 0 8px rgba(166,142,78,0.2)",
                                }}
                                onClick={() =>
                                  handleImageClick(meeting.id, imageIndex)
                                }
                              >
                                <SmartImage
                                  src={image}
                                  alt={`${meeting.name} - zdjęcie ${imageIndex + 1}`}
                                  width={300}
                                  height={192}
                                  fitMode="cover"
                                  aspectRatio="16/9"
                                  className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="w-8 h-8 bg-gold/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-gold/35">
                                    <span className="text-gold text-xs font-bold">
                                      {imageIndex + 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
            </div>

            {breederMeetings.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white border border-gold/30 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 gold-heading">
                  Brak spotkań
                </h2>
                <p className="mb-6 text-slate-600">
                  Jeszcze nie ma zdjęć ze spotkań z hodowcami.
                </p>
              </div>
            )}
          </section>
        </div>

        {selectedImage &&
          (() => {
            const meeting = breederMeetings.find(
              (m) => m.id === selectedImage.meetingId,
            );
            if (!meeting || !Array.isArray(meeting.images)) return null;
            const currentImage = meeting.images[selectedImage.imageIndex];
            if (!currentImage) return null;
            return (
              <FullscreenImageModal
                isOpen={selectedImage !== null}
                onClose={handleCloseModal}
                images={meeting.images}
                currentIndex={selectedImage.imageIndex}
                title={meeting.name}
              />
            );
          })()}

        <UnifiedModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          type="default"
          title="Dodaj spotkanie"
          showCloseButton={true}
          closeOnBackdrop={true}
          closeOnEscape={true}
          size="lg"
          draggable={true}
          bodyScrollable={true}
          backdropClassName="bg-black/60"
        >
          <AddBreederMeetingForm
            embedded
            onSuccess={() => {
              setIsFormOpen(false);
              const fetchBreederMeetings = async () => {
                try {
                  const data = await meetingsService.getMeetings();
                  setBreederMeetings(Array.isArray(data) ? data : []);
                } catch (error) {
                  console.error(
                    "Błąd podczas ładowania spotkań z hodowcami:",
                    error,
                  );
                  setBreederMeetings([]);
                }
              };
              fetchBreederMeetings();
            }}
          />
        </UnifiedModal>
      </main>

      {isAccountOpen && (
        <Suspense fallback={null}>
          <UserPanel onClose={() => setIsAccountOpen(false)} />
        </Suspense>
      )}

      <UnifiedModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type="warning"
        title={verificationMessage.title}
        message={verificationMessage.message}
        backdropClassName="bg-black/60 backdrop-blur-sm"
        confirmButton={{
          text:
            profile?.role === "USER_REGISTERED"
              ? "Zweryfikuj email"
              : "Uzupełnij profil",
          onClick: () => {
            setShowVerificationModal(false);
            if (profile?.role === "USER_REGISTERED") {
              navigate("/verify-email");
            } else {
              setIsAccountOpen(true);
            }
          },
        }}
        cancelButton={{
          text: "Anuluj",
          onClick: () => setShowVerificationModal(false),
        }}
      />

      <UnifiedModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        type="info"
        title="Wymagane logowanie"
        message="Aby dodać spotkanie z hodowcą, musisz się zalogować. Po zamknięciu tego komunikatu przeniosę Cię do strony logowania."
        backdropClassName="bg-black/60 backdrop-blur-sm"
        confirmButton={{
          text: "Przejdź do logowania",
          onClick: () => {
            const target = pendingRedirect || "/meetings";
            setShowLoginPrompt(false);
            navigate(
              `/auth?mode=login&callbackUrl=${encodeURIComponent(target)}`,
            );
          },
        }}
        cancelButton={{
          text: "Anuluj",
          onClick: () => setShowLoginPrompt(false),
        }}
      />

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
