# 🔍 OAuth Diagnostic Checklist - "Unable to exchange external code"

## ❌ Błąd:
```
OAuth error: {
  error: 'server_error', 
  description: 'Unable to exchange external code: 4/0ATX87lOTq3zTA...'
}
```

Ten błąd oznacza, że **Supabase nie może wymienić kodu autoryzacyjnego na token** z Google.

---

## ✅ KROK PO KROKU - Sprawdź wszystko:

### 1️⃣ Google Cloud Console - JavaScript Origins

**URL:** https://console.cloud.google.com/apis/credentials

**Client ID:** `183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com`

**Sprawdź sekcję "Autoryzowane źródła JavaScriptu":**

Musisz mieć **WSZYSTKIE** te URL:
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co` ⭐ **NAJWAŻNIEJSZE**
- ✅ `http://localhost:5173`
- ✅ `http://127.0.0.1:5173`

**Jeśli brakuje `https://nctvwxiqzbedgcmetyal.supabase.co` - DODAJ TERAZ!**

---

### 2️⃣ Google Cloud Console - Redirect URIs

**Sprawdź sekcję "Autoryzowane identyfikatory URI przekierowania":**

Musisz mieć:
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ `http://127.0.0.1:54321/auth/v1/callback` (opcjonalnie, dla lokalnego)

---

### 3️⃣ Supabase Dashboard - Google Provider

**URL:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

**Kliknij "Google" w liście providerów**

**Sprawdź:**

1. **Enabled:** ✅ MUSI BYĆ WŁĄCZONE
2. **Client ID (for OAuth):** 
   ```
   183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com
   ```
   ✅ MUSI BYĆ DOKŁADNIE TAKI SAM jak w Google Cloud Console

3. **Client Secret (for OAuth):** 
   ⚠️ **TO JEST NAJWAŻNIEJSZE!**
   
   Musisz wprowadzić **JEDEN** z Twoich Client Secrets:
   - `****EwCz` (utworzony 31 grudnia 2025)
   - LUB `****riF5` (utworzony 1 stycznia 2026)
   
   **WAŻNE:**
   - Wprowadź **PEŁNY** secret (nie tylko `****EwCz`)
   - Możesz zobaczyć pełny secret w Google Cloud Console:
     1. Kliknij na Client ID
     2. W sekcji "Tajne klucze klienta"
     3. Kliknij ikonę oka obok secret, aby go zobaczyć
   - Skopiuj **CAŁY** secret i wklej do Supabase

4. **Authorized Client IDs (Optional):**
   - Możesz zostawić puste LUB dodać:
   ```
   183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com
   ```

---

### 4️⃣ Sprawdź Site URL w Supabase

**URL:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/general

**Sekcja "Site URL":**

Powinno być:
```
https://nctvwxiqzbedgcmetyal.supabase.co
```

LUB URL Twojej aplikacji produkcyjnej (jeśli masz).

---

### 5️⃣ Sprawdź Redirect URLs w Supabase

**URL:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration

**Sekcja "Redirect URLs":**

Musisz mieć:
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ URL Twojej aplikacji (np. `http://localhost:5173/auth` lub URL produkcyjny)

---

## 🔧 NAJWAŻNIEJSZE KROKI NAPRAWCZE:

### Krok 1: Pobierz Client Secret z Google Cloud Console

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. Kliknij na Client ID: `183183722536-g2chsiob74janho7mtuopk12c7fm239t`
3. W sekcji "Tajne klucze klienta" znajdź jeden z aktywnych kluczy
4. Kliknij ikonę **oka** (👁️) obok secret, aby go zobaczyć
5. **Skopiuj CAŁY secret** (nie tylko `****EwCz`)

### Krok 2: Wprowadź Client Secret w Supabase

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
2. Kliknij **Google**
3. W polu **"Client Secret (for OAuth)"** wklej **CAŁY** secret skopiowany z Google Cloud Console
4. Kliknij **ZAPISZ**

### Krok 3: Dodaj JavaScript Origin (jeśli jeszcze nie)

1. W Google Cloud Console, w sekcji "Autoryzowane źródła JavaScriptu"
2. Dodaj: `https://nctvwxiqzbedgcmetyal.supabase.co`
3. Kliknij **ZAPISZ**

### Krok 4: Poczekaj na propagację

⚠️ **5-10 minut** - Google i Supabase potrzebują czasu na propagację zmian.

### Krok 5: Wyczyść cache i przetestuj

1. Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
2. Wyloguj się z Google (jeśli jesteś zalogowany)
3. Spróbuj zalogować się ponownie

---

## 🎯 NAJCZĘSTSZE PRZYCZYNY BŁĘDU:

1. ❌ **Brak Client Secret w Supabase** (90% przypadków)
2. ❌ **Nieprawidłowy Client Secret** (wprowadzony tylko częściowy)
3. ❌ **Brak JavaScript Origin** `https://nctvwxiqzbedgcmetyal.supabase.co`
4. ❌ **Nieprawidłowy Client ID** (różni się między Google a Supabase)
5. ❌ **Zbyt szybkie testowanie** (zmiany nie zdążyły się rozpropagować)

---

## 📝 CHECKLIST - Odznacz po sprawdzeniu:

- [ ] JavaScript Origin `https://nctvwxiqzbedgcmetyal.supabase.co` dodany w Google Cloud Console
- [ ] Redirect URI `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback` dodany w Google Cloud Console
- [ ] Client ID w Supabase = `183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com`
- [ ] **Client Secret w Supabase jest wprowadzony (PEŁNY secret, nie tylko `****EwCz`)**
- [ ] Google provider jest WŁĄCZONY w Supabase
- [ ] Site URL w Supabase jest poprawny
- [ ] Redirect URLs w Supabase zawierają callback URL
- [ ] Poczekałem 5-10 minut po wprowadzeniu zmian
- [ ] Wyczyściłem cache przeglądarki
- [ ] Wylogowałem się z Google przed testem

---

## 🆘 Jeśli nadal nie działa:

1. Sprawdź logi w konsoli przeglądarki (F12)
2. Sprawdź logi w Supabase Dashboard → Logs → Auth
3. Sprawdź czy nie masz błędów w Google Cloud Console → APIs & Services → Credentials → OAuth consent screen

---

**Status:** ⚠️ Wymaga sprawdzenia Client Secret w Supabase

