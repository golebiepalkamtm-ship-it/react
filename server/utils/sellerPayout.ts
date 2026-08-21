const HIDDEN_CONTACT = "*[Dane ukryte do momentu opłacenia aukcji]*";

const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;
const PL_PHONE_REGEX = /^(?:\+?48)?(?:\s|-)?(?:\d(?:\s|-)?){9}$/;

export type PayoutMethod = "IBAN" | "BLIK";

export function normalizeIban(value?: string | null): string {
  return (value ?? "").replace(/\s+/g, "").toUpperCase();
}

export function normalizePhone(value?: string | null): string {
  return (value ?? "").replace(/[\s-]/g, "");
}

export function isValidIban(value?: string | null): boolean {
  const iban = normalizeIban(value);
  if (!IBAN_REGEX.test(iban)) return false;
  if (iban.startsWith("PL") && iban.length !== 28) return false;
  return true;
}

export function isValidBlikPhone(value?: string | null): boolean {
  const phone = normalizePhone(value);
  if (PL_PHONE_REGEX.test(value ?? "")) return true;
  return /^(?:\+?48)?\d{9}$/.test(phone);
}

export function hasCompletePayout(user: {
  role?: string | null;
  payoutMethod?: string | null;
  payoutIban?: string | null;
  payoutPhone?: string | null;
  phone?: string | null;
} | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  const method = (user.payoutMethod ?? "").toUpperCase();
  if (method === "IBAN") return isValidIban(user.payoutIban);
  if (method === "BLIK") {
    return isValidBlikPhone(user.payoutPhone) || isValidBlikPhone(user.phone);
  }
  return false;
}

export function validatePayoutInput(input: {
  payoutMethod?: string | null;
  payoutIban?: string | null;
  payoutPhone?: string | null;
}): { ok: true; data: { payoutMethod: PayoutMethod; payoutIban: string | null; payoutPhone: string | null } } | { ok: false; error: string } {
  const method = (input.payoutMethod ?? "").toUpperCase();
  if (method !== "IBAN" && method !== "BLIK") {
    return { ok: false, error: "Wybierz sposób wypłaty: przelew na konto albo BLIK." };
  }
  if (method === "IBAN") {
    const iban = normalizeIban(input.payoutIban);
    if (!isValidIban(iban)) {
      return { ok: false, error: "Podaj poprawny numer IBAN (dla Polski: PL i 26 cyfr)." };
    }
    return { ok: true, data: { payoutMethod: "IBAN", payoutIban: iban, payoutPhone: null } };
  }
  const phone = normalizePhone(input.payoutPhone);
  if (!isValidBlikPhone(input.payoutPhone)) {
    return { ok: false, error: "Podaj poprawny numer telefonu do BLIK (9 cyfr, opcjonalnie +48)." };
  }
  return { ok: true, data: { payoutMethod: "BLIK", payoutIban: null, payoutPhone: phone } };
}

export const PAYOUT_REQUIRED_ERROR =
  "Najpierw uzupełnij dane do wypłaty (IBAN albo BLIK) w ustawieniach konta.";

export { HIDDEN_CONTACT };
