# Strona Główna — Dokumentacja

## Cel

- Opis architektury i sekcji strony głównej
- Wskazanie miejsc w kodzie odpowiedzialnych za layout, animacje i dane
- Instrukcje modyfikacji treści i zachowania strony

## Lokalizacja i Routing

- Główna strona działa pod adresem `/` i jest renderowana przez komponent Index
- Kluczowe pliki:
  - [App.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/App.tsx) — definicje tras i providerów
  - [lazyImports.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/utils/lazyImports.tsx) — mapowanie lazy komponentów stron
  - [Index.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/Index.tsx) — „Unified Premium Homepage”
- Dodatkowe warianty strony (showcase):
  - [HomePage.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/HomePage.tsx) — wersja zoptymalizowana
  - [HomePagePremium.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/HomePagePremium.tsx) — wersja demonstracyjna z rozbudowanymi animacjami

## Architektura i Provider’y

- Provider’y globalne:
  - ThemeProvider — motyw (domyślnie „dark”)
  - LocaleProvider — lokalizacja/język
  - AuthProvider — uwierzytelnienie i stan użytkownika
  - UIProviders — biblioteka UI i portale
  - QueryClientProvider — cache zapytań (react-query)
  - SmoothScrollProvider — płynne przewijanie i integracja z GSAP
  - GSAPPageTransition — animacje przejść między stronami
- Kod referencyjny: [App.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/App.tsx)

## Sekcje na stronie głównej

- Sekcje są składane w [Index.tsx:L866-L893](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/Index.tsx#L866-L893)
- Lista sekcji:
  - Header — nawigacja główna, logo, linki
  - HeroPremium — sekcja bohatera z animacjami, intro marki
  - AboutSection — informacje o hodowli i dziedzictwie
  - Carousel3D — galeria championów 3D
  - FeaturesSectionPremium — kluczowe wyróżniki oferty
  - PressSection — publikacje i artykuły prasowe
  - CTASectionPremium — wezwanie do działania (link do galerii)
  - ContactSection — kontakt i formularze
  - Footer — stopka i informacje dodatkowe

## Animacje i Interakcje

- GSAP + ScrollTrigger — orkiestracja animacji przewijania
- Lenis (via SmoothScrollProvider) — płynne przewijanie
- Framer Motion — drobne interakcje i przejścia
- Własne easingi i narzędzia:
  - [gsapConfig](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/lib/gsapConfig.ts)
  - [customEasings](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/lib/customEasings.ts)
- Tło i parallax:
  - [GlobalParallaxBackground](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/components/GlobalParallaxBackground.tsx)
- Przykłady efektów w wariantach:
  - [HomePage.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/HomePage.tsx)
  - [HomePagePremium.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/HomePagePremium.tsx)

## Dane i Integracje

- Sekcja Press/Articles może korzystać z danych z `public/press` i/lub backendu
- Galerie championów bazują na danych w `public/champions`
- Uwierzytelnienie i komunikaty:
  - `AuthProvider` + komponent `UnifiedModal` dla powiadomień
  - Kod referencyjny modala w [Index.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/Index.tsx)

## Styl i Motyw

- Tailwind CSS — klasy utility
- Motywy i kolory:
  - „gold”, „zinc”, tła gradientowe, warstwy depth
- Konfiguracja motywu: ThemeProvider (klucz `champion-pigeon-theme`)

## Jak modyfikować treści

- Hero/Intro:
  - Edytuj nagłówki i teksty w `HeroPremium` (wewnątrz [Index.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/Index.tsx))
- Features:
  - Zmieniaj elementy tablicy `features` w `FeaturesSectionPremium`
  - Kod referencyjny: [HomePage.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/HomePage.tsx), [HomePagePremium.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/HomePagePremium.tsx)
- CTA:
  - Tekst i link w `CTASectionPremium` (np. do `/champions`)
- Sekcje About/Press/Contact/Footer:
  - Edytuj komponenty w `src/components/`:
    - [AboutSection.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/components/AboutSection.tsx)
    - [PressSection.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/components/PressSection.tsx)
    - [ContactSection.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/components/ContactSection.tsx)
    - [Footer.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/components/Footer.tsx)

## Wydajność i praktyki

- Używaj transform/opacity; unikaj kosztownych filtrów (duży blur)
- Czyść timeline’y GSAP przy unmount (useEffect cleanup)
- Korzystaj z `will-change` rozważnie, tylko podczas aktywnej animacji
- Lazy loading stron przez `React.lazy` + `Suspense`
- Zachowaj „60 FPS” przez unikanie reflow i malowania dużych obszarów

## Debugowanie i testy

- Tymczasowo wyłączaj SmoothScroll/GSAP, aby lokalizować problem
- Sprawdzaj błędy konsoli; logika auth i modale w [Index.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/Index.tsx)
- Testy e2e i smoke mogą używać tras `/` oraz komponentów sekcji

## Szybkie linki do kluczowych fragmentów

- Skład sekcji na stronie: [Index.tsx:L866-L893](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/pages/Index.tsx#L866-L893)
- Routing: [App.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/App.tsx)
- Lazy mapowanie: [lazyImports.tsx](file:///c:/Users/Marcin_Palka/Desktop/qqqq/champion-pigeon-auctions/src/utils/lazyImports.tsx)

