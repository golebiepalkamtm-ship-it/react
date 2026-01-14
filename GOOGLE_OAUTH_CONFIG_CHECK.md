# ✅ Sprawdzenie konfiguracji Google OAuth

## 📋 Twoja aktualna konfiguracja

### Google Cloud Console

**Client ID:**
```
183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com
```

**Authorized redirect URIs:** ✅ POPRAWNIE
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ `http://127.0.0.1:54321/auth/v1/callback` (dla lokalnego Supabase)

**Authorized JavaScript origins:** ❌ BRAKUJE WAŻNEGO URL!
- ✅ `http://localhost:5173` (OK)
- ✅ `http://127.0.0.1:5173` (OK)
- ❌ **BRAKUJE:** `https://nctvwxiqzbedgcmetyal.supabase.co` ⚠️

**Client Secrets:**
- ✅ `****EwCz` (utworzony 31 grudnia 2025) - Włączony
- ✅ `****riF5` (utworzony 1 stycznia 2026) - Włączony

---

## ⚠️ PROBLEM ZNALEZIONY!

**Brakuje Authorized JavaScript origin dla Supabase!**

To jest główna przyczyna błędu "Unable to exchange external code".

---

## 🔧 NAPRAWA (2 minuty)

### Krok 1: Dodaj JavaScript Origin

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. Kliknij na Client ID: `183183722536-g2chsiob74janho7mtuopk12c7fm239t`
3. W sekcji **"Autoryzowane źródła JavaScriptu"** kliknij **"+ DODAJ URI"**
4. Wprowadź:
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co
   ```
   ⚠️ **WAŻNE:** Bez końcowego slashy! Bez `/auth/v1/callback`!

5. Kliknij **ZAPISZ**

### Krok 2: Sprawdź Client Secret w Supabase

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
2. Kliknij **Google** w liście providerów
3. Sprawdź:
   - **Client ID:** `183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com` ✅
   - **Client Secret:** Powinien być jeden z Twoich tajnych kluczy (`****EwCz` lub `****riF5`)
4. Jeśli Client Secret jest pusty, wprowadź jeden z kluczy

### Krok 3: Poczekaj na propagację

⚠️ Google może potrzebować **5-10 minut** na propagację zmian.

### Krok 4: Przetestuj

1. Wyczyść cache przeglądarki
2. Wyloguj się z Google (jeśli jesteś zalogowany)
3. Spróbuj zalogować się przez Google w aplikacji

---

## ✅ Po naprawie powinieneś mieć:

### Authorized JavaScript origins:
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co` ⭐ **NOWE**
- ✅ `http://localhost:5173`
- ✅ `http://127.0.0.1:5173`

### Authorized redirect URIs:
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ `http://127.0.0.1:54321/auth/v1/callback`

---

## 🎯 Dlaczego to naprawia?

Błąd "Unable to exchange external code" występuje, ponieważ:
1. Google wymaga, aby źródło żądania (JavaScript origin) było autoryzowane
2. Supabase wysyła żądania z `https://nctvwxiqzbedgcmetyal.supabase.co`
3. Bez tego URL w JavaScript origins, Google odrzuca żądanie

Dodanie `https://nctvwxiqzbedgcmetyal.supabase.co` do JavaScript origins pozwala Google zweryfikować źródło żądania.

---

**Status:** ⚠️ Wymaga naprawy - dodaj JavaScript origin

