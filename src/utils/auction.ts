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
