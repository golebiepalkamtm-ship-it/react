# Champion Pigeon Auctions - Instrukcje dla AI Copilot

## Przegląd Projektu
**Champion Pigeon Auctions** to pełnoprawna platforma aukcyjna napisana w TypeScript do hodowli i wyścigów gołębi. Struktura monorepo z frontendem React, backendem Express.js, bazą PostgreSQL i licytacją w czasie rzeczywistym poprzez WebSockets.

## Architektura & Kluczowe Komponenty

### Struktura Systemu
```
Frontend (React 19 + Vite) → API Gateway (Express) → Database (PostgreSQL + Prisma)
                                      ↓
                            WebSocket Server (Socket.IO)
```

### Krytyczne Granice Serwisów
1. **Frontend** (`src/`) - React + TailwindCSS + Three.js dla galerii 3D
   - React Query (TanStack) do zarządzania stanem serwera
   - Zustand do lokalnego stanu
   - Klient API w [src/services/api.ts](src/services/api.ts)
2. **Backend** (`server/`) - Express.js z JWT + Supabase Auth
   - Prisma ORM z PostgreSQL
   - Socket.IO do aktualizacji aukcji w czasie rzeczywistym
   - Warstwa serwisów dla logiki biznesowej (scentralizowana w `server/services/`)
3. **Baza Danych** (`prisma/schema.prisma`) - Supabase PostgreSQL z RLS
   - Kluczowe modele: `User`, `Auction`, `Bid`, `Payment`, `Review`
   - Role użytkowników: `USER_REGISTERED` → `USER_EMAIL_VERIFIED` → `USER_FULL_VERIFIED` → `ADMIN`

### Przepływ Autentykacji i Autoryzacji
- **Supabase Auth**: Zarządzanie sesjami użytkownika (JWT)
- **Frontend** ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)): Sesja Supabase, pobieranie profilu, modale weryfikacji email/telefonu
- **Backend** (`server/middleware/auth.ts`): Walidacja JWT, ekstrakcja roli, limitowanie żądań
- **Ochrona Roli** (triggery Supabase): Zapobiega nieautoryzowanej eskalacji roli
- **System OTP**: Integracja Twilio Verify do weryfikacji SMS (5 wysyłek / 10 weryfikacji na 5 minut na IP)

**Kluczowy wgląd**: Nigdy nie ufaj roli z frontendu—zawsze weryfikuj na backendzie. Zmiany roli następują przez triggery Supabase, nie bezpośrednio przez API.

## Krytyczne Przepływy Pracy Deweloperskie

### Lokalne Środowisko Deweloperskie
```bash
npm install && cd server && npm install && cd ..
cp .env.example .env && cp server/.env.example server/.env
npx prisma generate && npx prisma migrate dev
npm run dev  # Uruchamia frontend + backend jednocześnie
```

### Migracje Bazy Danych
```bash
npx prisma migrate dev --name <nazwa_migracji>  # Tworzy migrację
npx prisma generate  # Wymagane po zmianach schematu
```

### Budowanie & Produkcja
```bash
npm run build           # Buduje frontend (Vite)
cd server && npm run build && npm run start  # Backend
```

### Kontrola Jakości Kodu
```bash
npm run lint            # ESLint bez ostrzeżeń
npm run lint:fix        # Auto-naprawienie
npm test               # Testy Vitest
```

## Wzorce Specyficzne dla Projektu

### 1. Wzorzec Warstwy Serwisów (DDD)
**Wzorzec**: Scentralizuj logikę biznesową w serwisach, handlery tras delegują do serwisów.
- **Lokalizacja**: `server/services/` (np. `AuctionService`, `PaymentService`)
- **Przykład**: Logika licytacji żyje w `AuctionService.placeBid()` — zarówno REST jak i WebSocket ją wywołują
- **Powód**: Zapobiega duplikacji między REST API a WebSocket, zapewnia spójność
- **Kluczowy serwis**: [server/services/](server/services/) zawiera `AuctionService` z bezpiecznymi transakcjami używając `prisma.$transaction`

