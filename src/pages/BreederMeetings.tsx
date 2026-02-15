import React, { useEffect, useState, useMemo, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FullscreenImageModal } from "@/components/ui/FullscreenImageModal";
import { SmartImage } from "@/components/ui/SmartImage";
import AddBreederMeetingForm from "@/components/breeder-meetings/AddBreederMeetingForm";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meetingsService } from "@/services/meetingsService";
import { useOptimizedToast } from "@/hooks/use-optimized-toast";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import AccountModal from "@/components/AccountModal";
import { useNavigate } from "react-router-dom";
import { gsap } from "@/lib/gsapConfig";

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

  // Animacje GSAP dla hero i scroll
  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current) return;

    const ctx = gsap.context(() => {
      const heroContent = heroContentRef.current;
      const children = heroContent?.children;

      if (children) {
        // Animacja wejścia elementów
        gsap.set(children, { opacity: 0, y: 60 });

        gsap.to(children, {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 1.8,
          ease: "power3.out",
          delay: 0.5,
        });
      }

      // Parallax scroll dla hero
      if (heroContent) {
        gsap.to(heroContent, {
          y: 150,
          opacity: 0.3,
          scale: 0.95,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      // Animacja wejścia kart spotkań
      const meetingCards = document.querySelectorAll(".animate-meeting-card");
      meetingCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              end: "top center",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, [breederMeetings]);

  useEffect(() => {
    const fetchBreederMeetings = async () => {
      try {
        const data = await meetingsService.getMeetings();
        setBreederMeetings(Array.isArray(data) ? data : []);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Błąd podczas ładowania spotkań z hodowcami:", error);
        setBreederMeetings([]);
        setImagesLoaded(true);
      }
    };
    fetchBreederMeetings();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <div className="text-lg text-foreground">Ładowanie zdjęć...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy grid-overlay -z-10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gold/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gold/7 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/4 rounded-full blur-3xl" />
      </div>
      <Header />
      <main className="relative z-10">
        <section
          ref={heroRef}
          className="relative overflow-hidden text-center min-h-[70vh] flex items-center"
        >
          <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
            <div ref={heroContentRef} className="mx-auto max-w-4xl">
              <div className="flex items-center justify-center gap-2 mb-8">
                <Users className="w-12 h-12 md:w-16 md:h-16 text-gold" />
              </div>
              <h1
                data-split-text
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gold leading-tight mb-6"
              >
                Spotkania z Hodowcami
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-12">
                Galeria zdjęć z naszych spotkań z hodowcami gołębi pocztowych
              </p>

              <div className="flex items-center justify-center gap-3">
                <Button
                  ref={triggerButtonRef}
                  onClick={handleAddMeeting}
                  className="bg-gold text-navy hover:bg-gold/90 text-lg px-8 py-6"
                >
                  Dodaj spotkanie
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-20">
          <section className="section-surface-alt pt-12">
            <div className="space-y-12">
              {breederMeetings &&
                Array.isArray(breederMeetings) &&
                breederMeetings.map((meeting, index) => (
                  <div key={meeting.id}>
                    <article
                      className={`rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-6 magictime ${getContainerAnim(index)} animate-meeting-card stagger-${index % 11}`}
                    >
                      <div className="mb-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-gold text-center">
                          {meeting.name}
                        </h3>

                        {(meeting.location || meeting.date) && (
                          <div className="flex items-center justify-center gap-4 text-muted-foreground mt-2 mb-4">
                            {meeting.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gold/70" />
                                <span className="text-sm">
                                  {meeting.location}
                                </span>
                              </div>
                            )}
                            {meeting.date && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gold/70" />
                                <span className="text-sm">
                                  {/* Helper to safely display date */}
                                  {(() => {
                                    const d = meeting.date;
                                    if (!d) return "";
                                    // Checks basic cases
                                    if (
                                      typeof d === "string" &&
                                      !d.includes("-") &&
                                      !d.includes("/") &&
                                      d.length === 4
                                    ) {
                                      return d; // Years like "2024"
                                    }
                                    const parsed = new Date(d);
                                    return !isNaN(parsed.getTime())
                                      ? parsed.toLocaleDateString("pl-PL")
                                      : String(d);
                                  })()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {meeting.description && (
                          <p className="text-center text-white/80 max-w-2xl mx-auto leading-relaxed">
                            {meeting.description}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-5 rounded-2xl border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Array.isArray(meeting.images) &&
                            meeting.images.map((image, imageIndex) => (
                              <div
                                key={imageIndex}
                                className="relative h-48 overflow-hidden rounded-xl cursor-pointer group border border-white/25 bg-black/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
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
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="w-8 h-8 bg-gold/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-gold/35">
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
              <div className="p-12 text-center rounded-2xl bg-black/70 backdrop-blur-xl border border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Brak spotkań
                </h2>
                <p className="mb-6 text-muted-foreground">
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

      <AccountModal
        open={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

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
