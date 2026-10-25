import { memo } from "react";

interface KineticTextProps {
  children: string;
  className?: string;
  /** "char" – każda litera osobno (tytuły), "word" – całe słowa (akapity). */
  splitBy?: "char" | "word";
}

/**
 * Tekst pocięty na jednostki w maskach `overflow: hidden`.
 *
 * Każda jednostka (`.kinetic-unit`) siedzi pod krawędzią swojej maski,
 * więc animacja yPercent: 110 → 0 wygląda, jakby tekst wyjeżdżał spod linii.
 * Czytniki ekranu dostają pełny tekst z `sr-only`, a pocięte litery są ukryte.
 */
export const KineticText = memo(
  ({ children, className, splitBy = "char" }: KineticTextProps) => {
    const words = children.split(/\s+/).filter(Boolean);

    return (
      <span className={className}>
        <span className="sr-only">{children}</span>
        <span aria-hidden="true">
          {words.map((word, wi) => (
            <span key={wi}>
              {splitBy === "word" ? (
                <span className="kinetic-mask">
                  <span className="kinetic-unit">{word}</span>
                </span>
              ) : (
                // Słowo trzyma litery razem – łamanie linii tylko między słowami.
                <span className="inline-block whitespace-nowrap">
                  {word.split("").map((char, ci) => (
                    <span key={ci} className="kinetic-mask">
                      <span className="kinetic-unit">{char}</span>
                    </span>
                  ))}
                </span>
              )}
              {wi < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      </span>
    );
  },
);

KineticText.displayName = "KineticText";
