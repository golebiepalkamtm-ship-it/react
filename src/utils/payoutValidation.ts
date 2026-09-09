/**
 * Payout validation and formatting utilities (IBAN & BLIK Phone)
 */

export function normalizeIban(value?: string | null): string {
  if (!value) return "";
  let clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  // If user entered only 26 digits, add PL prefix automatically
  if (/^\d{26}$/.test(clean)) {
    clean = `PL${clean}`;
  }
  return clean;
}

export function formatIban(value?: string | null): string {
  if (!value) return "";
  let clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  
  // If starts with 2 digits or only digits, assume PL
  if (/^\d{1,26}$/.test(clean) && !clean.startsWith("PL")) {
    clean = `PL${clean}`;
  }

  // Chunk every 4 characters
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(" ");
}

/**
 * Validates Polish IBAN using ISO 13616 Modulo 97 algorithm.
 */
export function validatePolishIbanChecksum(rawIban?: string | null): {
  isValid: boolean;
  message: string;
} {
  if (!rawIban || !rawIban.trim()) {
    return { isValid: false, message: "Wprowadź numer konta (26 cyfr)." };
  }

  const clean = normalizeIban(rawIban);

  if (!clean.startsWith("PL")) {
    return {
      isValid: false,
      message: "Numer konta musi zaczynać się od PL lub składać się z 26 cyfr.",
    };
  }

  if (clean.length < 28) {
    const missing = 28 - clean.length;
    return {
      isValid: false,
      message: `Brakuje jeszcze ${missing} ${missing === 1 ? "cyfry" : "cyfr"}.`,
    };
  }

  if (clean.length > 28) {
    return {
      isValid: false,
      message: "Numer konta ma za dużo cyfr (maksymalnie 26 cyfr po PL).",
    };
  }

  if (!/^PL\d{26}$/.test(clean)) {
    return {
      isValid: false,
      message: "Numer konta może zawierać wyłącznie cyfry.",
    };
  }

  // Modulo 97 check: move PL (P=25, L=21) + 2 check digits to end
  const rearranged = clean.slice(4) + "2521" + clean.slice(2, 4);
  try {
    const remainder = BigInt(rearranged) % 97n;
    if (remainder === 1n) {
      return { isValid: true, message: "Numer konta jest poprawny." };
    } else {
      return {
        isValid: false,
        message: "Błędna suma kontrolna numeru konta (sprawdź czy nie ma literówki).",
      };
    }
  } catch {
    return { isValid: false, message: "Nieprawidłowy format numeru." };
  }
}

export function formatPhoneNumber(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("48") && digits.length > 2) {
    const rest = digits.slice(2);
    const parts: string[] = ["+48"];
    for (let i = 0; i < rest.length && i < 9; i += 3) {
      parts.push(rest.slice(i, i + 3));
    }
    return parts.join(" ");
  }
  const parts: string[] = [];
  for (let i = 0; i < digits.length && i < 9; i += 3) {
    parts.push(digits.slice(i, i + 3));
  }
  return parts.join(" ");
}
