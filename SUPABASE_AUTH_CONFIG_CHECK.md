# Sprawdzenie konfiguracji autoryzacji Supabase

## 📋 Podsumowanie

**Projekt:** `nctvwxiqzbedgcmetyal` (react)  
**URL:** `https://nctvwxiqzbedgcmetyal.supabase.co`  
**Status:** ACTIVE_HEALTHY  
**Region:** eu-west-1

---

## ✅ 1. Rejestracja (Email + Hasło)

### Status w kodzie: ✅ Zaimplementowane
- **Lokalizacja:** `src/contexts/AuthContext.tsx` (linie 189-214)
- **Funkcja:** `signUp(email, password)`
- **Email redirect:** Konfigurowany przez `VITE_AUTH_REDIRECT_URL` lub domyślnie `/verify-email`

### Co sprawdzić w Dashboard Supabase:

1. **Authentication > Providers > Email**
   - ✅ Email provider powinien być **ENABLED**
   - ✅ **Enable email confirmations** powinno być **WŁĄCZONE** (domyślnie włączone na hosted projects)
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

2. **Authentication > URL Configuration**
   - ✅ **Site URL** powinien być ustawiony (np. `https://twoja-domena.com`)
   - ✅ **Redirect URLs** powinny zawierać:
     - `http://localhost:5173/**` (dla developmentu)
     - `https://twoja-domena.com/**` (dla produkcji)
     - `https://twoja-domena.com/verify-email` (dla weryfikacji email)
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration

---

## ✅ 2. Weryfikacja Email

### Status w kodzie: ✅ Zaimplementowane
- **Lokalizacja:** 
  - `src/pages/VerifyEmail.tsx` - strona weryfikacji
  - `src/contexts/AuthContext.tsx` - logika weryfikacji
  - `supabase/migrations/setup_security.sql` - trigger automatycznie aktualizuje rolę po weryfikacji

### Co sprawdzić w Dashboard Supabase:

1. **Authentication > Email Templates**
   - ✅ Sprawdź szablon **"Confirm signup"**
   - ✅ Powinien zawierać link z `{{ .ConfirmationURL }}` lub `{{ .TokenHash }}`
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/templates

2. **Authentication > Settings**
   - ✅ **Enable email confirmations** - powinno być **WŁĄCZONE**
   - ✅ **SMTP Settings** - sprawdź czy masz skonfigurowany SMTP (dla produkcji)
     - Domyślny SMTP Supabase ma limit 4 emaili/godzinę
     - Dla produkcji zalecane: własny SMTP (SendGrid, AWS SES, etc.)
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth

3. **Email Rate Limits**
   - Domyślnie: 4 emaile/godzinę (wbudowany SMTP)
   - Z własnym SMTP: 30 nowych użytkowników/godzinę
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/rate-limits

---

## ✅ 3. Rejestracja przez Google (OAuth)

### Status w kodzie: ✅ Zaimplementowane
- **Lokalizacja:** `src/contexts/AuthContext.tsx` (linie 225-240)
- **Funkcja:** `signInWithGoogle()`
- **Redirect:** Konfigurowany przez `VITE_AUTH_REDIRECT_URL` lub domyślnie `/auth`

### Co sprawdzić w Dashboard Supabase:

1. **Authentication > Providers > Google**
   - ✅ **Google Enabled** powinno być **WŁĄCZONE**
   - ✅ **Client ID (for OAuth)** - powinien być ustawiony
   - ✅ **Client Secret (for OAuth)** - powinien być ustawiony
   - ✅ **Client IDs (for native sign-in)** - opcjonalnie dla mobile apps
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

2. **Google Cloud Console** (jeśli nie skonfigurowane):
   - Utwórz OAuth 2.0 Client ID w Google Cloud Console
   - **Authorized JavaScript origins:** Dodaj `https://nctvwxiqzbedgcmetyal.supabase.co`
   - **Authorized redirect URIs:** Dodaj callback URL z Supabase Dashboard
   - **Scopes:** `openid`, `email`, `profile`

3. **Callback URL dla Google:**
   - Powinien być: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
   - Skopiuj z Dashboard: Authentication > Providers > Google

---

## ✅ 4. Rejestracja przez Facebook (OAuth)

### Status w kodzie: ✅ Zaimplementowane
- **Lokalizacja:** `src/contexts/AuthContext.tsx` (linie 242-257)
- **Funkcja:** `signInWithFacebook()`
- **Redirect:** Konfigurowany przez `VITE_AUTH_REDIRECT_URL` lub domyślnie `/auth`

### Co sprawdzić w Dashboard Supabase:

1. **Authentication > Providers > Facebook**
   - ✅ **Facebook Enabled** powinno być **WŁĄCZONE**
   - ✅ **Facebook Client ID** - powinien być ustawiony
   - ✅ **Facebook Client Secret** - powinien być ustawiony
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

