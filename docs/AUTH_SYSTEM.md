# Dokumentacja systemu rejestracji, logowania i autoryzacji

## 1. Architektura i komponenty

| Warstwa | Kluczowe moduły | Opis |
| --- | --- | --- |
| Frontend (Vite/React, TS) | `src/contexts/AuthContext.tsx`, `src/pages/Auth.tsx`, `src/components/auth/PhoneVerification.tsx`, `src/components/ProtectedRoute.tsx` | Zarządza sesją Supabase, formularzami rejestracji/logowania, modalami informacyjnymi oraz wymuszaniem ról w UI. |
| Backend (Express, server/) | `server/routes/auth.ts`, `server/middleware/auth.ts`, `server/lib/sms.ts`, `server/types/roles.ts` | Endpoints OTP, profil `/auth/me`, middleware JWT z Supabase, integracja Twilio Verify. |
| Baza danych (Supabase Postgres) | `supabase/migrations/20260112000002_fix_role_protection.sql` + pozostałe migracje | Tabela `auth.users` (źródło prawdy), `public.users` (profil). Triggery `handle_email_confirmation` i `handle_phone_confirmation` zarządzają rolami. |

### Role i hierarchia

- `USER_REGISTERED` → konto utworzone, bez weryfikacji.
- `USER_EMAIL_VERIFIED` → email potwierdzony, profil dostępny.
- `USER_FULL_VERIFIED` → email + telefon, pełne funkcje aukcyjne.
- `ADMIN` → ręcznie nadawana rola.

Hierarchia i helpery: `src/components/ProtectedRoute.tsx` oraz `server/types/roles.ts`.

## 2. Przepływ rejestracji

