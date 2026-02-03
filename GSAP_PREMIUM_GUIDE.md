# 🎬 Premium GSAP Animation System - Guide

## 📋 Przegląd Zmian

Twój system animacji GSAP został zaktualizowany do poziomu **najlepszych agencji kreatywnych** (Awwwards, FWA). Oto kluczowe ulepszenia:

### ✨ Zmiany Główne

1. **Easing (Krzywe Przejść)**
   - Domyślny easing zmieniony z `power2.out` → **`expo.out`**
   - Dodane ultra-smooth custom bezier curves (agencyPremium, ultraSmooth)
   - Wszystkie animacje używają długiego, wybrzmiewającego ruchu

2. **Scroll Interpolation**
   - `scrub` zwiększone z `0.5-1` → **`1.5-2`**
   - Animacje są bezpośrednio "przywiązane" do kółka myszy
   - Pełna kontrola użytkownika nad tempem animacji

3. **Staggering**
   - Grid-based staggering dla kart (`grid: 'auto'`)
   - Parametr `from: 'start'` z easingiem `power2.inOut`
   - Subtelne opóźnienia między elementami (0.6-1.0s amount)

4. **Reveal Effects**
   - **Clip-path reveals** - obrazy odkrywają się z centrum
   - **Slice reveals** - efekt żaluzji
   - **SkewY + rotation** podczas scrollowania
   - **Filter transitions** (blur, brightness, saturation)

---

## 🎨 Dostępne Animacje

### 1. **Hero Text Split** - Animacja Liter
```html
<h1 data-split-text>Champion Pigeon Auctions</h1>
```

**Parametry:**
- Easing: `expo.out`
- Duration: `1.4s`
- Stagger: `0.8s amount` z `from: 'start'`
- Efekty: `rotateX: -90 → 0`, `y: 60 → 0`

**Użycie:** Tytuły hero, główne nagłówki

---

### 2. **Image Parallax** - Scale + Movement
```html
<div data-parallax-container style="overflow: hidden;">
  <img data-parallax-image src="pigeon.jpg" />
</div>
```

**Parametry:**
- Scale: `1.3 → 1.0`
- Y movement: `-15% → 15%`
- Scrub: `1.5` (ultra-smooth)
- Filter: `brightness(0.7) → 1`

**Użycie:** Hero images, feature images, gallery

---

### 3. **Batch Card Reveal** - Staggered Grid
```html
<div data-reveal-container>
  <div data-reveal-item>Card 1</div>
  <div data-reveal-item>Card 2</div>
  <div data-reveal-item>Card 3</div>
</div>
```

**Parametry:**
- Easing: `expo.out`
- Duration: `1.6s`
- Stagger: `0.8s amount`, `grid: 'auto'`
- Efekty: 
  - `clipPath: polygon(0% 100%, ...) → polygon(0% 0%, ...)`
  - `skewY: 3 → 0`
  - `filter: blur(8px) → blur(0px)`

**Użycie:** Gridy kart, listy aukcji, feature sections

---

### 4. **Depth Parallax** - Multi-Layer Movement
```html
<div data-speed="0.5">Tło (wolniej)</div>
<div data-speed="1.0">Środek (normalnie)</div>
<div data-speed="1.5">Pierwszy plan (szybciej)</div>
```

**Parametry:**
- Scrub: `2` (maksymalna kontrola)
- Ease: `none`
- Speed: `< 1` = dalej, `> 1` = bliżej

**Użycie:** Hero backgrounds, decorative elements

---

### 5. **Section Fade In** - Scroll-Driven
```html
<section data-fade-in>
  <h2>Nasze Usługi</h2>
  <p>Treść sekcji...</p>
</section>
```

**Parametry:**
- Easing: `expo.out`
- Duration: `1.8s`
- Scrub: `1.2`
- Efekty: `y: 100`, `rotateX: -5`, `scale: 0.96`

**Użycie:** Wszystkie główne sekcje strony

---

### 6. **Heading Word Reveal** - Word-by-Word
```html
<h2 data-word-reveal>Najlepsze Gołębie Rasowe w Polsce</h2>
```

**Parametry:**
- Easing: `expo.out`
- Duration: `1.2s`
- Stagger: `0.6s amount`
- Efekty: `yPercent: 120`, `skewY: 7`, `rotateX: -45`

**Użycie:** Podtytuły, feature headings

---

### 7. **Cinematic Clip Reveal** 🆕
```html
<img data-clip-reveal src="champion-pigeon.jpg" />
```

**Parametry:**
- Easing: `expo.out`
- Duration: `2s`
- Scrub: `1.5`
- ClipPath: `polygon(50% 50%, ...) → polygon(0% 0%, ...)`
- Scale: `1.2 → 1.0`
- Filter: `brightness(0.4) → 1`, `saturate(0.5) → 1`

**Użycie:** Hero images, wyróżnione zdjęcia gołębi

---

### 8. **Vertical Slice Reveal** 🆕
```html
<img data-slice-reveal src="pigeon-race.jpg" />
```

**Parametry:**
- Easing: `expo.out`
- Duration: `1.8s`
- Scrub: `1.2`
- ClipPath: `polygon(0% 0%, 0% 0%, ...) → polygon(0% 0%, 100% 0%, ...)`
- Transform: `x: -60 → 0`, `skewX: -5 → 0`
- Filter: `grayscale(100%) → 0%`

**Użycie:** Gallery reveals, before/after

---

### 9. **Magnetic Hover Effect** 🆕
```html
<button data-magnetic data-magnetic-strength="0.3">
  Kup Teraz
</button>
```

**Parametry:**
- Easing: `expo.out`
- Duration: `0.6s`
- Strength: `0.1-0.5` (recommended)

