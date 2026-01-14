# Rozwiązywanie problemów z OAuth (Google/Facebook)

## ⚠️ Błąd: "Unable to exchange external code"

Ten błąd oznacza, że Supabase nie może wymienić kodu autoryzacyjnego z Google/Facebook na token sesji.

**Najczęstsze przyczyny:**
1. ❌ Nieprawidłowy redirect URL w Google Cloud Console
2. ❌ Nieprawidłowy Client ID lub Client Secret w Supabase
3. ❌ Brakujące uprawnienia w OAuth Consent Screen
4. ❌ Nieprawidłowa konfiguracja PKCE flow

### Przyczyny:

1. **Nieprawidłowa konfiguracja Google OAuth w Supabase Dashboard**
2. **Nieprawidłowy redirect URL w Google Cloud Console**
3. **Brakujące lub nieprawidłowe Client ID/Secret**

---

## 🔧 Rozwiązanie krok po kroku

### Krok 1: Sprawdź konfigurację Google OAuth w Supabase

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

1. Przejdź do **Authentication > Providers > Google**
2. ✅ Upewnij się, że **Google Enabled** jest **WŁĄCZONE**
3. Sprawdź czy **Client ID** i **Client Secret** są wprowadzone
4. **Callback URL** (skopiuj z Dashboard):
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback
   ```

### Krok 2: Sprawdź konfigurację w Google Cloud Console

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. Wybierz swój projekt OAuth
3. Otwórz **OAuth 2.0 Client ID** (Client ID: `183183722536-g2chsiob74janho7mtuopk12c7fm239t`)
4. **KRYTYCZNE:** Sprawdź **Authorized redirect URIs**:
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback
   ```
   ✅ **Upewnij się, że ten URL jest DOKŁADNIE taki sam jak w Supabase**
   ⚠️ **UWAGA:** Nie dodawaj żadnych dodatkowych slashy, parametrów lub końcówek!
   ⚠️ **UWAGA:** URL musi być dokładnie: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`

5. **KRYTYCZNE:** Sprawdź **Authorized JavaScript origins**:
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co
   ```
   ✅ **Ten URL MUSI być dodany!** (obecnie masz tylko localhost)
   ⚠️ **Bez końcowego slashy!**
   ⚠️ **Bez `/auth/v1/callback` na końcu!**
   
   **Dodaj:**
   - `https://nctvwxiqzbedgcmetyal.supabase.co` ⭐ **TO JEST WAŻNE!**
   - `http://localhost:5173` (dla developmentu - już masz)
   - `http://127.0.0.1:5173` (dla developmentu - już masz)

6. **Application type:** Powinno być **Web application** ✅

### Krok 3: Sprawdź czy PKCE jest włączony

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/auth

1. Przejdź do **Settings > Auth**
2. Sprawdź sekcję **Auth Flow**
3. ✅ **Upewnij się, że "Enable PKCE" jest WŁĄCZONE**
4. PKCE jest wymagany dla bezpiecznego OAuth flow

### Krok 4: Sprawdź Site URL w Supabase

**Link:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration

1. **Site URL** powinien być ustawiony na URL Twojej aplikacji:
   - Development: `http://localhost:5173` lub `http://localhost:8080`
   - Production: `https://twoja-domena.com`

2. **Redirect URLs** powinny zawierać:
   ```
   http://localhost:5173/**
   http://localhost:8080/**
   https://twoja-domena.com/**
   https://twoja-domena.com/auth
   ```

### Krok 5: Sprawdź OAuth Consent Screen

1. Przejdź do: https://console.cloud.google.com/apis/credentials/consent
2. Upewnij się, że **OAuth consent screen** jest skonfigurowany
3. Sprawdź czy aplikacja jest w trybie **Testing** lub **Production**
4. Jeśli w trybie **Testing**, dodaj testowe adresy email użytkowników

### Krok 6: Sprawdź Scopes

W Google Cloud Console, upewnij się, że masz włączone:
- ✅ **email**
- ✅ **profile**
- ✅ **openid**

---

## 🔍 Diagnostyka

