# Plan Naprawczy i Raport Stanu Technicznego (Remediation Plan)

## 1. Analiza Ryzyk (Stan Obecny)

### 🚨 Krytyczne (High Priority)

1.  **Bezpieczeństwo CORS:**
    - Plik `server/lib/originUtils.ts` zawiera `PROD_WILDCARD_PATTERNS`, które zezwalają na dostęp z **każdej** aplikacji na Vercel (`*.vercel.app`) i Render (`*.onrender.com`). To poważna luka bezpieczeństwa – złośliwa aplikacja hostowana na tych platformach może wykonywać żądania do Twojego API w imieniu zalogowanego użytkownika.
2.  **Logika Aukcji (Timer):**
    - Frontend (`CardTimer.tsx`) oblicza czas końca na podstawie zegara **klienta** (`Date.now()`). Jeśli użytkownik zmieni czas systemowy, zegar na stronie pokaże błędne dane.
    - Backend zamyka aukcje (`AuctionCronService.ts`) co 1 minutę. To zbyt rzadko dla dynamicznych licytacji ("sniping"). Aukcja może być "martwa" (zakończona czasowo), ale wciąż mieć status `ACTIVE` przez nawet 59 sekund.
3.  **Współbieżność Crona:**
    - `AuctionCronService` nie ma mechanizmu blokady rozproszonej (distributed lock). Jeśli uruchomisz serwer w trybie klastra (wiele instancji), **każda instancja** spróbuje zamknąć te same aukcje, co może prowadzić do podwójnych powiadomień i próby podwójnego obciążenia płatnościami.

### ⚠️ Istotne (Medium Priority)

1.  **Konflikt Migracji (Supabase vs Prisma):**
    - Katalog `supabase/migrations` (47 plików) i `server/prisma/migrations` sugerują dwa źródła prawdy. Ryzyko nadpisania triggerów/funkcji SQL przez Prismę lub odwrotnie.
2.  **Chaos Konfiguracyjny:**
    - Wiele plików Docker (`Dockerfile`, `Dockerfile.web`, etc.) i Env (`.env`, `.env.api`, etc.) w roocie projektu wprowadza ryzyko użycia złej konfiguracji na produkcji.

### ℹ️ Dług techniczny (Low Priority)

1.  **Skrypty w Root:**
    - Luźne pliki `check-admin.js`, `verify-webhook.js` powinny trafić do katalogu `scripts/` dla porządku.

---

## 2. Plan Naprawczy (Action Plan)

Proponuję realizację w 4 fazach:

### Faza 1: Sprzątanie i Bezpieczeństwo (Immediate)

- **Cel:** Usunięcie krytycznej luki CORS i uporządkowanie plików.
- **Zadania:**
  1.  [ ] Usunięcie `PROD_WILDCARD_PATTERNS` z `server/lib/originUtils.ts`.
  2.  [ ] Przeniesienie skryptów (`check-admin.js` itp.) do `server/scripts/`.
  3.  [ ] Konsolidacja plików Docker do folderu `docker/` (lub usunięcie zbędnych).
  4.  [ ] Stworzenie jednego szablonu `.env.template` i usunięcie mylących duplikatów.

### Faza 2: Synchronizacja Czasu i Aukcji (Core Logic)

- **Cel:** Wyeliminowanie błędów zegara i "aukcji zombie".
- **Zadania:**
  1.  [ ] Dodanie endpointu `/api/server-time`.
  2.  [ ] Aktualizacja frontendu, aby obliczał czas relatywnie do czasu serwera (offset), a nie lokalnego zegara.
  3.  [ ] Zwiększenie częstotliwości Crona (lub migracja na kolejkę zadań np. BullMQ dla precyzyjnego zamykania).
  4.  [ ] Dodanie zabezpieczenia przed podwójnym uruchomieniem Crona (np. prosta blokada w Redis lub DB).

### Faza 3: Ujednolicenie Danych

- **Cel:** Rozwiązanie konfliktu Prisma vs Supabase.
- **Zadania:**
  1.  [ ] Ustalenie Supabase jako "Master" schematu.
  2.  [ ] Skonfigurowanie Prismy tylko do introspekcji (`prisma db pull`), bez generowania migracji.

### Faza 4: Obserwowalność

- **Cel:** Lepsze logi.
- **Zadania:**
  1.  [ ] Weryfikacja maskowania danych osobowych (PII) w `logger.ts`.

---

## Decyzja

Czy mam przystąpić do **Fazy 1 (Sprzątanie i Bezpieczeństwo)**? Naprawię `originUtils.ts` (krytyczne) i posprzątam pliki w roocie.
