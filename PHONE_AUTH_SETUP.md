# Konfiguracja Phone Authentication z Twilio

## ✅ Szybka konfiguracja

### Krok 1: Włącz Phone Provider w Supabase Dashboard

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
2. Kliknij na **Phone** w liście providerów
3. Włącz toggle **Phone Enabled**

### Krok 2: Skonfiguruj Twilio

**✅ Status:** Twilio jest już skonfigurowane i działa! Test weryfikacji zakończył się sukcesem.

Wprowadź następujące dane:

| Pole | Wartość |
|------|---------|
| **SMS Provider** | Twilio |
| **Twilio Account SID** | `TWILIO_ACCOUNT_SID` (z Twilio Dashboard) |
| **Twilio Auth Token** | `TWILIO_AUTH_TOKEN` (z Twilio Dashboard) |
| **Twilio Verify Service SID** | `TWILIO_VERIFY_SERVICE_SID` (z Twilio Dashboard) ⭐ |
| **Twilio Message Service SID** | (zostaw puste) |
| **Twilio Content SID** | (zostaw puste - tylko dla WhatsApp) |

### Krok 3: Ustawienia OTP

| Ustawienie | Wartość |
|------------|---------|
| **Enable phone confirmations** | ✅ Włączone |
| **SMS OTP Expiry** | `60` sekund |
| **SMS OTP Length** | `6` cyfr |
| **SMS Message** | `Your code is {{ .Code }}` |

### Krok 4: Test Phone Numbers (opcjonalne)

Dla testowania możesz dodać numery testowe w formacie:
```
+48123456789=123456,+48987654321=654321
```

Format: `<numer telefonu>=<otp>` oddzielone przecinkami

### Krok 5: Zapisz konfigurację

Kliknij **Save** aby zapisać wszystkie ustawienia.

---

## 🔧 Weryfikacja konfiguracji

### Sprawdź czy Phone Provider jest aktywny:

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
2. Upewnij się, że **Phone** ma status **Enabled** (zielony toggle)

### Test w aplikacji:

1. Otwórz aplikację i przejdź do `/auth`
2. Wybierz opcję logowania przez telefon
3. Wprowadź numer telefonu (format: +48123456789)
4. Sprawdź czy otrzymujesz SMS z kodem OTP
5. Wprowadź kod OTP aby zweryfikować

**✅ Test Twilio API:** 
- Numer testowy: `+48797172227`
- Status: `approved` ✅
- Valid: `true` ✅
- Service SID: `VA74806dba46fcdc4493f5dcac2256c5ad`

---

## 📱 Format numerów telefonów

**Ważne:** Wszystkie numery telefonów muszą być w formacie międzynarodowym:

- ✅ Poprawne: `+48123456789`, `+12025551234`
- ❌ Niepoprawne: `123456789`, `+48 123 456 789` (ze spacjami)

---

## 🛠️ Rozwiązywanie problemów

### Problem: Nie otrzymuję SMS

**Rozwiązania:**
1. Sprawdź czy Twilio Account SID i Auth Token są poprawne
2. Sprawdź czy Twilio ma wystarczające środki
3. Sprawdź czy numer telefonu jest w formacie międzynarodowym (+48...)
4. Sprawdź logi w Twilio Dashboard

### Problem: Kod OTP wygasa zbyt szybko

**Rozwiązanie:**
- Zwiększ **SMS OTP Expiry** w ustawieniach (domyślnie 60 sekund)

### Problem: Kod OTP ma niewłaściwą długość

**Rozwiązanie:**
- Sprawdź **SMS OTP Length** w ustawieniach (powinno być 6)

### Problem: Błąd "Phone provider not enabled"

**Rozwiązanie:**
1. Przejdź do Dashboard Supabase
2. Włącz **Phone Enabled** toggle
3. Zapisz konfigurację
4. Odśwież aplikację

---

## 📚 Dokumentacja

- [Supabase Phone Auth Docs](https://supabase.com/docs/guides/auth/phone-login)
- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [Supabase Dashboard](https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers)

---

## 🔒 Bezpieczeństwo

⚠️ **WAŻNE:**
- **NIE** commituj Twilio credentials do repozytorium
- Używaj zmiennych środowiskowych dla produkcji
- Regularnie rotuj Auth Token w Twilio
- Monitoruj użycie SMS w Twilio Dashboard
- Ustaw limity rate limiting dla Phone Auth w Supabase

---

## ✅ Checklist konfiguracji

- [ ] Phone Provider włączony w Supabase Dashboard
- [ ] Twilio Account SID wprowadzony
- [ ] Twilio Auth Token wprowadzony
- [ ] Enable phone confirmations włączone
- [ ] SMS OTP Expiry ustawione na 60 sekund
- [ ] SMS OTP Length ustawione na 6 cyfr
- [ ] SMS Message skonfigurowane
- [ ] Konfiguracja zapisana
- [ ] Test wysłania SMS wykonany
- [ ] Test weryfikacji OTP wykonany

---

## 🎯 Następne kroki

Po skonfigurowaniu Phone Auth:

1. ✅ Przetestuj logowanie przez telefon w aplikacji
2. ✅ Sprawdź czy profile użytkowników są aktualizowane po weryfikacji
3. ✅ Skonfiguruj rate limiting dla Phone Auth (opcjonalne)
4. ✅ Dodaj monitoring dla SMS (opcjonalne)