**Użycie:** CTA buttons, interactive cards

---

### 10. **Scroll-Linked Scale** 🆕
```html
<h2 data-scale-scroll>Premium Auctions</h2>
```

**Parametry:**
- Scale: `1.5 → 1.0`
- Opacity: `0.3 → 1`
- Scrub: `1.5`
- Y movement: `100 → 0`

**Użycie:** Section headers, announcement banners

---

## 🎯 Najlepsze Praktyki

### Kiedy Używać Scrub?

```typescript
// ❌ Zły sposób - brak scrub dla scroll-based animations
scrollTrigger: {
  trigger: element,
  start: 'top bottom',
  toggleActions: 'play none none reverse'
}

// ✅ Dobry sposób - scrub dla smooth scroll interpolation
scrollTrigger: {
  trigger: element,
  start: 'top bottom',
  end: 'top 20%',
  scrub: 1.5  // 1-2 dla premium smoothness
}
```

### Wybór Easingu

```typescript
// Standardowe animacje
ease: 'expo.out'  // Domyślny, najlepszy dla większości przypadków

// Szybkie interakcje (hover, click)
ease: 'power3.out'  // Krótsze, bardziej responsywne

// Dramatyczne reveale
ease: 'power4.out'  // Bardzo długie wybrzmiewanie

// Bounce effects (używaj oszczędnie!)
ease: 'back.out(1.7)'  // Subtelny overshoot
```

### Stagger Configuration

```typescript
// ✅ Premium staggering
stagger: {
  amount: 0.8,        // Total duration
  from: 'start',      // Direction
  grid: 'auto',       // Auto-detect grid
  ease: 'power2.inOut' // Easing dla staggeru
}

// ❌ Proste (mniej kontroli)
stagger: 0.2
```

---

## 🔧 Performance Tips

1. **Cleanup clip-path po animacji:**
```typescript
onComplete: () => {
  gsap.set(element, { clipPath: 'none' });
}
```

2. **Używaj will-change:**
```typescript
element.style.willChange = 'transform, opacity';
```

3. **Batching dla wielu elementów:**
```typescript
ScrollTrigger.batch(items, {
  interval: 0.1,  // Optymalizacja
  // ...
});
```

4. **Force3D w config:**
```typescript
gsap.config({
  force3D: true  // Hardware acceleration
});
```

---

## 📊 Porównanie: Przed vs Po

| Parametr | Przed | Po |
|----------|-------|-----|
| Default easing | `power2.out` | **`expo.out`** |
| Scrub values | `0.5-1` | **`1.5-2`** |
| Stagger | `0.2` (simple) | **`{ amount: 0.8, grid: 'auto' }`** |
| Duration | `0.6-0.8s` | **`1.2-2.0s`** |
| Effects | opacity, y | **clipPath, skewY, filters** |

---

## 🎬 Przykładowy Workflow

### Strona Główna - Hero Section

```html
<!-- Hero Container -->
<section class="hero-section">
  <!-- Background Parallax -->
  <div data-speed="0.3" class="hero-bg">
    <img data-clip-reveal src="hero-pigeon.jpg" />
  </div>
  
  <!-- Main Title -->
  <h1 data-split-text>Champion Pigeon Auctions</h1>
  
  <!-- Subtitle -->
  <p data-word-reveal>Najlepsze Gołębie Rasowe w Europie</p>
  
  <!-- CTA Button -->
  <button data-magnetic data-magnetic-strength="0.3">
    Przeglądaj Aukcje
  </button>
</section>
```

### Features Section - Card Grid

```html
<section data-fade-in>
  <h2 data-scale-scroll>Nasze Usługi</h2>
  
  <div data-reveal-container class="grid grid-cols-3 gap-8">
    <div data-reveal-item class="feature-card">...</div>
    <div data-reveal-item class="feature-card">...</div>
    <div data-reveal-item class="feature-card">...</div>
  </div>
</section>
```

### Gallery Section - Image Reveals

```html
<section data-fade-in>
  <div class="gallery">
    <img data-slice-reveal src="pigeon-1.jpg" />
    <img data-clip-reveal src="pigeon-2.jpg" />
    <img data-parallax-image src="pigeon-3.jpg" />
  </div>
</section>
```

---

## 🚀 Inicjalizacja

Wszystkie animacje inicjalizują się automatycznie:

```typescript
import { initAllAnimations } from '@/lib/gsapAnimations';

// W App.tsx lub głównym komponencie
useEffect(() => {
  initAllAnimations();
}, []);
```

---

## 🎨 Custom Easings Available

```typescript
import { customBezierCurves, gsapEasings } from '@/lib/customEasings';

// Bezier curves (dla CSS animations)
customBezierCurves.agencyPremium    // 'cubic-bezier(0.19, 1, 0.22, 1)'
customBezierCurves.ultraSmooth      // 'cubic-bezier(0.215, 0.61, 0.355, 1)'
customBezierCurves.appleMagic       // 'cubic-bezier(0.4, 0.0, 0.2, 1)'

// GSAP easings
gsapEasings.ultraExpo  // 'expo.out' - główny easing
gsapEasings.circ       // 'circ.out' - bardzo gładki
gsapEasings.sine       // 'sine.inOut' - naturalny
```

---

## 💡 Inspiracje & Referencje

- **Awwwards** - agencyPremium curve
- **Apple** - appleMagic transition
- **Google Material** - materialDesign curve
- **FWA** - clip-reveal effects
- **Locomotive Scroll** - scroll interpolation (scrub)

---

**Efekt końcowy:** Animacje na poziomie [awwwards.com](https://awwwards.com) z pełną kontrolą użytkownika nad tempem scrollowania i ultra-smooth transitions! 🎉
