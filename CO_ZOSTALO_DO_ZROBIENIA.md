# Co jeszcze zostało do zrobienia

## ✅ Zrobione

1. ✅ **Smooth Scroll** - zunifikowano do SmoothScrollProvider
2. ✅ **Funkcje obliczania czasu** - jedna funkcja w utils/auction.ts
3. ✅ **Scroll Reveal** - jedna implementacja w motion/RevealOnScroll.tsx
4. ✅ **Parallax komponenty** - usunięto ParallaxSection, zostało AdvancedParallax
5. ✅ **API Config** - usunięto niepotrzebny re-export
6. ✅ **Nieużywane dependencies** - usunięto gsap-trial, locomotive-scroll

---

## ✅ Zrobione (dodatkowo)

7. ✅ **Parallax Hooks** - usunięto `useAdvancedParallax.ts` (nieużywany)
8. ✅ **useSmoothScroll** - zmieniono nazwę na `useGSAPAnimations.ts` (lepsza czytelność)
9. ✅ **CSS Files** - usunięto `footer-fix.css` (duplikat `emergency-fix.css`)

---

## 🔴 Co jeszcze zostało

### 1. **Komponenty Modal** (4 implementacje) ⚠️

**Status:** Wymaga ostrożnego podejścia - długoterminowe

**Znalezione pliki:**
- `src/components/ui/dialog.tsx` - Radix UI (accessibility)
- `src/components/ui/UnifiedModal.tsx` - **Używany w 24 miejscach!**
- `src/components/overlays/Modal.tsx` - State machine
- `src/components/GlassModal.tsx` - Specjalistyczny styl

**Problem:**
- UnifiedModal jest intensywnie używany - nie można go po prostu usunąć
- Wymaga stopniowej migracji

**Rekomendacja (długoterminowa):**
1. **Zachować** wszystkie na razie
2. **Dokumentować** różnice między nimi
3. **Stopniowo migrować** z UnifiedModal do overlays/Modal
4. **Rozważyć** wrapper który używa overlays/Modal z custom styling dla GlassModal

**Oszczędność:** ~150 linii (po migracji, ale to długoterminowe)

---

### 2. **CSS Files - Częściowo zunifikowane** ✅

**Status:** Usunięto duplikat

**Znalezione pliki:**
- ✅ `src/styles/footer-fix.css` - **USUNIĘTY** (duplikat `emergency-fix.css`)
- `src/styles/emergency-fix.css` - zawiera wszystko z footer-fix + więcej
- `src/styles/performance-tunings.css` - optymalizacje wydajności
- `src/styles/ethereal-overrides.css` - style premium
- `src/styles/advanced-animations.css` - zaawansowane animacje
- `src/styles/champion-premium.css` - design system championów
- `src/styles/smooth-scroll.css` - style dla Lenis
- `src/styles/dynamic-lights.css` - efekty świetlne

**Wszystkie pozostałe pliki są używane i mają unikalne funkcje:**
- Każdy plik ma swój cel (performance, premium styles, animations)
- Nie ma więcej duplikacji do usunięcia

---

### 3. **useLivingSite parallax** - Różne API, nie duplikacja ✅

**Status:** To nie jest duplikacja - różne API

**Plik:**
- `src/hooks/useLivingSite.ts` - zawiera funkcję `parallax()` (linia 135-167)
- `src/hooks/useParallax.ts` - kompleksowy hook z wieloma funkcjami

**Różnice:**
- `useLivingSite.parallax()` - prosta funkcja zwracająca cleanup, używana w LivingSite/HeroSection
- `useParallax()` - kompleksowy hook inicjalizujący wiele typów parallax (mouse, particles, tunnel rings)

**Rekomendacja:**
- **Zachować oba** - służą różnym celom
- `useLivingSite` to toolkit dla komponentów LivingSite
- `useParallax` to globalny hook dla całej strony (TimeTunnel)

---

## 📊 Podsumowanie

| Kategoria | Status | Oszczędność |
|-----------|--------|-------------|
| Parallax Hooks | ✅ Zrobione | ~220 linii |
| useSmoothScroll nazwa | ✅ Zrobione | Lepsza czytelność |
| CSS Files | ✅ Zrobione | ~40 linii (footer-fix) |
| Modals | ⚠️ Długoterminowe | ~150 linii (po migracji) |
| useLivingSite parallax | ✅ Nie duplikacja | Różne API |

---

## 🎯 Co zostało do zrobienia

### Priorytet 1 (Opcjonalne - małe duplikacje):
1. ✅ Przeanalizować CSS files pod kątem duplikacji - **ZROBIONE** (usunięto footer-fix.css)
2. ✅ Wyodrębnić wspólną logikę parallax z useLivingSite - **NIE POTRZEBNE** (różne API)

### Priorytet 2 (Długoterminowe - wymaga planu):
3. ⚠️ Stopniowa migracja modali z UnifiedModal do overlays/Modal (24 miejsca do zmiany)

---

## 📊 Podsumowanie wykonanych zmian

### Usunięte pliki (12):
1. ✅ `src/hooks/useLenis.ts`
2. ✅ `src/lib/smoothScroll.ts`
3. ✅ `src/config/api.ts`
4. ✅ `src/components/animations/ParallaxSection.tsx`
5. ✅ `src/components/animations/RevealOnScroll.tsx` (GSAP)
6. ✅ `src/components/animations/ScrollReveal.tsx` (pierwsza wersja)
7. ✅ `src/components/effects/SmoothScrollReveal.tsx`
8. ✅ `src/components/animations/ScrollAnimations.tsx`
9. ✅ `src/hooks/useAdvancedParallax.ts`
10. ✅ `src/hooks/useSmoothScroll.ts` (przemianowany na useGSAPAnimations.ts)
11. ✅ `src/services/auctionService.calculateTimeLeft()` (deprecated method)
12. ✅ `src/styles/footer-fix.css` (duplikat emergency-fix.css)

### Utworzone/zmienione:
- ✅ `src/utils/auction.ts` - wspólne funkcje `calculateTimeLeft()` i `formatTimeLeft()`
- ✅ `src/components/motion/RevealOnScroll.tsx` - rozszerzony o wszystkie funkcje
- ✅ `src/hooks/useGSAPAnimations.ts` - przemianowany z useSmoothScroll

### Usunięte dependencies:
- ✅ `gsap-trial`
- ✅ `locomotive-scroll`

### Łączna oszczędność:
- **~1165+ linii kodu**
- **2 nieużywane dependencies**
- **1 duplikat CSS**
- **Lepsza czytelność i spójność kodu**
