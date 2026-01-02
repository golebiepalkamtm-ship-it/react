---

# Champion Pigeon Auctions – Szczegółowa dokumentacja strony aukcyjnej

## 1. Przegląd funkcjonalności

### Główne funkcje aplikacji:
- **Lista aukcji**: Przeglądanie, filtrowanie, wyszukiwanie i sortowanie aukcji gołębi pocztowych.
- **Szczegóły aukcji**: Podgląd szczegółów, zdjęć, rodowodu, historii licytacji, składanie ofert.
- **Tworzenie aukcji**: Formularz dla zweryfikowanych użytkowników.
- **Autoryzacja**: Rejestracja, logowanie, weryfikacja email i telefonu (Supabase).
- **Powiadomienia**: System toastów (sonner).
- **Zaawansowane UI**: Komponenty dialogów, przyciski, filtry, responsywność, animacje.

### Architektura aplikacji:
- **Frontend**: Single Page Application (SPA) w React z routingiem
- **Backend**: REST API w Node.js/Express
- **Baza danych**: Supabase (PostgreSQL)
- **Autoryzacja**: Supabase Auth
- **Hosting**: Vercel (frontend), osobny serwer (backend)

## 2. Struktura katalogów i plików

### Kluczowe pliki:
- `src/pages/Auctions.tsx` – strona listy aukcji (główna logika i layout)
- `src/components/AuctionsPage.tsx` – logika filtrowania, wyszukiwania, renderowanie kart aukcji, obsługa modali
- `src/components/AuctionCard.tsx` – pojedyncza karta aukcji (miniatura, cena, czas, rodowód)
- `src/pages/AuctionDetail.tsx` – szczegóły aukcji, licytacja, galeria zdjęć, dane sprzedawcy
- `src/components/CreateAuctionForm.tsx` – formularz dodawania aukcji (walidacja, obsługa pól gołębia)
- `src/hooks/useAuctions.ts` – hooki do pobierania listy aukcji, pojedynczej aukcji, składania ofert
- `src/services/auctionService.ts` – komunikacja z backendem (API REST)
- `src/contexts/AuthContext.tsx` – kontekst autoryzacji użytkownika (Supabase)
- `src/lib/supabase.ts` – konfiguracja klienta Supabase

### Dodatkowe komponenty:
- `src/components/ui/button.tsx` – przyciski z wariantami (default, gold, hero, etc.)
- `src/components/ui/dialog.tsx` – modale i dialogi (Radix UI)
- `src/components/ui/sonner.tsx` – system powiadomień toast
- `src/components/gallery/Carousel3D.tsx` – karuzela 3D championów (Three.js)
- `src/components/gallery/ParticleBackground.tsx` – tło z cząsteczkami

### Typy i interfejsy:
- `src/types/auction.ts` – typy aukcji, ofert, kategorii
- `src/types/index.ts` – eksport wszystkich typów
- `shared/contracts/auction.ts` – współdzielone kontrakty między frontend/backend

## 3. Przepływ danych i API

### Pobieranie aukcji:
```
useAuctions(filters) → auctionService.getAuctions(filters) → API GET /auctions
```
- Filtrowanie i sortowanie po stronie klienta i serwera
- Obsługa paginacji i ładowania

### Szczegóły aukcji:
```
useAuction(id) → auctionService.getAuctionById(id) → API GET /auctions/:id
```
- Pobieranie pełnych danych aukcji, zdjęć, historii licytacji

### Licytacja:
```
useBid(auctionId, token) → auctionService.placeBid(amount, displayName) → API POST /auctions/:id/bid
```
- Walidacja oferty, aktualizacja ceny, powiadomienia
- Obsługa przedłużania aukcji przy ofertach w ostatnich minutach

### Tworzenie aukcji:
```
CreateAuctionForm → auctionService.createAuction(data) → API POST /auctions
```
- Walidacja danych, upload zdjęć, tworzenie rekordu w bazie