1. Formularz (`src/pages/Auth.tsx` tryb „register” lub `src/pages/Register.tsx`) waliduje hasło i wywołuje `signUp()` z `AuthContext`.
2. `signUp()` (`AuthContext`, @src/contexts/AuthContext.tsx#405-430) korzysta z `supabase.auth.signUp`, ustawiając `emailRedirectTo` → `/verify-email`. Email zapisywany jako `pendingEmailVerification`.
3. Supabase wysyła link aktywacyjny. Do momentu kliknięcia użytkownik ma rolę `USER_REGISTERED`.
4. Po kliknięciu linku Supabase wywołuje trigger `handle_email_confirmation` (migracja @supabase/migrations/20260112000002_fix_role_protection.sql#41-84), który:
   - ustawia flagę `app.bypass_role_protection`,
   - aktualizuje `public.users.role` na `USER_EMAIL_VERIFIED` (lub `USER_FULL_VERIFIED`, jeśli telefon już potwierdzony),
   - aktualizuje `updated_at`.

## 3. Weryfikacja emaila na frontendzie

1. Po powrocie z linku Supabase dodaje parametry `token_hash` i `type=email`.
2. `AuthContext` w `useEffect` (@src/contexts/AuthContext.tsx#245-355) wykrywa parametry i woła `supabase.auth.verifyOtp`.
3. Sukces usuwa parametry z URL, ustawia `session`, `user`, czyści `pendingEmailVerification` i fetchuje profil (`fetchProfile`).
4. Widok `/verify-email` (`src/pages/VerifyEmail.tsx`) pokazuje status i pozwala ponownie wysłać maila (Supabase `auth.resend`).

## 4. Logowanie

### Hasło + email

- Formularz w `src/pages/Auth.tsx` (mode=login) lub `src/pages/Login.tsx`.
- `signIn()` (`AuthContext`, @src/contexts/AuthContext.tsx#432-440) używa `supabase.auth.signInWithPassword`.
- Po sukcesie `AuthContext` pobiera profil (`fetchProfile`) i pokazuje modal sukcesu/kieruje wg roli.

### OAuth (Google/Facebook)

- Przyciski w `src/pages/Auth.tsx` / `Login.tsx` wywołują odpowiednio `signInWithGoogle()` / `signInWithFacebook()`.
- `AuthContext` obsługuje wymianę kodu `supabase.auth.exchangeCodeForSession` oraz błędy OAuth (@src/contexts/AuthContext.tsx#301-355).
- Po udanym `exchange` czyszczone są parametry `code/state/error`, a użytkownik dostaje modal sukcesu w `Auth.tsx`.

## 5. Sesja i profil

- `AuthContext` utrzymuje `user`, `session`, `profile`, `pendingEmailVerification`.
- `fetchProfile()` (@src/contexts/AuthContext.tsx#185-234) pobiera rekord z `public.users`, a w razie braku wywołuje `ensureProfile()` (tworzy profil, ustawia username).
- Po każdej zmianie sesji (listener `onAuthStateChange`) odświeżany jest token CSRF (`apiClient.getCSRFToken()`), sesja i profil.

## 6. Weryfikacja telefonu (OTP)

1. Komponent `PhoneVerification` (@src/components/auth/PhoneVerification.tsx) wysyła żądania na `/api/auth/otp/send` (numer w formacie E.164). Nagłówek `Authorization: Bearer <access_token>` pochodzi z Supabase.
2. Backend `server/routes/auth.ts`:
   - `/otp/send`: walidacja Zod, limiter 5 prób/5 min, wywołanie `smsService.sendVerificationCode` (Twilio Verify, @server/lib/sms.ts#1-101).
   - `/otp/verify`: walidacja numeru i 6-cyfrowego kodu, limiter 10 prób/5 min. Po pozytywnej walidacji:
     1. `supabase.auth.admin.updateUserById` ustawia `phone` i `phone_confirm`.
     2. (Fallback) aktualizuje `public.users.phone`.
     3. Triggery `handle_phone_confirmation` promują rolę do `USER_FULL_VERIFIED` jeśli email jest potwierdzony (@supabase/migrations/20260112000002_fix_role_protection.sql#85-130).

## 7. Autoryzacja backendu

- Middleware `authMiddleware` (@server/middleware/auth.ts) wymaga nagłówka `Authorization: Bearer <JWT>`:
  1. Wyciąga token, zapisuje w `req.authToken`.
  2. Przez `verifyJWTTokenWithRole` (wspólny serwis, patrz `server/lib/...`, nie pokazany w tej dokumentacji) waliduje token Supabase i rolę.
  3. Ustawia `req.user = { id, email, role }`.
  4. Obsługuje rate limiting per IP.

- Endpoint `/auth/me` (@server/routes/auth.ts#110-159) łączy dane z `auth.users` i `public.users`, oblicza rolę (`calculateRole`) i zwraca spójny profil.

## 8. Autoryzacja frontendowa

- `ProtectedRoute` (@src/components/ProtectedRoute.tsx) wymusza minimalne role:
  - Brak usera → redirect `/auth?mode=login`.
  - Rola niewystarczająca → przekierowanie na `/verify-email` lub `/` z `openAccount`.
  - Zmienna `VITE_DISABLE_AUTH_GUARDS` może tymczasowo wyłączyć strażników (np. w demo).
- Helpery `canCreateAuction`, `canBid`, `canAccessProfile` korzystają z hierarchii ról.

## 9. Ścieżki błędów i bezpieczeństwo

- Limity OTP: 5 wysyłek / 10 weryfikacji w 5 min per IP (Express rate limitery).
- `protect_user_role` trigger zabezpiecza przed próbami zmiany roli na poziomie API. Jedynie funkcje serwisowe (z `app.bypass_role_protection=true`) mogą aktualizować role.
- CSRF: `apiClient.getCSRFToken()` inicjalizowany przy starcie i po zalogowaniu.
- OAuth: błędy `error`, `error_description`, `error_code` odczytywane w `Auth.tsx` i mapowane na komunikaty modala.

## 10. Wymagane zmienne środowiskowe

- Frontend (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_AUTH_REDIRECT_URL` (opcjonalnie), `VITE_API_URL`, `VITE_WS_URL`.
- Backend (`server/.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (konieczne do `auth.admin.*`), `JWT_SECRET`, `DATABASE_URL`, `CLIENT_URL`, Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` lub `TWILIO_API_KEY`/`TWILIO_API_SECRET`, `TWILIO_VERIFY_SERVICE_SID`, `TWILIO_PHONE_NUMBER`.

## 11. Diagnostyka

- Logowanie/WS/CSRF: patrz `logger` w `AuthContext`.
- OAuth problemy: pliki `OAUTH_TROUBLESHOOTING.md`, `GOOGLE_OAUTH_CONFIG_CHECK.md`.
- SMS: ostrzeżenia w `server/lib/sms.ts` gdy brak kredensjali – wówczas OTP działa tylko logicznie (zwracany `false`).

## 12. Typowe scenariusze użytkownika

1. **Rejestracja email+hasło** → email potwierdza → rola `USER_EMAIL_VERIFIED` → uzupełnia profil/telefon → `USER_FULL_VERIFIED`.
2. **Logowanie email+hasło** → `AuthContext` pobiera profil → `ProtectedRoute` wpuszcza jeśli rola ≥ wymaganej.
3. **Logowanie OAuth (Google/Facebook)** → przekierowanie → `exchangeCodeForSession` → modal sukcesu → ewentualnie weryfikacja emailowa (Supabase nadal wymaga confirm linku).
4. **Weryfikacja telefonu** → `/otp/send` (Twilio) → `/otp/verify` → `auth.admin.updateUserById` + trigger → rola `USER_FULL_VERIFIED`.

## 13. Rozszerzenia / TODO

- Monitorowanie driftu ról (obecnie `protect_user_role` + triggery, ale warto okresowo uruchamiać skrypty audytowe).
- Dodanie UI do resetu hasła (Supabase `resetPasswordForEmail`) – obecnie brak.
- Automatyczne przypomnienia o niedokończonej weryfikacji (np. powiadomienia email/SMS).

Dokument odzwierciedla stan repozytorium z dnia 2026-01-15. W przypadku modyfikacji przepływów uwzględnij aktualizację tej dokumentacji.
