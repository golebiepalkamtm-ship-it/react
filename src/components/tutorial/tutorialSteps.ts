// Tutorial step definitions for the onboarding system
// Each track is a contextual path shown based on user's verification status

export interface TutorialStep {
  id: string;
  targetSelector: string;
  fallbackPosition?: "center";
  title: string;
  description: string;
  tip?: string;
  icon: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  route?: string;
  highlightPadding?: number;
  spotlightRadius?: number;
}

export type TutorialTrack = "welcome" | "verification" | "features";

export const TUTORIAL_TRACKS: Record<TutorialTrack, TutorialStep[]> = {
  // ── Track 1: New visitor (not logged in) ──────────────────────
  welcome: [
    {
      id: "welcome-hero",
      targetSelector: "[data-tutorial='hero-area']",
      fallbackPosition: "center",
      title: "Witaj w Champion Pigeon Auctions!",
      description:
        "Platforma aukcji gołębi pocztowych z Dolnego Śląska. Pozwól, że pokażemy Ci najważniejsze funkcje serwisu.",
      tip: "Ten samouczek możesz zawsze uruchomić ponownie z menu użytkownika.",
      icon: "🏠",
      placement: "bottom",
    },
    {
      id: "welcome-nav",
      targetSelector: "[data-tutorial='main-nav']",
      title: "Nawigacja",
      description:
        "Tu znajdziesz wszystkie sekcje: aukcje, championy, wyniki lotowe, spotkania hodowców i więcej.",
      icon: "🧭",
      placement: "bottom",
      highlightPadding: 12,
    },
    {
      id: "welcome-auctions",
      targetSelector: "[data-tutorial='nav-auctions']",
      title: "Aukcje",
      description:
        "Serce platformy — przeglądaj aktywne aukcje gołębi, suplementów i akcesoriów. Licytuj lub kup od ręki za pomocą 'Kup Teraz'.",
      icon: "🏷️",
      placement: "bottom",
    },
    {
      id: "welcome-champions",
      targetSelector: "[data-tutorial='nav-champions']",
      title: "Championy",
      description:
        "Galeria najlepszych gołębi z rodowodami i osiągnięciami lotowymi. Sprawdź genetykę zwycięzców.",
      icon: "🏆",
      placement: "bottom",
    },
    {
      id: "welcome-references",
      targetSelector: "[data-tutorial='nav-references']",
      title: "Referencje",
      description:
        "Opinie i recenzje od hodowców — sprawdź wiarygodność sprzedawców przed zakupem.",
      icon: "⭐",
      placement: "bottom",
    },
    {
      id: "welcome-register",
      targetSelector: "[data-tutorial='login-btn']",
      title: "Dołącz do nas!",
      description:
        "Zarejestruj się, żeby licytować, wystawiać aukcje i korzystać z pełni możliwości platformy.",
      tip: "Możesz zarejestrować się mailem, przez Google lub Facebook.",
      icon: "🔑",
      placement: "bottom",
    },
  ],

  // ── Track 2: Registered user needing verification ─────────────
  verification: [
    {
      id: "verify-email",
      targetSelector: "[data-tutorial='user-pill']",
      title: "Potwierdź email",
      description:
        "Sprawdź skrzynkę pocztową i kliknij link weryfikacyjny. To pierwszy krok do pełnego dostępu.",
      tip: "Jeśli nie widzisz maila — sprawdź folder spam.",
      icon: "📧",
      placement: "bottom",
    },
    {
      id: "verify-profile",
      targetSelector: "[data-tutorial='user-pill']",
      title: "Uzupełnij profil",
      description:
        "Otwórz panel konta i wypełnij wymagane dane: imię, nazwisko, adres i numer telefonu.",
      tip: "Kliknij swoją nazwę w prawym górnym rogu, żeby otworzyć panel.",
      icon: "📋",
      placement: "bottom",
    },
    {
      id: "verify-phone",
      targetSelector: "[data-tutorial='user-pill']",
      title: "Zweryfikuj telefon",
      description:
        "Wyślemy SMS z 6-cyfrowym kodem weryfikacyjnym. Weryfikacja telefonu jest wymagana do licytowania i wystawiania aukcji.",
      icon: "📱",
      placement: "bottom",
    },
    {
      id: "verify-card",
      targetSelector: "[data-tutorial='user-pill']",
      title: "Podepnij kartę płatniczą",
      description:
        "Dodaj kartę przez Stripe, żeby móc składać oferty na aukcjach. Jako sprzedawca — ustaw też metodę wypłat (IBAN lub BLIK).",
      tip: "Dane karty są bezpiecznie przechowywane przez Stripe — nie mamy do nich dostępu.",
      icon: "💳",
      placement: "bottom",
    },
  ],

  // ── Track 3: Fully verified user learning features ────────────
  features: [
    {
      id: "feat-bid",
      targetSelector: "[data-tutorial='nav-auctions']",
      title: "Jak licytować?",
      description:
        "Wejdź w aukcję, wpisz kwotę i kliknij 'Licytuj'. Możesz też ustawić auto-bid — system będzie automatycznie podbijał do Twojego maksymalnego pułapu.",
      tip: "Aukcje z anty-snipingiem przedłużają się o 5 minut, jeśli ktoś licytuje w ostatniej chwili.",
      icon: "🔨",
      placement: "bottom",
    },
    {
      id: "feat-create",
      targetSelector: "[data-tutorial='create-auction-btn']",
      fallbackPosition: "center",
      title: "Wystaw aukcję",
      description:
        "Kliknij '+' na stronie aukcji. Wypełnij formularz: opis gołębia, zdjęcia, rodowód i ustal cenę wywoławczą lub cenę 'Kup Teraz'.",
      tip: "Wystawienie aukcji wymaga jednorazowej opłaty za listing.",
      icon: "➕",
      placement: "bottom",
      route: "/auctions",
    },
    {
      id: "feat-watchlist",
      targetSelector: "[data-tutorial='watchlist-filter']",
      fallbackPosition: "center",
      title: "Obserwowane",
      description:
        "Kliknij serduszko przy aukcji, żeby dodać ją do obserwowanych. Filtruj listę przyciskiem 'Obserwowane' na stronie aukcji.",
      icon: "❤️",
      placement: "bottom",
      route: "/auctions",
    },
    {
      id: "feat-notifications",
      targetSelector: "[data-tutorial='notification-bell']",
      title: "Powiadomienia",
      description:
        "Dzwonek informuje o nowych ofertach na Twoich aukcjach, zakończonych licytacjach i ważnych wydarzeniach.",
      tip: "Czerwona kropka oznacza nieprzeczytane powiadomienia.",
      icon: "🔔",
      placement: "bottom",
    },
    {
      id: "feat-account",
      targetSelector: "[data-tutorial='user-pill']",
      title: "Panel konta",
      description:
        "Tu zarządzasz profilem, sprawdzasz historię transakcji, przeglądasz swoje aukcje i ustawienia wypłat.",
      icon: "⚙️",
      placement: "bottom",
    },
  ],
};

// Storage keys for tracking completion per track
export const TUTORIAL_STORAGE_KEYS: Record<TutorialTrack, string> = {
  welcome: "palkamtm_tutorial_welcome_done",
  verification: "palkamtm_tutorial_verification_done",
  features: "palkamtm_tutorial_features_done",
};