### Autoryzacja (Supabase):
- Rejestracja: `AuthContext.signUp(email, password)`
- Logowanie: `AuthContext.signIn(email, password)`
- Logowanie społecznościowe: `signInWithGoogle()`, `signInWithFacebook()`
- Weryfikacja: email → telefon → pełny dostęp

## 4. Hooki i usługi

### Hooki główne:
- `useAuctions(filters)` – lista aukcji z filtrowaniem
- `useAuction(id)` – pojedyncza aukcja
- `useBid(auctionId, token)` – składanie ofert
- `useAuth()` – stan autoryzacji użytkownika
- `useChampions()` – dane championów z manifestu

### Usługi:
- `auctionService` – wszystkie operacje na aukcjach
- `apiClient` – klient HTTP z obsługą błędów i logowaniem
- `supabase` – klient bazy danych i autoryzacji

## 5. Komponenty UI i funkcjonalności

### AuctionsPage:
- Wyszukiwarka z ikoną Search
- Filtry: cena min/max, kategoria, płeć
- Sortowanie: newest, highest, lowest
- Lista kart aukcji z lazy loading
- Modal tworzenia aukcji
- Obsługa stanów ładowania i błędów

### AuctionCard:
- Miniatura zdjęcia (pierwsze z tablicy)
- Tytuł, aktualna cena, czas do końca
- Informacje o rodowodzie
- Badge "Wyróżnione" dla specjalnych aukcji
- Hover efekty z animacjami

### AuctionDetail:
- Galeria zdjęć z przyciskami nawigacji
- Szczegóły gołębia: ring number, bloodline, gender, color, achievements
- Licznik czasu z automatycznym odświeżaniem
- Formularz składania ofert
- Opcja maskowania nicku przy licytacji
- Historia poprzednich ofert

### CreateAuctionForm:
- Pola: tytuł, opis, cena startowa, cena kup teraz
- Dane gołębia: ring number, bloodline, eye color, color, vitality, endurance
- Upload zdjęć (wiele plików)
- Walidacja po stronie klienta
- Wysyłanie do API z obsługą błędów

## 6. Typy danych

### Główne typy aukcji:
```typescript
interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  endTime: string;
  status: 'active' | 'pending' | 'ended';
  category: AuctionCategory;
  userId: string;
  images: string[];
  pigeon?: Pigeon;
  bids?: Bid[];
}

interface Pigeon {
  ringNumber: string;
  bloodline: string;
  gender: 'male' | 'female';
  color: string;
  achievements: string[];
}

interface Bid {
  id: string;
  amount: number;
  userId: string;
  displayName?: string;
  createdAt: string;
}
```

### Filtry i sortowanie:
```typescript
interface AuctionFilters {
  status?: 'active' | 'ended';
  sortBy?: 'newest' | 'highest' | 'lowest';
  search?: string;
  category?: string;
  gender?: 'male' | 'female';
  priceMin?: number;
  priceMax?: number;
}
```

## 7. Konfiguracja środowiska

