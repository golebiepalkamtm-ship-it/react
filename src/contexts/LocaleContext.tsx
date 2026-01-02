import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Locale = "pl" | "en";

type Dict = Record<string, Record<Locale, string>>;

const dict: Dict = {
  "lang.pl": { pl: "PL", en: "PL" },
  "lang.en": { pl: "EN", en: "EN" },
  "auth.check_email.title": { pl: "Sprawdź swoją skrzynkę email", en: "Check your email inbox" },
  "auth.check_email.p1": {
    pl: "Wysyłaliśmy link potwierdzający na {email}. Sprawdź także folder SPAM oraz Oferty.",
    en: "We sent a confirmation link to {email}. Also check Spam and Promotions folders.",
  },
  "auth.check_email.p2": {
    pl: "Konto zostanie w pełni aktywowane po potwierdzeniu email. Do tego czasu dostęp do funkcji (np. wystawianie aukcji) jest zablokowany.",
    en: "Your account will be fully activated after email confirmation. Until then, access to features (e.g. creating auctions) is restricted.",
  },
  "auth.check_email.cta": { pl: "Przejdź do weryfikacji email", en: "Go to email verification" },
  "auth.already_have": { pl: "Mam już konto — zaloguj mnie", en: "I already have an account — sign me in" },

  "verify_email.title": { pl: "Potwierdź swój email", en: "Verify your email" },
  "verify_email.p": {
    pl: "Wysłaliśmy link weryfikacyjny na {email}. Sprawdź skrzynkę oraz folder SPAM/oferty i kliknij w link, aby aktywować konto.",
    en: "We sent a verification link to {email}. Check your inbox and Spam/Promotions, then click the link to activate your account.",
  },
  "verify_email.sent": { pl: "Email weryfikacyjny wysłany ponownie.", en: "Verification email sent again." },
  "verify_email.check_email": {
    pl: "Sprawdź skrzynkę oraz folder SPAM/oferty, a potem kliknij w link.",
    en: "Check your inbox and Spam/Promotions, then click the link.",
  },
  "verify_email.error": { pl: "Nie udało się wysłać emaila ponownie.", en: "Failed to resend the email." },
  "verify_email.try_again": {
    pl: "Spróbuj za chwilę. Jeśli problem wraca, sprawdź konfigurację Supabase.",
    en: "Try again in a moment. If the issue persists, check your Supabase configuration.",
  },
  "verify_email.resend": { pl: "Wyślij ponownie email weryfikacyjny", en: "Resend verification email" },
  "verify_email.sending": { pl: "Wysyłanie...", en: "Sending..." },

  "account.title": { pl: "Panel użytkownika", en: "User dashboard" },
  "account.status.title": { pl: "Status konta", en: "Account status" },
  "account.status.email": { pl: "Email", en: "Email" },
  "account.status.role": { pl: "Poziom weryfikacji", en: "Verification level" },
  "account.status.next": { pl: "Następny krok", en: "Next step" },
  "account.next.verify_email": { pl: "Potwierdź email", en: "Verify email" },
  "account.next.profile_sms": { pl: "Uzupełnij profil i zweryfikuj SMS", en: "Complete profile and verify SMS" },
  "account.next.done": { pl: "Gotowe", en: "Done" },
  "account.profile.title": { pl: "Dane profilu", en: "Profile details" },
  "account.phone.title": { pl: "Weryfikacja SMS", en: "SMS verification" },
  "account.profile.save": { pl: "Zapisz dane", en: "Save details" },
  "account.sms.start": { pl: "Autoryzacja SMS", en: "SMS authorization" },
  "account.sms.required": { pl: "Uzupełnij dane profilu, aby włączyć autoryzację SMS.", en: "Complete your profile details to enable SMS authorization." },
  "account.auctions.title": { pl: "Aukcje", en: "Auctions" },
  "account.auctions.placeholder": {
    pl: "Ta sekcja będzie podpięta do danych (uczestniczone/obserwowane/zakończone). Na razie to placeholder UI.",
    en: "This section will be connected to data (participating/watched/finished). For now it's a placeholder UI.",
  },
  "account.settings.title": { pl: "Ustawienia konta", en: "Account settings" },
  "account.settings.signout": { pl: "Wyloguj", en: "Sign out" },

  "profile.title": { pl: "Uzupełnij profil", en: "Complete your profile" },
  "profile.full_name": { pl: "Imię i nazwisko", en: "Full name" },
  "profile.street": { pl: "Ulica i numer", en: "Street and number" },
  "profile.postal_code": { pl: "Kod pocztowy", en: "Postal code" },
  "profile.country": { pl: "Kraj", en: "Country" },
  "profile.phone": { pl: "Numer telefonu", en: "Phone number" },
  "profile.save_profile": { pl: "Zapisz dane i przejdź do SMS", en: "Save details and continue to SMS" },
  "profile.save": { pl: "Przejdź do weryfikacji SMS", en: "Continue to SMS verification" },
  "profile.saving": { pl: "Zapisywanie...", en: "Saving..." },
  "profile.name_error": { pl: "Imię i nazwisko musi mieć co najmniej 2 znaki", en: "Name must be at least 2 characters" },
  "profile.street_error": { pl: "Ulica i numer są wymagane", en: "Street is required" },
  "profile.postal_error": { pl: "Kod pocztowy jest wymagany", en: "Postal code is required" },
  "profile.country_error": { pl: "Kraj jest wymagany", en: "Country is required" },
  "profile.phone_error": { pl: "Numer telefonu jest wymagany (format międzynarodowy, np. +48...)" , en: "Phone is required (international format, e.g. +48...)" },

  "phone.title": { pl: "Weryfikacja telefonu", en: "Verify your phone" },
  "phone.code_title": { pl: "Wpisz kod SMS", en: "Enter SMS code" },
  "phone.placeholder": { pl: "Numer telefonu (np. +48123123123)", en: "Phone number (e.g. +1234567890)" },
  "phone.send": { pl: "Wyślij kod SMS", en: "Send SMS code" },
  "phone.sending": { pl: "Wysyłanie...", en: "Sending..." },
  "phone.code_placeholder": { pl: "Wpisz 6-cyfrowy kod", en: "Enter 6-digit code" },
  "phone.verify": { pl: "Zweryfikuj kod", en: "Verify code" },
  "phone.verifying": { pl: "Weryfikowanie...", en: "Verifying..." },
  "phone.resend": { pl: "Wyślij kod ponownie", en: "Resend code" },
  "phone.verified": { pl: "SMS potwierdzony — masz pełny dostęp.", en: "SMS verified — you now have full access." },
};

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem("locale");
      if (stored === "pl" || stored === "en") return stored;
      return "pl";
    } catch {
      return "pl";
    }
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem("locale", next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLocale = useCallback(() => setLocale(locale === "pl" ? "en" : "pl"), [locale, setLocale]);

  const value = useMemo<LocaleContextType>(() => {
    return {
      locale,
      setLocale,
      toggleLocale,
      t: (key, vars) => {
        const entry = dict[key];
        if (!entry) return key;
        return interpolate(entry[locale], vars);
      },
    };
  }, [locale, setLocale, toggleLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