2. **Facebook Developers Console** (jeśli nie skonfigurowane):
   - Utwórz aplikację na https://developers.facebook.com
   - **Facebook Login > Settings:**
     - **Valid OAuth Redirect URIs:** Dodaj callback URL z Supabase
   - **Use Cases > Authentication and Account Creation:**
     - Upewnij się, że `email` i `public_profile` są **Ready for testing**
   - **Settings > Basic:**
     - Skopiuj **App ID** i **App Secret**

3. **Callback URL dla Facebook:**
   - Powinien być: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
   - Skopiuj z Dashboard: Authentication > Providers > Facebook

---

## ✅ 5. Autoryzacja SMS (Phone Authentication)

### Status w kodzie: ✅ Zaimplementowane
- **Lokalizacja:** 
  - `src/components/auth/PhoneVerification.tsx` - komponent weryfikacji telefonu
  - Używa `signInWithOtp({ phone })` i `verifyOtp({ phone, token, type })`

### Co sprawdzić w Dashboard Supabase:

1. **Authentication > Providers > Phone**
   - ✅ **Phone Enabled** powinno być **WŁĄCZONE**
   - ✅ **Enable phone signup** - powinno być **WŁĄCZONE**
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

2. **SMS Provider Configuration:**
   - Musisz skonfigurować dostawcę SMS:
     - **Twilio** (zalecane)
     - **MessageBird**
     - **Vonage**
     - **TextLocal** (community-supported)
   
   **Dla Twilio:**
   - **Twilio Account SID** - wymagane
   - **Twilio Auth Token** - wymagane
   - **Twilio Phone Number** - wymagane
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers > Phone > SMS Provider

3. **SMS Rate Limits:**
   - Domyślnie: 360 OTP/godzinę
   - Można dostosować w: Authentication > Rate Limits
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/rate-limits

4. **OTP Settings:**
   - **OTP Length:** Domyślnie 6 cyfr (zalecane minimum)
   - **OTP Expiration:** Domyślnie 3600 sekund (1 godzina)
   - Sprawdź: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers > Phone

---

## ⚠️ Znalezione problemy bezpieczeństwa

### 1. Leaked Password Protection Disabled (WARNING)
- **Problem:** Ochrona przed użyciem skompromitowanych haseł jest wyłączona
- **Rozwiązanie:** 
  - Włącz w: Authentication > Settings > Password Security
  - Lub: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth
  - Sprawdza hasła przeciwko HaveIBeenPwned.org

### 2. Security Definer View (ERROR)
- **Problem:** View `active_auctions_summary` używa SECURITY DEFINER
- **Rozwiązanie:** 
  - Przejrzyj view i upewnij się, że jest bezpieczne
  - Rozważ użycie SECURITY INVOKER jeśli to możliwe

---

## 📝 Checklist do weryfikacji w Dashboard

### Email Authentication
- [ ] Email provider ENABLED
- [ ] Enable email confirmations ON
- [ ] Site URL ustawiony
- [ ] Redirect URLs skonfigurowane
- [ ] Email templates sprawdzone
- [ ] SMTP skonfigurowany (dla produkcji)

### Google OAuth
- [ ] Google provider ENABLED
- [ ] Client ID ustawiony
- [ ] Client Secret ustawiony
- [ ] Callback URL dodany w Google Cloud Console
- [ ] Scopes skonfigurowane (email, profile, openid)

### Facebook OAuth
- [ ] Facebook provider ENABLED
- [ ] Client ID ustawiony
- [ ] Client Secret ustawiony
- [ ] Callback URL dodany w Facebook Developers
- [ ] Email permission włączone w Facebook

### SMS/Phone Authentication
- [ ] Phone provider ENABLED
- [ ] Enable phone signup ON
- [ ] SMS Provider skonfigurowany (Twilio/MessageBird/Vonage)
- [ ] Provider credentials ustawione
- [ ] OTP settings sprawdzone

### Security
- [ ] Leaked Password Protection ENABLED
- [ ] Rate limits skonfigurowane
- [ ] RLS policies sprawdzone

---

## 🔗 Linki do Dashboard

- **Auth Providers:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
- **URL Configuration:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration
- **Email Templates:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/templates
- **Auth Settings:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth
- **Rate Limits:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/rate-limits

---

## 📚 Dokumentacja

- [Email Verification](https://supabase.com/docs/guides/auth/passwords#with-email)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Facebook OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Phone/SMS Authentication](https://supabase.com/docs/guides/auth/phone-login)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

---

**Wygenerowano:** $(date)  
**Projekt ID:** nctvwxiqzbedgcmetyal