### Sprawdź logi w Supabase Dashboard

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/logs/edge-logs
2. Szukaj błędów związanych z OAuth
3. Sprawdź czy są błędy typu "invalid_client" lub "redirect_uri_mismatch"

### Sprawdź logi w Google Cloud Console

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. Kliknij na swój OAuth Client ID
3. Sprawdź **Usage** - czy są jakieś błędy

### Test w przeglądarce

1. Otwórz konsolę przeglądarki (F12)
2. Spróbuj zalogować się przez Google
3. Sprawdź czy są błędy w konsoli
4. Sprawdź Network tab - czy request do `/auth/v1/callback` zwraca błąd

---

## ✅ Checklist naprawy

- [ ] Google OAuth włączony w Supabase Dashboard
- [ ] Client ID i Client Secret wprowadzone w Supabase (sprawdź czy są poprawne)
- [ ] **Redirect URL dodany w Google Cloud Console** (dokładnie: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`)
- [ ] **Authorized JavaScript origins ustawione** (`https://nctvwxiqzbedgcmetyal.supabase.co`)
- [ ] **PKCE włączony w Supabase Settings > Auth**
- [ ] Site URL ustawiony w Supabase (URL Twojej aplikacji)
- [ ] Redirect URLs dodane w Supabase (wszystkie potrzebne URL)
- [ ] OAuth Consent Screen skonfigurowany
- [ ] Scopes (email, profile, openid) włączone
- [ ] Aplikacja w trybie Production lub testowe emaile dodane
- [ ] **Application type w Google Cloud Console: Web application** (nie Desktop app!)

---

## 🚨 Częste błędy

### "redirect_uri_mismatch"

**Rozwiązanie:**
- Upewnij się, że redirect URL w Google Cloud Console jest **dokładnie** taki sam jak w Supabase
- Sprawdź czy nie ma dodatkowych slashy lub parametrów
- **WAŻNE:** URL musi być: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback` (bez końcowego slashy!)
- Sprawdź czy w Google Cloud Console nie ma duplikatów tego URL z różnymi końcówkami
- Usuń wszystkie inne wersje tego URL (z http://, z końcowym slashy, etc.)

### "invalid_client"

**Rozwiązanie:**
- Sprawdź czy Client ID i Client Secret są poprawne
- Upewnij się, że kopiujesz wartości bez dodatkowych spacji

### "access_denied"

**Rozwiązanie:**
- Sprawdź OAuth Consent Screen - czy aplikacja jest w trybie Production
- Jeśli w trybie Testing, dodaj swój email do testowych użytkowników

### "Unable to exchange external code" / "unexpected_failure"

**Rozwiązanie:**
1. **Sprawdź Client ID i Secret w Supabase:**
   - Przejdź do Supabase Dashboard > Auth > Providers > Google
   - Skopiuj Client ID i Secret
   - Porównaj z wartościami w Google Cloud Console
   - Upewnij się, że są identyczne (bez spacji, bez dodatkowych znaków)

2. **Sprawdź redirect URL:**
   - W Google Cloud Console: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
   - W Supabase: sprawdź czy callback URL jest poprawny
   - **USUŃ wszystkie inne wersje tego URL z Google Cloud Console**

3. **Sprawdź PKCE:**
   - W Supabase: Settings > Auth > Enable PKCE (powinno być WŁĄCZONE)
   - Jeśli PKCE jest wyłączone, włącz je i spróbuj ponownie

4. **Sprawdź Application Type:**
   - W Google Cloud Console, upewnij się że Application type to **Web application**
   - Nie używaj "Desktop app" lub "Mobile app"

5. **Wyczyść cache i spróbuj ponownie:**
   - Wyloguj się z Google
   - Wyczyść cache przeglądarki
   - Spróbuj zalogować się ponownie

---

## 📚 Dokumentacja

- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Dashboard](https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers)

---

## 🔄 Po naprawie

1. Wyczyść cache przeglądarki
2. Wyloguj się z Google (jeśli jesteś zalogowany)
3. Spróbuj zalogować się ponownie przez Google
4. Sprawdź czy błąd zniknął

---

**Ostatnia aktualizacja:** 2026-01-06