### 2. Aktualizacje Czasu Rzeczywistego via WebSocket (Socket.IO)
- **Serwer**: [server/websocket/](server/websocket/) - obsługuje połączenia, emituje aktualizacje aukcji
- **Klient**: Słucha zdarzeń `auction:updated`, `bid:placed` via `socket.io-client`
- **Zapobieganie Warunkom Wyścigu**: Row-level locking (`FOR UPDATE`) w zapytaniach bazy podczas licytacji
- **Fallback**: Gdy WebSocket niedostępny, polling HTTP via React Query

### 3. Pipeline Walidacji (Zod)
- **Frontend**: Walidacja formularzy schematami Zod przed wysłaniem
- **Backend**: Wszystkie endpointy API walidują wejście Zod (np. `schemas/auction.ts`)
- **Baza Danych**: Ograniczenia na poziomie DB (NOT NULL, unique indexes)
- **Wzorzec**: Zdefiniuj schemat raz, udostępnij do wszystkich warstw walidacji

### 4. Strategia Cachowania
- **Cache w Pamięci**: Backend używa TTL-based cache dla aukcji (`server/lib/cache.ts`)
- **React Query**: Frontend cachuje odpowiedzi API z staleTime/gcTime
- **Invalidacja**: Czyszczenie cache na mutacjach (POST/PUT/DELETE) natychmiast
- **Ważne**: Zdarzenia WebSocket wyzwalają invalidację cache dla spójności czasu rzeczywistego

### 5. Obsługa Błędów i Logowanie
- **Frontend**: Powiadomienia toast Sonner dla błędów
- **Backend**: Standaryzowane odpowiedzi błędów z kodami HTTP (400, 401, 403, 500)
- **Logowanie**: Użyj narzędzia `logger` (nie `console.log`) do strukturyzowanych logów
- **Bez Ukrywania**: Zawsze loguj błędy w miejscu catch, nie milcz

## Zewnętrzne Zależności i Punkty Integracji

### Supabase
- **URL**: Z `VITE_SUPABASE_URL`
- **Klucze**: Klucz anonimowy (frontend), klucz service role (backend do operacji admin)
- **Auth**: Tokeny JWT wydane przez Supabase, backend waliduje za pomocą JWT_SECRET
- **RLS**: Polityki bezpieczeństwa na poziomie wierszy wymuszają reguły dostępu
- **Pułapka**: Fallback service role key do anonimowego jest niebezpieczny—wymagaj jawnej zmiennej env

### Twilio Verify
- **Cel**: SMS OTP do weryfikacji telefonu
- **Endpointy**: `/api/auth/otp/send`, `/api/auth/otp/verify`
- **Limity Szybkości**: Wbudowane (5 wysyłek, 10 weryfikacji na 5 minut)
- **Zmienne Env**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`

### Socket.IO
- **Port**: Zazwyczaj 3001 (backend)
- **CORS**: Musi pasować do źródła frontendu w produkcji
- **Zdarzenia**: `auction:updated`, `bid:placed`, `auction:ended`
- **Połączenie**: Auto-reconnect z exponential backoff
- **Namespace**: Jeden namespace `/` (rozważ ekstrakcję do `/auctions` dla skali)

### Stripe (jeśli włączone płatności)
- **Klucz Klienta**: Ze środowiska
- **Klucz Serwera**: Tajny klucz w env backendu
- **Webhooki**: Waliduj sygnaturę używając raw body (nie sparsowanego JSON)

## Częste Pułapki i Rozwiązania

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|-----------|
| Warunki wyścigu w licytacji | Równoczesne żądania bez blokowania | Użyj `FOR UPDATE` w Prisma: `prisma.auction.findUnique({...}).auction.update(...)` w transakcji |
| Cache ze starymi danymi | Brak invalidacji na mutacji | Wywołaj `queryClient.invalidateQueries()` po POST/PUT/DELETE |
| Licytacja WebSocket zawodzi milcząco | Połączenie przerywa się niezauważone | Implementuj handler reconnect z fallback do HTTP polling |
| Błędy typów w Zod | Niezgodność schematu i typu | Zawsze `const schema = z.object(...)` potem `type Type = z.infer<typeof schema>` |
| Token auth wygasa | Frontend trzyma stary JWT | Supabase auto-refresh; jeśli 401, wyzwól flow re-logowania |
| Luka eskalacji roli | Zaufanie roli z frontendu | ZAWSZE re-waliduj rolę użytkownika na backendzie przed operacjami uprzywilejowanymi |

## Konfiguracja Środowiska

### Wymagane Zmienne Frontend (`.env`)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
VITE_API_BASE_URL=http://localhost:8001/api
VITE_WS_URL=http://localhost:3001
VITE_DISABLE_AUTH_GUARDS=false (tylko dev)
```