### Zmienne środowiskowe (.env):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000/api
```

### Vite config (vite.config.ts):
- Proxy do backendu w dev mode
- Chunkowanie: react, three, framer-motion
- Aliasy: @ → src, @shared → shared

### Vercel config (vercel.json):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 8. Technologie i biblioteki

### Core:
- **React 19** – framework UI
- **TypeScript** – typowanie
- **Vite** – bundler i dev server
- **TailwindCSS** – utility-first CSS

### UI/UX:
- **Framer Motion** – animacje
- **Radix UI** – komponenty podstawowe (dialogi, tooltips)
- **Lucide React** – ikony
- **Sonner** – toasty powiadomienia
- **Three.js + React Three Fiber** – 3D galeria

### Dane i autoryzacja:
- **Supabase** – baza danych, autoryzacja, storage
- **React Query** – zarządzanie stanem serwera
- **Zustand** – globalny stan aplikacji

### Narzędzia deweloperskie:
- **ESLint** – linting
- **Prettier** – formatowanie kodu
- **Vitest** – testy (jeśli skonfigurowane)

## 9. Komendy i workflow

### Instalacja i uruchomienie:
```bash
npm install                    # instalacja zależności
npm run dev                    # dev server (port 8080)
npm run build                  # produkcyjny build
npm run preview                # podgląd builda lokalnie
npm run typecheck              # sprawdzenie typów TypeScript
npm run lint                   # linting kodu
```

### Backend (server/):
```bash
cd server
npm install
npm run dev                    # dev server z nodemon
npm run build                  # kompilacja TypeScript
npm start                      # produkcja
```

## 10. Deployment i konfiguracja produkcyjna

### Architektura deploymentu:
- **Frontend**: Vercel (CDN, static hosting)
- **Backend**: Render (Web Service z Node.js)
- **Baza danych**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (zdjęcia aukcji)
- **CI/CD**: GitHub Actions

### Konfiguracja środowiska produkcyjnego:

#### 1. Przygotowanie zmiennych środowiskowych:
```bash
cp .env.production.example .env.production
# Wypełnij rzeczywiste wartości w .env.production
```

#### 2. Konfiguracja Vercel (Frontend):
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Zmienne środowiskowe Vercel:**
- `VITE_SUPABASE_URL` - URL projektu Supabase
- `VITE_SUPABASE_ANON_KEY` - Klucz anonimowy Supabase
- `VITE_API_URL` - URL backendu (https://champion-pigeon-auctions-backend.onrender.com)

#### 3. Konfiguracja Render (Backend):
1. Przejdź do [render.com](https://render.com)
2. Połącz repozytorium GitHub
3. Utwórz nowy **Web Service**
4. Skonfiguruj:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node.js 20

**Zmienne środowiskowe Render:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+48...
FRONTEND_URL=https://champion-pigeon-auctions.vercel.app
```

