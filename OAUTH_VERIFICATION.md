# ✅ Weryfikacja konfiguracji Google OAuth

## 📋 Twoja konfiguracja:

### ✅ Supabase Dashboard
- **Client ID:** `<GOOGLE_OAUTH_CLIENT_ID>` ✅
- **Client Secret:** `<GOOGLE_OAUTH_CLIENT_SECRET>` ✅
- **Callback URL:** `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback` ✅

### ✅ Google Cloud Console - Sprawdź czy masz:

**Client ID:**
```
<GOOGLE_OAUTH_CLIENT_ID>
```

**Authorized JavaScript origins:**
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co` ⭐ **NAJWAŻNIEJSZE**
- ✅ `http://localhost:5173`
- ✅ `http://127.0.0.1:5173`

**Authorized redirect URIs:**
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ `http://127.0.0.1:54321/auth/v1/callback` (opcjonalnie)

**Client Secrets:**
- ✅ `<GOOGLE_OAUTH_CLIENT_SECRET>` (ten, który wprowadziłeś w Supabase)
- ✅ Drugi secret (jeśli masz dwa aktywne)

---

## 🔍 KROK PO KROKU - Weryfikacja:

### 1️⃣ Sprawdź Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers

1. Kliknij **Google** w liście providerów
2. Sprawdź:
   - ✅ **Enabled:** WŁĄCZONE
   - ✅ **Client ID (for OAuth):** `<GOOGLE_OAUTH_CLIENT_ID>`
   - ✅ **Client Secret (for OAuth):** `<GOOGLE_OAUTH_CLIENT_SECRET>`
   - ✅ **Authorized Client IDs (Optional):** Może być puste LUB `<GOOGLE_OAUTH_CLIENT_ID>`

3. Kliknij **ZAPISZ** (jeśli coś zmieniłeś)

### 2️⃣ Sprawdź Google Cloud Console

**URL:** https://console.cloud.google.com/apis/credentials

1. Kliknij na Client ID: `183183722536-g2chsiob74janho7mtuopk12c7fm239t`
2. Sprawdź **"Autoryzowane źródła JavaScriptu":**
   - ✅ `https://nctvwxiqzbedgcmetyal.supabase.co` ⭐ **MUSI BYĆ!**
   - ✅ `http://localhost:5173`
   - ✅ `http://127.0.0.1:5173`

3. Sprawdź **"Autoryzowane identyfikatory URI przekierowania":**
   - ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
   - ✅ `http://127.0.0.1:54321/auth/v1/callback` (opcjonalnie)

4. Jeśli czegoś brakuje - **DODAJ TERAZ** i kliknij **ZAPISZ**

### 3️⃣ Sprawdź Site URL w Supabase

**URL:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/settings/general

**Sekcja "Site URL":**
- Powinno być: `https://nctvwxiqzbedgcmetyal.supabase.co`
- LUB URL Twojej aplikacji produkcyjnej

### 4️⃣ Sprawdź Redirect URLs w Supabase

**URL:** https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/url-configuration

**Sekcja "Redirect URLs":**
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ URL Twojej aplikacji (np. `http://localhost:5173/auth` lub URL produkcyjny)

---

## ✅ CHECKLIST - Wszystko gotowe?

- [ ] Client ID w Supabase = Client ID w Google Cloud Console ✅
- [ ] Client Secret `<GOOGLE_OAUTH_CLIENT_SECRET>` wprowadzony w Supabase ✅
- [ ] JavaScript Origin `https://nctvwxiqzbedgcmetyal.supabase.co` dodany w Google Cloud Console
- [ ] Redirect URI `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback` dodany w Google Cloud Console
- [ ] Google provider WŁĄCZONY w Supabase
- [ ] Site URL w Supabase jest poprawny
- [ ] Redirect URLs w Supabase zawierają callback URL

---

## 🧪 TEST:

1. **Poczekaj 5-10 minut** po wprowadzeniu zmian (propagacja)
2. **Wyczyść cache przeglądarki** (Ctrl+Shift+Delete)
3. **Wyloguj się z Google** (jeśli jesteś zalogowany)
4. **Spróbuj zalogować się przez Google** w aplikacji

---

## 🆘 Jeśli nadal nie działa:

### Sprawdź logi:

1. **Konsola przeglądarki (F12):**
   - Otwórz zakładkę "Console"
   - Szukaj błędów OAuth

2. **Supabase Dashboard → Logs → Auth:**
   - Sprawdź czy są błędy związane z OAuth

3. **Google Cloud Console → APIs & Services → Credentials:**
   - Sprawdź czy Client Secret jest aktywny
   - Sprawdź czy nie ma błędów w OAuth consent screen

### Najczęstsze problemy:

1. ❌ **Brak JavaScript Origin** - najczęstsza przyczyna!
2. ❌ **Client Secret nie został zapisany** w Supabase
3. ❌ **Zbyt szybkie testowanie** - poczekaj 5-10 minut
4. ❌ **Cache przeglądarki** - wyczyść cache

---

## 📝 Status:

✅ **Client ID:** Poprawny  
✅ **Client Secret:** Poprawny (`<GOOGLE_OAUTH_CLIENT_SECRET>`)  
✅ **Callback URL:** Poprawny  
⚠️ **JavaScript Origin:** Sprawdź czy dodany w Google Cloud Console

**Następny krok:** Upewnij się, że JavaScript Origin `https://nctvwxiqzbedgcmetyal.supabase.co` jest dodany w Google Cloud Console!

