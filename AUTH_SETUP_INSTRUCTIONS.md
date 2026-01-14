# Instrukcje konfiguracji systemu logowania w Supabase Dashboard

## ✅ Co zostało naprawione automatycznie

### Baza danych:
- ✅ **Polityki RLS** - zoptymalizowane (używają `(select auth.uid())`)
- ✅ **Triggery auth** - wszystkie funkcje i triggery są na miejscu
- ✅ **Indeksy** - dodane brakujące indeksy
- ✅ **View SECURITY DEFINER** - naprawione na SECURITY INVOKER

### System logowania:
- ✅ **Funkcje auth** - wszystkie funkcje są poprawne
- ✅ **Triggery** - automatyczne tworzenie profili działa
- ✅ **Weryfikacja email** - triggery aktualizują role automatycznie

---

## 🔧 Co musisz skonfigurować w Dashboard Supabase

Niestety, niektóre ustawienia wymagają konfiguracji przez Dashboard, ponieważ nie są dostępne przez API/MCP.

### 1. Email Authentication

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

1. Przejdź do **Authentication > Providers > Email**
2. ✅ Upewnij się, że **Email Enabled** jest **WŁĄCZONE**
3. ✅ Upewnij się, że **Enable email confirmations** jest **WŁĄCZONE**
4. ✅ Sprawdź **Email OTP Expiration** (domyślnie 3600 sekund = 1 godzina)

### 2. URL Configuration

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration

1. **Site URL** - ustaw URL swojej aplikacji:
   - Development: `http://localhost:5173` lub `http://localhost:8080`
   - Production: `https://twoja-domena.com`

2. **Redirect URLs** - dodaj wszystkie potrzebne URL:
   ```
   http://localhost:5173/**
   http://localhost:8080/**
   https://twoja-domena.com/**
 https://palkamtm.pl/verify-email
   https://twoja-domena.com/auth
   ```

### 3. Google OAuth

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

1. Przejdź do **Authentication > Providers > Google**
2. ✅ Włącz **Google Enabled**
3. Wprowadź:
   - **Client ID (for OAuth)** - z Google Cloud Console
   - **Client Secret (for OAuth)** - z Google Cloud Console
4. **Callback URL** (skopiuj z Dashboard):
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback
   ```
5. W **Google Cloud Console**:
   - Dodaj callback URL do **Authorized redirect URIs**
   - Dodaj `https://nctvwxiqzbedgcmetyal.supabase.co` do **Authorized domains**

### 4. Facebook OAuth

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

1. Przejdź do **Authentication > Providers > Facebook**
2. ✅ Włącz **Facebook Enabled**
3. Wprowadź:
   - **Facebook Client ID** - z Facebook Developers
   - **Facebook Client Secret** - z Facebook Developers
4. **Callback URL** (skopiuj z Dashboard):
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback
   ```
5. W **Facebook Developers Console**:
   - Dodaj callback URL do **Valid OAuth Redirect URIs**
   - Włącz **email** permission w **Use Cases**

### 5. SMS/Phone Authentication (Twilio) ⭐

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

1. Przejdź do **Authentication > Providers > Phone**
2. ✅ **Włącz Phone Enabled** - kliknij toggle aby włączyć Phone provider
3. ✅ **Włącz Enable phone confirmations** - użytkownicy będą musieli potwierdzić numer telefonu przed logowaniem
4. **SMS Provider** - wybierz **Twilio**
5. Wprowadź dane Twilio:

   **Twilio Account SID:**
   ```
   TWILIO_ACCOUNT_SID (z Twilio Dashboard)
   ```

   **Twilio Auth Token:**
   ```
   TWILIO_AUTH_TOKEN (z Twilio Dashboard)
   ```

   **Twilio Message Service SID:** (opcjonalne - zostaw puste jeśli nie masz)
   ```
   (zostaw puste)
   ```

   **Twilio Content SID:** (opcjonalne - tylko dla WhatsApp)
   ```
   (zostaw puste)
   ```

6. **SMS OTP Settings:**
   - **SMS OTP Expiry:** `60` sekund (czas wygaśnięcia kodu OTP)
   - **SMS OTP Length:** `6` cyfr (długość kodu OTP)
   - **SMS Message:** `Your code is {{ .Code }}` (format wiadomości SMS)

7. **Test Phone Numbers** (opcjonalne - dla testowania):
   ```
   Format: <numer telefonu>=<otp>
   Przykład: +48123456789=123456
   ```

8. ✅ **Zapisz** konfigurację

**Uwagi:**
- Upewnij się, że Twilio Account SID i Auth Token są poprawne
- Numery telefonów muszą być w formacie międzynarodowym (np. +48123456789)
- W środowisku produkcyjnym usuń test phone numbers
- Sprawdź czy Twilio ma wystarczające środki na wysyłanie SMS

### 6. Email Templates

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/templates

Sprawdź i dostosuj szablony emaili:

1. **Confirm signup** - powinien zawierać:
   ```html
   <a href="{{ .ConfirmationURL }}">Confirm your email</a>
   ```
   lub dla PKCE:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
   ```

