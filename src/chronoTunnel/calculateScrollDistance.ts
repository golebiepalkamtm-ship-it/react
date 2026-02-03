/**
 * SKRYPT DO OBLICZENIA OPTYMALNEJ DŁUGOŚCI SCROLA
 * Uruchom: npx tsx src/chronoTunnel/calculateScrollDistance.ts
 */

// Parametry animacji z TimeTunnel.tsx
const STAGGER = 2.2;  // Optymalny odstęp między kartami
const DURATION = 5;   // Krótsza animacja karty
const NUM_CARDS = 24; // Liczba kart osiągnięć
const PIXELS_PER_SECOND = 200; // Dobry współczynnik dla płynności

// Fazy animacji dla pojedynczej karty
const PHASE_A_DURATION = DURATION * 0.3; // Appear from fog: 2.4s
const PHASE_B_DURATION = DURATION * 0.4; // Fly to center: 3.2s
const PHASE_C_DURATION = DURATION * 0.3; // Fly past: 2.4s

// Dodatkowe czasy
const TITLE_EXIT_TIME = 2;    // Czas na wyjście tytułu
const END_SCREEN_DELAY = 5;   // Opóźnienie przed końcowym ekranem
const END_SCREEN_DURATION = 4; // Czas animacji końcowego ekranu

console.log('🎯 KALKULATOR DŁUGOŚCI SCROLA - TimeTunnel 3D\n');
console.log('═══════════════════════════════════════════════\n');

// === OBLICZENIA ===

// 1. Czas całkowitej animacji timeline
const lastCardStartTime = (NUM_CARDS - 1) * STAGGER;
const lastCardEndTime = lastCardStartTime + DURATION;
const endScreenStartTime = lastCardStartTime + END_SCREEN_DELAY;
const endScreenEndTime = endScreenStartTime + END_SCREEN_DURATION;

const totalTimelineTime = Math.max(lastCardEndTime, endScreenEndTime);

console.log('📊 ANALIZA CZASOWA:');
console.log(`   • Liczba kart: ${NUM_CARDS}`);
console.log(`   • Stagger (odstęp): ${STAGGER}s`);
console.log(`   • Duration (pojedyncza karta): ${DURATION}s`);
console.log(`   • Faza A (appear): ${PHASE_A_DURATION}s`);
console.log(`   • Faza B (center): ${PHASE_B_DURATION}s`);
console.log(`   • Faza C (exit): ${PHASE_C_DURATION}s\n`);

console.log(`   • Pierwsza karta startuje: 0s`);
console.log(`   • Ostatnia karta (#${NUM_CARDS}) startuje: ${lastCardStartTime}s`);
console.log(`   • Ostatnia karta kończy: ${lastCardEndTime}s`);
console.log(`   • End screen pojawia się: ${endScreenStartTime}s`);
console.log(`   • End screen kończy: ${endScreenEndTime}s\n`);

console.log(`   ⏱️  CAŁKOWITY CZAS TIMELINE: ${totalTimelineTime}s\n`);

// 2. Obliczenie długości scrola
// GSAP ScrollTrigger z scrub: 1 oznacza, że 1px scrolla = 1 jednostka czasu animacji
// Więc potrzebujemy znaleźć współczynnik, który da płynną animację

const PIXELS_PER_SECOND_OPTIONS = [100, 150, 200, 220, 250, 300, 400, 500];

console.log('📏 PROPOZYCJE DŁUGOŚCI SCROLA:\n');
console.log('   Współczynnik | Scroll Distance | Karty widoczne co');
console.log('   -------------|-----------------|------------------');

PIXELS_PER_SECOND_OPTIONS.forEach(pps => {
  const scrollDistance = totalTimelineTime * pps;
  const pixelsPerCard = STAGGER * pps;
  console.log(`   ${pps.toString().padEnd(12)} | ${scrollDistance.toFixed(0).padStart(15)}px | ${pixelsPerCard.toFixed(0)}px scroll`);
});

console.log('\n');

// 3. Rekomendacja
const RECOMMENDED_PPS = PIXELS_PER_SECOND; // Używa wartości z TimeTunnel.tsx
const recommendedScrollDistance = totalTimelineTime * RECOMMENDED_PPS;
const pixelsPerCard = STAGGER * RECOMMENDED_PPS;