### Wymagane Zmienne Backend (`server/.env`)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxx...  (MUSI być service role, nie anon)
JWT_SECRET=<z ustawień JWT Supabase>
DATABASE_URL=postgresql://user:pass@host/db
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
CLIENT_URL=http://localhost:5173 (CORS origin)
```

## Highlights Struktury Plików

- [src/components/](src/components/) - Komponenty React do wielokrotnego użytku wg domeny
- [src/pages/](src/pages/) - Komponenty stron bazowane na trasach
- [src/services/api.ts](src/services/api.ts) - Scentralizowany klient HTTP z CSRF
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - Globalny stan auth + zarządzanie sesją
- [server/routes/](server/routes/) - Handlery tras Express (delegują do serwisów)
- [server/middleware/](server/middleware/) - Auth, limitowanie żądań, obsługa błędów
- [server/services/](server/services/) - Logika biznesowa (aukcje, płatności, użytkownicy)
- [server/websocket/](server/websocket/) - Handlery zdarzeń Socket.IO
- [prisma/schema.prisma](prisma/schema.prisma) - Model danych (jedno źródło prawdy)

## Szybki Podgląd Poleceń

| Zadanie | Polecenie |
|--------|----------|
| Uruchamianie serwerów dev | `npm run dev` |
| Formatowanie kodu | `npm run lint:fix` |
| Type-check | `cd server && npm run type-check` |
| Generowanie klienta Prisma | `npx prisma generate` |
| Przeglądanie schematu bazy | `npx prisma studio` |
| Tworzenie migracji | `npx prisma migrate dev --name <nazwa>` |
| Seeding danych testowych | `cd server && npm run seed:json` |

## Testowanie i Debugowanie

- **Frontend**: Vitest + React Testing Library (zobacz `src/**/*.test.tsx`)
- **Backend**: Proste pliki testów w `server/tests/`
- **E2E**: Testy Playwright (zobacz `e2e/`)
- **Debug**: DevTools przeglądarki do frontendu, `console.log()` → strukturyzowane `logger` do backendu
- **Testowanie API**: Użyj rozszerzenia REST client w VS Code (pliki .rest lub .http)

## Uwagi Wydajnościowe

- **Lazy load tras** na fronendzie do code splittingu (Vite obsługuje automatycznie)
- **Batch zapytań do bazy** gdy możliwe (Prisma `findMany` vs wielokrotne `findUnique`)
- **Użyj connection pooling** dla PostgreSQL (Prisma obsługuje via `@prisma/adapter-pg`)
- **Optymalizuj zdarzenia WebSocket** - nie broadcast całego obiektu aukcji, wyślij delty
- **Ustaw nagłówki response cache** - odpowiedni `Cache-Control` dla statycznych zasobów

## Dodawanie Nowych Funkcji

1. **Zdefiniuj model danych** najpierw w [prisma/schema.prisma](prisma/schema.prisma)
2. **Stwórz migrację**: `npx prisma migrate dev --name nazwa_funkcji`
3. **Implementuj serwis backendu** w `server/services/`
4. **Stwórz trasy API** w `server/routes/`, deleguj do serwisu
5. **Dodaj schematy Zod** do walidacji w `server/schemas/`
6. **Buduj frontend** z React hooks, użyj React Query do pobierania danych
7. **Dodaj zdarzenie WebSocket** jeśli potrzebny czas rzeczywisty w `server/websocket/`
8. **Testuj end-to-end** lokalnie przed commitowaniem

---

**Ostatnia Aktualizacja**: Styczeń 2026  
**Opiekun**: Zespół Development  
**Zobacz Też**: [docs/README.md](docs/README.md) dla szczegółowej architektury, [docs/AUTH_SYSTEM.md](docs/AUTH_SYSTEM.md) dla szczegółów autentykacji
