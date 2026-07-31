export function censorText(text: string): string {
  if (!text) return text;

  // Mask emails (e.g. user@example.com -> u***@e***.com)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  let censored = text.replace(emailRegex, "[UKRYTY EMAIL]");

  // Mask phone numbers (matches various formats like +48 123 456 789, 123456789, 123-456-789)
  // Catching 9+ digits with optional spaces or dashes
  const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\d[\s-]?){8,11}\d/g;
  censored = censored.replace(phoneRegex, "[UKRYTY NUMER]");

  // Mask circumvention keywords
  const keywords = ["revolut", "blik", "allegro", "paypal", "poza allegro", "poza platformą", "przelew"];
  for (const keyword of keywords) {
    const keywordRegex = new RegExp(keyword, "gi");
    censored = censored.replace(keywordRegex, "***");
  }

  return censored;
}