console.log('✅ REKOMENDACJA:');
console.log(`   Współczynnik: ${RECOMMENDED_PPS} px/s`);
console.log(`   Scroll Distance: ${recommendedScrollDistance.toFixed(0)}px`);
console.log(`   Scroll między kartami: ${pixelsPerCard.toFixed(0)}px\n`);

// 4. Weryfikacja timing'u dla środkowej karty
const middleCardIndex = Math.floor(NUM_CARDS / 2);
const middleCardStartTime = middleCardIndex * STAGGER;
const middleCardCenterTime = middleCardStartTime + PHASE_A_DURATION + (PHASE_B_DURATION / 2);

console.log('🎯 WERYFIKACJA (karta #12 - środek):');
console.log(`   • Start animacji: ${middleCardStartTime}s`);
console.log(`   • W centrum ekranu: ${middleCardCenterTime}s`);
console.log(`   • Scroll do centrum: ${(middleCardCenterTime * RECOMMENDED_PPS).toFixed(0)}px\n`);

// 5. Buffer (dodatkowa przestrzeń)
const EXTRA_BUFFER = 1000;
const totalScrollWithBuffer = recommendedScrollDistance + EXTRA_BUFFER;

console.log('📦 FINALNA KONFIGURACJA:');
console.log(`   const STAGGER = ${STAGGER};`);
console.log(`   const DURATION = ${DURATION};`);
console.log(`   const PIXELS_PER_SECOND = ${RECOMMENDED_PPS};`);
console.log(`   const totalAnimationTime = ${totalTimelineTime};`);
console.log(`   const totalDistance = ${recommendedScrollDistance.toFixed(0)};`);
console.log(`   const extraBuffer = ${EXTRA_BUFFER};`);
console.log(`   const totalScroll = ${totalScrollWithBuffer.toFixed(0)}px\n`);

// 6. Kod do skopiowania
console.log('📋 KOD DO WKLEJENIA W TimeTunnel.tsx:\n');
console.log('```typescript');
console.log(`const STAGGER = ${STAGGER};`);
console.log(`const DURATION = ${DURATION};`);
console.log(`const PIXELS_PER_SECOND = ${PIXELS_PER_SECOND};`);
console.log('');
console.log('// Obliczenie całkowitego czasu animacji');
console.log('const lastCardStart = (timelineEvents.length - 1) * STAGGER;');
console.log('const lastCardEnd = lastCardStart + DURATION;');
console.log('const endScreenStart = lastCardStart + 5;');
console.log('const endScreenEnd = endScreenStart + 4;');
console.log('const totalAnimationTime = Math.max(lastCardEnd, endScreenEnd);');
console.log('');
console.log('// Długość scrola');
console.log('const totalDistance = totalAnimationTime * PIXELS_PER_SECOND;');
console.log('const extraBuffer = 800;');
console.log('```\n');

// 7. Diagnostyka potencjalnych problemów
console.log('🔍 DIAGNOSTYKA:\n');

if (recommendedScrollDistance < 10000) {
  console.log('   ⚠️  Scroll może być za krótki - karty mogą migać zbyt szybko');
}

if (recommendedScrollDistance > 30000) {
  console.log('   ⚠️  Scroll może być za długi - użytkownik będzie scrollował wieki');
}

if (pixelsPerCard < 400) {
  console.log('   ⚠️  Odstępy między kartami < 400px - mogą się nakładać wizualnie');
}

if (pixelsPerCard > 800) {
  console.log('   ⚠️  Odstępy między kartami > 800px - za dużo pustej przestrzeni');
}

console.log('   ✅ Wszystko wygląda OK dla płynnej animacji tunelu 3D\n');

console.log('═══════════════════════════════════════════════\n');
console.log('💡 TIP: Jeśli karty się nie pokazują:');
console.log('   1. Sprawdź console w przeglądarce (F12)');
console.log('   2. Dodaj markers: true w ScrollTrigger config');
console.log('   3. Sprawdź czy z: -4000 nie jest za daleko (zmień na -2000)');
console.log('   4. Upewnij się, że perspective jest ustawiona (np. 1000px)\n');
