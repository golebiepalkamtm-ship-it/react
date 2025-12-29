# Konfiguracja logowania przez Facebook i Google (Supabase OAuth)

## Krok 1: Konfiguracja Google OAuth

1. Wejdź na [Google Cloud Console](https://console.cloud.google.com/)
2. Stwórz nowy projekt lub wybierz istniejący
3. Włącz "Google+ API" i "Google Identity Toolkit API"
4. Przejdź do "Credentials" → "Create Credentials" → "OAuth client ID"
5. Wybierz "Web application"
6. Dodaj authorized redirect URI: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
7. Skopiuj Client ID i Client Secret

## Krok 2: Konfiguracja Facebook OAuth

1. Wejdź na [Facebook Developers](https://developers.facebook.com/)
2. Stwórz nową aplikację lub wybierz istniejącą
3. Dodaj produkt "Facebook Login"
4. W ustawieniach Facebook Login dodaj:
   - Valid OAuth Redirect URIs: `https://nctvwxiqzbedgcmetyal.supabase.co/auth/v1/callback`
5. Skopiuj App ID i App Secret

## Krok 3: Konfiguracja Supabase

1. Wejdź na [Supabase Dashboard](https://app.supabase.com)
2. Przejdź do Authentication → Providers
3. Włącz Google Provider:
   - Włącz "Google"
   - Wklej Client ID i Client Secret z Google
   - Zapisz
4. Włącz Facebook Provider:
   - Włącz "Facebook"
   - Wklej App ID i App Secret z Facebook
   - Zapisz

## Krok 4: Konfiguracja URL przekierowania

W Supabase Dashboard → Authentication → URL Configuration ustaw:
- Site URL: `http://localhost:5173` (dla developmentu)
- Redirect URLs: `http://localhost:5173/verify-email`

## Krok 5: Zmienne środowiskowe

Dodaj do pliku `.env`:
```bash
# Supabase OAuth URLs
VITE_SUPABASE_URL=https://nctvwxiqzbedgcmetyal.supabase.co
VITE_SUPABASE_ANON_KEY=twój_anon_key

# Auth redirect URLs
VITE_SITE_URL=http://localhost:5173
VITE_AUTH_REDIRECT_URL=http://localhost:5173/verify-email
```

## Krok 6: Testowanie

1. Uruchom aplikację: `npm run dev`
2. Przejdź do strony logowania
3. Kliknij przyciski "Google" lub "Facebook"
4. Zaloguj się przez wybraną usługę

## Uwagi

- Upewnij się, że domeny w konfiguracji OAuth zgadzają się z domeną Supabase
- Dla produkcji zmień `localhost:5173` na właściwą domenę
- Facebook wymaga weryfikacji aplikacji przed użyciem w produkcji
