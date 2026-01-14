# Twilio Verify Service - Konfiguracja i Testy

## ✅ Status: DZIAŁA

Twilio Verify Service jest skonfigurowane i działa poprawnie!

### Test weryfikacji SMS - SUKCES ✅

```json
{
  "account_sid": "TWILIO_ACCOUNT_SID",
  "status": "approved",
  "valid": true,
  "service_sid": "TWILIO_VERIFY_SERVICE_SID",
  "to": "+48797172227",
  "channel": "sms"
}
```

## 📋 Dane konfiguracyjne

### Twilio Credentials

| Parametr | Wartość |
|----------|---------|
| **Account SID** | `TWILIO_ACCOUNT_SID` (z Twilio Dashboard) |
| **Auth Token** | `TWILIO_AUTH_TOKEN` (z Twilio Dashboard) |
| **Verify Service SID** | `TWILIO_VERIFY_SERVICE_SID` (z Twilio Dashboard) ⭐ |

### Test Phone Number

- **Numer:** `+48123456789` (przykład)
- **Status:** `approved` ✅
- **Valid:** `true` ✅

## 🔧 Konfiguracja w Supabase Dashboard

### Krok 1: Włącz Phone Provider

1. Przejdź do: https://supabase.com/dashboard/project/nctvwxiqzbedgcmetyal/auth/providers
2. Kliknij **Phone** w liście providerów
3. Włącz toggle **Phone Enabled**

### Krok 2: Skonfiguruj Twilio

Wprowadź następujące dane:

- **SMS Provider:** Twilio
- **Twilio Account SID:** `TWILIO_ACCOUNT_SID` (z Twilio Dashboard)
- **Twilio Auth Token:** `TWILIO_AUTH_TOKEN` (z Twilio Dashboard)
- **Twilio Verify Service SID:** `TWILIO_VERIFY_SERVICE_SID` (z Twilio Dashboard) ⭐
- **Twilio Message Service SID:** (zostaw puste)
- **Twilio Content SID:** (zostaw puste)

### Krok 3: Ustawienia OTP

- **Enable phone confirmations:** ✅ Włączone
- **SMS OTP Expiry:** `60` sekund
- **SMS OTP Length:** `6` cyfr
- **SMS Message:** `Your code is {{ .Code }}`

### Krok 4: Zapisz

Kliknij **Save** aby zapisać konfigurację.

## 🧪 Testowanie z Twilio API

### Przykład kodu testowego:

```javascript
const accountSid = 'TWILIO_ACCOUNT_SID'; // Z Twilio Dashboard
const authToken = 'TWILIO_AUTH_TOKEN'; // Z Twilio Dashboard
const client = require('twilio')(accountSid, authToken);

// Weryfikacja kodu OTP
client.verify.v2.services("TWILIO_VERIFY_SERVICE_SID") // Z Twilio Dashboard
  .verificationChecks
  .create({to: '+48797172227', code: '[Code]'})
  .then(verification_check => console.log(verification_check.status));
```

### Oczekiwana odpowiedź:

```json
{
  "account_sid": "TWILIO_ACCOUNT_SID",
  "status": "approved",
  "valid": true,
  "service_sid": "TWILIO_VERIFY_SERVICE_SID",
  "to": "+48797172227",
  "channel": "sms"
}
```

## 📱 Integracja z aplikacją

### Komponent PhoneVerification.tsx

Komponent już używa Supabase Auth API do weryfikacji telefonu:

```typescript
// Wysyłanie OTP
await supabase.auth.signInWithOtp({ phone });

// Weryfikacja OTP
await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
```

Supabase automatycznie używa Twilio Verify Service SID skonfigurowanego w Dashboard.

## 🔍 Rozwiązywanie problemów

### Problem: "Service SID not found"

**Rozwiązanie:**
- Sprawdź czy Twilio Verify Service SID jest poprawny: `TWILIO_VERIFY_SERVICE_SID`
- Upewnij się, że Service SID jest wprowadzony w Supabase Dashboard

### Problem: "Invalid phone number"

**Rozwiązanie:**
- Upewnij się, że numer jest w formacie międzynarodowym: `+48123456789`
- Sprawdź czy numer jest zweryfikowany w Twilio (dla testów)

### Problem: "OTP expired"

**Rozwiązanie:**
- Sprawdź **SMS OTP Expiry** w ustawieniach (domyślnie 60 sekund)
- Upewnij się, że użytkownik wprowadza kod w czasie

## ✅ Checklist

- [x] Twilio Account SID skonfigurowany
- [x] Twilio Auth Token skonfigurowany
- [x] Twilio Verify Service SID skonfigurowany
- [x] Test weryfikacji SMS zakończony sukcesem
- [ ] Phone Provider włączony w Supabase Dashboard
- [ ] Test w aplikacji wykonany
- [ ] Monitoring SMS skonfigurowany

## 📚 Dokumentacja

- [Twilio Verify API](https://www.twilio.com/docs/verify/api)
- [Supabase Phone Auth](https://supabase.com/docs/guides/auth/phone-login)
- [Twilio Dashboard](https://console.twilio.com/)

---

**Ostatnia aktualizacja:** 2026-01-06  
**Status:** ✅ Działa poprawnie

