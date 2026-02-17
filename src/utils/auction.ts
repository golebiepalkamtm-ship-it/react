export const CATEGORY_LABELS: Record<string, string> = {
  PIGEONS: "Gołębie",
  ACCESSORIES: "Akcesoria",
  SUPPLEMENTS: "Suplementy",
  racing: "Gołębie", // legacy support if needed
  breeding: "Gołębie",
  show: "Gołębie",
  supplements: "Suplementy",
  accessories: "Akcesoria",
};

export const formatCategory = (category: string | undefined): string => {
  if (!category) return "Inne";
  const upper = category.toUpperCase();
  return CATEGORY_LABELS[upper] || CATEGORY_LABELS[category] || category;
};

/**
 * Oblicza pozostały czas do końca aukcji
 * @param endTime - Data końca aukcji (string ISO lub Date)
 * @param serverTimeOffset - Offset czasu serwera w ms (opcjonalny)
 * @returns Obiekt z szczegółami czasu lub null jeśli aukcja zakończona
 */
export interface TimeLeftDetails {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
  isUrgent: boolean; // Mniej niż 1 godzina
}

export const calculateTimeLeft = (
  endTime: string | Date,
  serverTimeOffset: number = 0
): TimeLeftDetails | null => {
  const end = typeof endTime === 'string' ? new Date(endTime).getTime() : endTime.getTime();
  const now = Date.now() + serverTimeOffset;
  const diff = end - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true,
      isUrgent: false,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUrgent = days === 0 && hours < 1;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
    isExpired: false,
    isUrgent,
  };
};

/**
 * Formatuje szczegóły czasu do czytelnego stringa
 * @param timeLeft - Obiekt TimeLeftDetails
 * @returns Sformatowany string (np. "2d 5h", "3h 45m", "15m")
 */
export const formatTimeLeft = (timeLeft: TimeLeftDetails | null): string => {
  if (!timeLeft || timeLeft.isExpired) return "Zakończona";

  if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
  if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
  return `${timeLeft.minutes}m`;
};