#### 4. Konfiguracja Supabase:
1. Utwórz projekt na [supabase.com](https://supabase.com)
2. Skonfiguruj Auth (email + phone verification)
3. Skonfiguruj Storage bucket dla zdjęć
4. Uruchom migracje bazy danych

#### 5. Skrypty deploymentowe:

**Automatyczny deployment:**
```bash
./scripts/deploy.sh production all    # pełny deployment
./scripts/deploy.sh production frontend  # tylko frontend
./scripts/deploy.sh production backend   # tylko backend
```

**Push z deploymentem:**
```bash
./scripts/push.sh feature/new-feature "Add new feature" all
```

### CI/CD Pipeline (GitHub Actions):

#### Workflow dla frontendu (deploy-vercel.yml):
- Uruchamia się na push do `main`
- Sprawdza linting i typy
- Buduje aplikację
- Deployuje na Vercel

#### Workflow dla backendu (ręczne):
- Backend wymaga ręcznego setupu na Render
- Environment variables konfigurowane w dashboard Render

### Checklist przed deploymentem:

#### Frontend:
- [ ] `npm run typecheck` przechodzi bez błędów
- [ ] `npm run lint` bez błędów
- [ ] `npm run build` tworzy katalog `dist`
- [ ] Wszystkie zmienne środowiskowe skonfigurowane w Vercel

#### Backend:
- [ ] `npm run build` w katalogu server/ przechodzi
- [ ] Wszystkie zmienne środowiskowe w Render
- [ ] Baza danych Supabase skonfigurowana
- [ ] Migracje Prisma uruchomione

#### Ogólne:
- [ ] Domena skonfigurowana (opcjonalnie)
- [ ] SSL certyfikaty (Vercel automatycznie)
- [ ] Backup bazy danych skonfigurowany
- [ ] Monitoring błędów (np. Sentry)

### Troubleshooting deploymentu:

#### Problem: Build Vercel nie przechodzi
```bash
# Sprawdź lokalnie
npm run build
npm run typecheck
npm run lint
```

#### Problem: Backend nie uruchamia się na Render
- Sprawdź logs w dashboard Render
- Upewnij się że wszystkie env variables są ustawione
- Sprawdź czy port jest ustawiony na 10000

#### Problem: API calls nie działają
- Sprawdź CORS w backendzie
- Upewnij się że `VITE_API_URL` wskazuje na poprawny URL
- Sprawdź sieć w DevTools przeglądarki

#### Problem: Baza danych nie łączy się
- Sprawdź `DATABASE_URL` w Render
- Upewnij się że Supabase pozwala na połączenia zewnętrzne
- Sprawdź credentials w Supabase dashboard

### Optymalizacja wydajności:

#### Frontend:
- Code splitting automatycznie skonfigurowany w `vite.config.ts`
- Chunky: react, three, framer-motion
- Lazy loading komponentów
- Optymalizacja obrazów przez Vercel

#### Backend:
- Rate limiting skonfigurowane
- Compression włączone
- Database connection pooling
- Redis cache (opcjonalnie)

### Monitoring i logowanie:
- **Frontend**: Vercel Analytics
- **Backend**: Render logs + własne logowanie do pliku
- **Baza**: Supabase dashboard
- **Errors**: Można dodać Sentry dla błędów produkcyjnych

## 10. API Endpoints

### Aukcje:
- `GET /auctions` – lista aukcji z filtrami
- `GET /auctions/:id` – szczegóły aukcji
- `POST /auctions` – tworzenie aukcji
- `POST /auctions/:id/bid` – składanie oferty

### Użytkownicy:
- `GET /users/profile` – profil użytkownika
- `PUT /users/profile` – aktualizacja profilu

### Autoryzacja (Supabase):
- Obsługiwane przez Supabase SDK

## 11. Przepływ autoryzacji

### Poziomy weryfikacji:
1. **USER_REGISTERED** – zarejestrowany, email niepotwierdzony
2. **USER_EMAIL_VERIFIED** – email potwierdzony, brak telefonu
3. **USER_FULL_VERIFIED** – pełna weryfikacja (email + telefon)
4. **ADMIN** – administrator

### Ograniczenia dostępu:
- Lista aukcji: wszyscy
- Szczegóły aukcji: wszyscy
- Licytacja: zalogowani
- Tworzenie aukcji: USER_FULL_VERIFIED lub ADMIN

## 12. Troubleshooting

### Częste problemy:

#### Build nie przechodzi:
- Sprawdź błędy TypeScript: `npm run typecheck`
- Wyczyść node_modules: `rm -rf node_modules && npm install`
- Sprawdź zmienne środowiskowe

#### API nie działa:
- Sprawdź czy backend działa na porcie 8000
- Weryfikuj zmienne środowiskowe VITE_API_URL
- Sprawdź CORS w backendzie

#### Autoryzacja nie działa:
- Sprawdź konfigurację Supabase
- Weryfikuj zmienne środowiskowe
- Sprawdź status Supabase w dashboardzie

#### Chunky za duże:
- Ostrzeżenie o rozmiarze >500KB można ignorować (ustawione na 1500KB)
- Dla optymalizacji: dynamiczne importy dużych komponentów

### Debugowanie:
- Użyj React DevTools do inspekcji komponentów
- Sprawdź Network tab w DevTools dla API calls
- Logi w konsoli przeglądarki

## 13. Rozwój i rozszerzenia

### Możliwe usprawnienia:
- PWA (Progressive Web App) – service worker już częściowo zaimplementowany
- Real-time updates – WebSocket dla licytacji na żywo
- Push notifications – powiadomienia o kończących się aukcjach
- Advanced search – pełnotekstowe wyszukiwanie
- Analytics – śledzenie zachowań użytkowników

### Testowanie:
- Unit tests dla hooków i usług
- Integration tests dla komponentów
- E2E tests z Playwright/Cypress

---

**Autor:** Marcin Palka  
**Data aktualizacji:** 2025-12-31  
**Wersja:** 1.0.0
