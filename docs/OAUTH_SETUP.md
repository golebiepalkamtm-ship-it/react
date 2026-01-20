# OAuth Google - Instrukcja konfiguracji

## Zmiany w kodzie (już wykonane):

1. ✅ Zmieniono `flowType` z `'implicit'` na `'pkce'` (bezpieczniejszy i nowoczesny)
2. ✅ Usunięto ręczne wywołanie `exchangeCodeForSession` (Supabase robi to automatycznie)
3. ✅ Dodano lepsze logowanie do debugowania

## Co musisz zrobić w Supabase Dashboard:

### 1. Sprawdź konfigurację Google OAuth

Przejdź do: **Supabase Dashboard** → **Authentication** → **Providers** → **Google**

Upewnij się że:
- ✅ Google provider jest włączony (enabled)
- ✅ **Client ID** jest wypełniony
- ✅ **Client Secret** jest wypełniony (to najczęstsza przyczyna błędów!)

### 2. Skonfiguruj Redirect URLs

W sekcji **Site URL** i **Redirect URLs** dodaj:

**Development:**
```
http://localhost:5173/auth
```

**Production:**
```
https://www.palkamtm.pl/auth
https://palkamtm.pl/auth
```

### 3. Sprawdź konfigurację w Google Cloud Console

Przejdź do: **Google Cloud Console** → **APIs & Services** → **Credentials**

W **Authorized JavaScript origins** dodaj:
```
http://localhost:5173
https://www.palkamtm.pl
https://palkamtm.pl
https://nctvwxiqzbedgcmetyal.supabase.co
```

W **Authorized redirect URIs** dodaj:
```
http://localhost:5173/auth
https://www.palkamtm.pl/auth
https://palkamtm.pl/auth
https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback
```

## Flow autoryzacji (jak powinno działać):

1. Użytkownik klika "Kontynuuj z Google" na `/auth`
2. Przekierowanie do Google → `https://accounts.google.com/...`
3. Użytkownik autoryzuje aplikację w Google
4. Google przekierowuje z powrotem → `https://www.palkamtm.pl/auth?code=XXX&state=YYY`
5. Supabase automatycznie wykrywa `code` w URL (dzięki `detectSessionInUrl: true`)
6. Supabase wymienia kod na sesję i zapisuje w localStorage
7. `onAuthStateChange` uruchamia się z nową sesją
8. Użytkownik widzi modal sukcesu i jest przekierowany do strony głównej

## Debugowanie:

Sprawdź w konsoli przeglądarki:
```javascript
// Powinno pokazać logi:
"Initiating Google OAuth" // Przed przekierowaniem
"OAuth code detected, Supabase will handle exchange automatically" // Po powrocie z Google
"Auth state change: SIGNED_IN" // Po udanej autoryzacji
```

## Typowe błędy:

### "server_error" lub "unexpected_failure"
**Przyczyna:** Brak Client Secret w Supabase Dashboard
**Rozwiązanie:** Dodaj Client Secret w Supabase → Authentication → Providers → Google

### "redirect_uri_mismatch"
**Przyczyna:** Redirect URL nie jest autoryzowany w Google Cloud Console
**Rozwiązanie:** Dodaj wszystkie redirect URLs (patrz wyżej)

### "oauth_exchange_failed"
**Przyczyna:** Problem z wymianą kodu na sesję
**Rozwiązanie:** Sprawdź czy flowType = 'pkce' i detectSessionInUrl = true

## Testowanie:

1. Wyczyść localStorage w przeglądarce
2. Odśwież stronę i przejdź na `/auth`
3. Kliknij "Kontynuuj z Google"
4. Autoryzuj w Google
5. Sprawdź czy następuje przekierowanie z powrotem i pojawia się modal sukcesu

## Uwagi:

- W development (localhost) używaj PKCE flow (już skonfigurowane)
- W production używa się również PKCE flow (bezpieczniejszy niż implicit)
- Supabase automatycznie obsługuje całą wymianę OAuth - nie trzeba ręcznie wymieniać kodu
