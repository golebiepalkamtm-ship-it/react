// Analiza długości scrolla dla strony

// Szacowane wysokości sekcji
const sectionHeights = {
  hero: window.innerHeight, // 100vh
  about: window.innerHeight * 0.8, // ~80vh
  carousel: window.innerHeight * 1.2, // ~120vh
  cta: window.innerHeight * 0.9, // ~90vh
  press: window.innerHeight * 0.7, // ~70vh
  contact: window.innerHeight * 0.6, // ~60vh
  footer: window.innerHeight * 0.3 // ~30vh
};

const totalHeight = Object.values(sectionHeights).reduce((a, b) => a + b, 0);
const sectionCount = Object.keys(sectionHeights).length;
const averageSectionHeight = totalHeight / sectionCount;

console.log('=== ANALIZA SCROLLA ===');
console.log(`Całkowita wysokość strony: ${totalHeight}px`);
console.log(`Liczba sekcji: ${sectionCount}`);
console.log(`Średnia wysokość sekcji: ${averageSectionHeight}px`);
console.log(`Stosunek wysokości do liczby sekcji: ${(totalHeight / sectionCount).toFixed(0)}px`);

// Dla różnych rozdzielczości
[768, 1024, 1280, 1440, 1920].forEach(width => {
  const height = width <= 768 ? 667 : width <= 1024 ? 768 : 1080;
  const total = height * 5.5; // ~5.5x wysokość viewportu
  console.log(`${width}px: ~${total}px (${(total/sectionCount).toFixed(0)}px/sekcja)`);
});