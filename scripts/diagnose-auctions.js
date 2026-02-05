const fs = require("fs");
const path = require("path");

/**
 * Prosty skrypt diagnostyczny dla kart aukcji:
 * - sprawdza istnienie kluczowych plików i importów
 * - sprawdza, czy grid ma spójny layout
 * - podaje zalecenia naprawcze
 */

const projectRoot = path.resolve(__dirname, "..");

const filesToCheck = [
  "src/components/auctions/AuctionCard.tsx",
  "src/components/auctions/AuctionTimer.tsx",
  "src/components/auctions/AuctionsSection.tsx",
  "src/components/AuctionsPage.tsx",
  "src/components/ui/badge.tsx",
];

function fileExists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function readFile(file) {
  try {
    return fs.readFileSync(path.join(projectRoot, file), "utf8");
  } catch {
    return "";
  }
}

function checkImports(content, expected) {
  return expected.every((imp) => content.includes(imp));
}

function main() {
  const report = [];

  // 1) Obecność plików
  filesToCheck.forEach((f) => {
    report.push(`[FILES] ${f}: ${fileExists(f) ? "OK" : "MISSING"}`);
  });

  // 2) Importy w AuctionCard
  const card = readFile("src/components/auctions/AuctionCard.tsx");
  report.push(
    `[IMPORTS AuctionCard] ${
      checkImports(card, [
        'import { Badge } from "@/components/ui/badge";',
        'import { AuctionTimer } from "./AuctionTimer";',
      ])
        ? "OK"
        : "MISSING/WRONG"
    }`
  );

  // 3) Layout w AuctionCard (wysokość, flex)
  const layoutOk =
    card.includes("min-h-[660px]") &&
    card.includes("h-full") &&
    card.includes("w-full") &&
    card.includes("flex flex-col");
  report.push(`[LAYOUT AuctionCard] ${layoutOk ? "OK" : "CHECK min-h/h-full/w-full flex"}`);

  // 4) Grid w AuctionsPage
  const page = readFile("src/components/AuctionsPage.tsx");
  const gridOk =
    page.includes("[grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]") &&
    page.includes("max-w-6xl") &&
    page.includes("justify-items-center");
  report.push(`[GRID AuctionsPage] ${gridOk ? "OK" : "CHECK grid template/minmax/center"}`);

  // 5) Badge plik
  const badge = readFile("src/components/ui/badge.tsx");
  report.push(`[BADGE exists] ${badge ? "OK" : "MISSING"}`);

  // 6) Ostrzeżenia
  if (!card) {
    report.push("WARN: AuctionCard.tsx pusty/brak odczytu.");
  }
  if (!page) {
    report.push("WARN: AuctionsPage.tsx pusty/brak odczytu.");
  }

  console.log("=== Diagnostics: Auctions ===");
  report.forEach((line) => console.log(line));
  console.log("Jeśli któryś element = MISSING/CHECK, napraw importy/layout i zrestartuj dev server.");
}

main();