2. **Magic Link** - dla passwordless login

3. **Reset Password** - dla resetowania hasła

### 7. SMTP Configuration (dla produkcji)

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth

1. Przejdź do **Settings > Auth**
2. W sekcji **SMTP Settings**:
   - ✅ Włącz **Enable Custom SMTP**
   - Wprowadź dane SMTP (SendGrid, AWS SES, etc.):
     - **SMTP Host**
     - **SMTP Port** (zwykle 587)
     - **SMTP User**
     - **SMTP Password**
     - **Sender email**
     - **Sender name**

**Dlaczego?** Domyślny SMTP Supabase ma limit 4 emaili/godzinę. Dla produkcji potrzebujesz własnego SMTP.

### 8. Password Security

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth

1. Przejdź do **Settings > Auth**
2. ✅ Włącz **Leaked Password Protection**
   - Sprawdza hasła przeciwko HaveIBeenPwned.org
   - Zwiększa bezpieczeństwo

### 9. Rate Limits

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/rate-limits

Sprawdź i dostosuj limity:

- **Email rate limit** - domyślnie 4/godzinę (z własnym SMTP: 30/godzinę)
- **OTP rate limit** - domyślnie 360/godzinę
- **Magic link rate limit** - domyślnie 60 sekund między requestami

---

## 📝 Checklist konfiguracji

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
- [ ] Scopes skonfigurowane

### Facebook OAuth
- [ ] Facebook provider ENABLED
- [ ] Client ID ustawiony
- [ ] Client Secret ustawiony
- [ ] Callback URL dodany w Facebook Developers
- [ ] Email permission włączone

### SMS/Phone Authentication
- [ ] Phone provider ENABLED
- [ ] Enable phone signup ON
- [ ] SMS Provider skonfigurowany
- [ ] Provider credentials ustawione

### Security
- [ ] Leaked Password Protection ENABLED
- [ ] Rate limits sprawdzone

---

## 🔗 Bezpośrednie linki do Dashboard

- **Auth Providers:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
- **URL Configuration:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration
- **Email Templates:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/templates
- **Auth Settings:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth
- **Rate Limits:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/rate-limits

---

## ✅ Co zostało naprawione w bazie danych

### Migracje zastosowane:

1. **fix_rls_performance_and_indexes** ✅
   - Naprawione wszystkie polityki RLS (13 polityk)
   - Dodane brakujące indeksy
   - Dodane dodatkowe indeksy dla wydajności

2. **ensure_auth_triggers_and_functions** ✅
   - Upewniono się, że wszystkie funkcje auth istnieją
   - Upewniono się, że wszystkie triggery są na miejscu
   - Funkcje zoptymalizowane z ON CONFLICT

3. **fix_security_definer_view** ✅
   - View `active_auctions_summary` zmienione na SECURITY INVOKER

---

## 🧪 Testowanie

Po skonfigurowaniu wszystkiego w Dashboard, przetestuj:

1. **Rejestracja email:**
   - Zarejestruj nowego użytkownika
   - Sprawdź czy email weryfikacyjny przychodzi
   - Kliknij link weryfikacyjny
   - Sprawdź czy rola zmienia się na `USER_EMAIL_VERIFIED`

2. **Google OAuth:**
   - Kliknij "Sign in with Google"
   - Sprawdź czy przekierowanie działa
   - Sprawdź czy użytkownik jest tworzony

3. **Facebook OAuth:**
   - Kliknij "Sign in with Facebook"
   - Sprawdź czy przekierowanie działa
   - Sprawdź czy użytkownik jest tworzony

4. **SMS Authentication:**
   - Wprowadź numer telefonu
   - Sprawdź czy OTP przychodzi
   - Zweryfikuj kod
   - Sprawdź czy rola zmienia się na `USER_FULL_VERIFIED`

---

**Wygenerowano:** $(date)  
**Projekt ID:** nctvwxiqzbedgcmetyal

