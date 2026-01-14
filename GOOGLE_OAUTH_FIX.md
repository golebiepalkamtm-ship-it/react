# 🔧 Szybka naprawa Google OAuth - "Unable to exchange external code"

## ⚠️ Problem

Błąd "Unable to exchange external code" występuje, ponieważ w Google Cloud Console brakuje **Authorized JavaScript origins**.

## ✅ Rozwiązanie (2 minuty)

### Krok 1: Dodaj Authorized JavaScript origins

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. Kliknij na swój OAuth Client ID: `183183722536-g2chsiob74janho7mtuopk12c7fm239t`
3. W sekcji **Authorized JavaScript origins** kliknij **+ DODAJ URI**
4. Dodaj następujący URL:
   ```
   https://nctvwxiqzbedgcmetyal.supabase.co
   ```
   ⚠️ **WAŻNE:** Bez końcowego slashy! Bez `/auth/v1/callback`!

5. Kliknij **ZAPISZ**

### Krok 2: Sprawdź Authorized redirect URIs

Upewnij się, że masz dokładnie:
```
https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback
```

✅ **Już masz to ustawione - OK!**

### Krok 3: Sprawdź Client Secret w Supabase

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
2. Kliknij **Google** w liście providerów
3. Sprawdź czy **Client Secret** jest wprowadzony
4. Jeśli nie, wprowadź jeden z Twoich tajnych kluczy:
   - `****EwCz` (utworzony 31 grudnia 2025)
   - `****riF5` (utworzony 1 stycznia 2026)

### Krok 4: Poczekaj na propagację

⚠️ **UWAGA:** Google może potrzebować **5 minut do kilku godzin** na propagację zmian.

### Krok 5: Wyczyść cache i przetestuj

1. Wyloguj się z Google (jeśli jesteś zalogowany)
2. Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
3. Spróbuj zalogować się ponownie przez Google

---

## 📋 Podsumowanie zmian

### W Google Cloud Console:

**Authorized JavaScript origins** (DODAJ):
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co` ⭐ **NOWE - DODAJ TO!**
- ✅ `http://localhost:5173` (już masz)
- ✅ `http://127.0.0.1:5173` (już masz)

**Authorized redirect URIs** (już masz poprawnie):
- ✅ `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
- ✅ `http://127.0.0.1:54321/auth/v1/callback` (dla lokalnego Supabase)

### W Supabase Dashboard:

**Google OAuth Provider:**
- ✅ Client ID: `183183722536-g2chsiob74janho7mtuopk12c7fm239t.apps.googleusercontent.com`
- ✅ Client Secret: (jeden z Twoich tajnych kluczy)
- ✅ Google Enabled: **WŁĄCZONE**

---

## 🎯 Dlaczego to naprawia problem?

Błąd "Unable to exchange external code" występuje, gdy:
1. Google nie może zweryfikować źródła żądania (brakuje JavaScript origins)
2. Supabase nie może wymienić kodu na token (brakuje Client Secret)

Dodanie `https://nctvwxiqzbedgcmetyal.supabase.co` do JavaScript origins pozwala Google zweryfikować, że żądanie pochodzi z autoryzowanego źródła.

---

## ✅ Po naprawie

1. ✅ Dodaj JavaScript origin w Google Cloud Console
2. ✅ Sprawdź Client Secret w Supabase
3. ⏳ Poczekaj 5-10 minut na propagację
4. 🧪 Przetestuj logowanie przez Google
5. ✅ Powinno działać!

---

**Ostatnia aktualizacja:** 2026-01-06

