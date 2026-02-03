# 🎯 QUICK START - Premium GSAP Animations

## ⚡ 3-Minutowy Przegląd

### 1. Podstawowe Data Attributes

```html
<!-- Animacja liter (tytuły hero) -->
<h1 data-split-text>Twój Tytuł</h1>

<!-- Animacja słów (podtytuły) -->
<h2 data-word-reveal>Twój Podtytuł</h2>

<!-- Parallax obrazu -->
<div data-parallax-container>
  <img data-parallax-image src="..." />
</div>

<!-- Staggered reveal kart -->
<div data-reveal-container>
  <div data-reveal-item>Karta 1</div>
  <div data-reveal-item>Karta 2</div>
</div>

<!-- Fade in sekcji -->
<section data-fade-in>...</section>

<!-- Magnetic hover -->
<button data-magnetic data-magnetic-strength="0.3">CTA</button>
```

### 2. Nowe Premium Effects

```html
<!-- Clip reveal (od środka) -->
<img data-clip-reveal src="hero.jpg" />

<!-- Slice reveal (żaluzje) -->
<img data-slice-reveal src="feature.jpg" />

<!-- Scale podczas scrolla -->
<h2 data-scale-scroll>Nagłówek</h2>

<!-- Depth parallax -->
<div data-speed="0.5">Tło (wolniej)</div>
<div data-speed="1.5">Pierwszy plan (szybciej)</div>
```

---

## 🎨 Domyślne Ustawienia (Już Działają!)

| Parametr | Wartość |
|----------|---------|
| **Default easing** | `expo.out` |
| **Default duration** | `1.2s` |
| **Scrub values** | `1.5-2` |
| **Stagger amount** | `0.6-0.8s` |

Nie musisz ich ustawiać ręcznie - są już skonfigurowane globalnie!

---

## 🔥 Top 5 Najczęściej Używanych

### 1. Hero z Parallax + Split Text
```tsx
<section>
  <div data-parallax-container>
    <img data-clip-reveal src="hero.jpg" />
  </div>
  <h1 data-split-text>Champion Pigeon Auctions</h1>
  <button data-magnetic data-magnetic-strength="0.3">CTA</button>
</section>
```

### 2. Feature Cards Grid
```tsx
<section data-fade-in>
  <h2 data-scale-scroll>Nasze Usługi</h2>
  <div data-reveal-container className="grid grid-cols-3 gap-8">
    {features.map(f => (
      <div data-reveal-item>{f.content}</div>
    ))}
  </div>
</section>
```

### 3. Gallery z Reveals
```tsx
<div className="grid grid-cols-2">
  <img data-clip-reveal src="1.jpg" />
  <img data-slice-reveal src="2.jpg" />
  <img data-clip-reveal src="3.jpg" />
  <img data-slice-reveal src="4.jpg" />
</div>
```

### 4. Scroll-Linked Content
```tsx
<section data-fade-in>
  <div data-speed="0.7">
    <h2 data-word-reveal>Heading</h2>
    <p>Content...</p>
  </div>
</section>
```

### 5. Interactive Buttons
```tsx
<div className="flex gap-4">
  <button data-magnetic data-magnetic-strength="0.4">
    Primary CTA
  </button>
  <button data-magnetic data-magnetic-strength="0.2">
    Secondary
  </button>
</div>
```

---

## ⚠️ NAJWAŻNIEJSZE ZASADY

### ✅ DO (Rób to!)

```tsx
// 1. Inicjalizuj w useEffect
useEffect(() => {
  initAllAnimations();
}, []);

// 2. Używaj data attributes
<div data-reveal-item>...</div>

// 3. Wrap obrazy w container dla parallax
<div data-parallax-container>
  <img data-parallax-image src="..." />
</div>

// 4. Dodaj overflow: hidden dla clip-reveal
<div className="overflow-hidden">
  <img data-clip-reveal src="..." />
</div>
```

### ❌ DON'T (Nie rób tego!)

```tsx
// ❌ Nie twórz nowych ScrollTriggers bez potrzeby
ScrollTrigger.create({ ... })

// ❌ Nie używaj inline styles dla transform
<div style={{ transform: 'translateY(20px)' }}>

// ❌ Nie mieszaj data attributes
<div data-fade-in data-reveal-item>  // Wybierz jedno!

// ❌ Nie zapominaj o cleanup
useEffect(() => {
  initAllAnimations();
  // return () => ScrollTrigger.killAll();  // Tylko jeśli naprawdę potrzebne
}, []);
```

---

## 🎯 Cheat Sheet - Kiedy Czego Użyć?

| Sytuacja | Użyj |
|----------|------|
| **Hero tytuł** | `data-split-text` |
| **Podtytuły** | `data-word-reveal` |
| **Hero obraz** | `data-clip-reveal` + `data-parallax-container` |
| **Karty w grid** | `data-reveal-item` (na każdej karcie) |
| **Sekcja** | `data-fade-in` |
| **Nagłówek sekcji** | `data-scale-scroll` |
| **CTA button** | `data-magnetic` |
| **Tło parallax** | `data-speed="0.5"` |
| **Pierwszy plan** | `data-speed="1.5"` |
| **Gallery obraz** | `data-slice-reveal` LUB `data-clip-reveal` |

---

## 🚀 Gotowe Snippety

### Hero Section (copy-paste ready)
```tsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  <div data-speed="0.5" className="absolute inset-0">
    <div data-parallax-container className="w-full h-full">
      <img data-clip-reveal src="/hero.jpg" className="w-full h-full object-cover" />
    </div>
  </div>
  
  <div className="relative z-10 text-center">
    <h1 data-split-text className="text-7xl font-bold mb-6">
      Twój Tytuł
    </h1>
    <p data-word-reveal className="text-2xl mb-12">
      Twój podtytuł
    </p>
    <button data-magnetic data-magnetic-strength="0.3" className="px-12 py-4 bg-white rounded-full">
      CTA Button
    </button>
  </div>
</section>
```

### Feature Cards (copy-paste ready)
```tsx
<section data-fade-in className="py-32">
  <h2 data-scale-scroll className="text-6xl text-center mb-20">
    Nagłówek Sekcji
  </h2>
  
  <div data-reveal-container className="grid grid-cols-3 gap-8">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} data-reveal-item className="bg-gray-900 p-8 rounded-2xl">
        <h3 className="text-2xl font-bold mb-3">Feature {i}</h3>
        <p className="text-gray-400">Description...</p>
      </div>
    ))}
  </div>
</section>
```

---

## 📊 Performance Tips

```tsx
// ✅ Dobre - cleanup clip-path
onComplete: () => {
  gsap.set(element, { clipPath: 'none' });
}

// ✅ Dobre - will-change dla transform
.animated-element {
  will-change: transform;
}

// ✅ Dobre - używaj batching dla list
<div data-reveal-container>
  {items.map(...)}  // Auto-batch przez ScrollTrigger.batch()
</div>

// ❌ Złe - pojedyncze ScrollTriggers dla każdego elementu
{items.map(item => (
  <div ref={el => createScrollTrigger(el)}>  // Wolne!
))}
```

---

## 🎨 Custom Easings (gdy potrzebujesz więcej kontroli)

```tsx
import { gsapEasings, customBezierCurves } from '@/lib/customEasings';

// W GSAP animations
gsap.to(element, {
  ease: gsapEasings.ultraExpo,  // expo.out
  // LUB
  ease: gsapEasings.circ,       // circ.out (bardzo gładki)
  // LUB
  ease: gsapEasings.sine,       // sine.inOut (naturalny)
});

// W CSS animations
.my-element {
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
  /* = customBezierCurves.agencyPremium */
}
```

---

## 🔍 Debugging

```tsx
// 1. Sprawdź czy animacje są inicjalizowane
console.log('GSAP initialized:', gsap.version);

// 2. Sprawdź ScrollTriggers
ScrollTrigger.getAll().forEach(st => console.log(st));

// 3. Odśwież po zmianach DOM
ScrollTrigger.refresh();

// 4. Kill wszystkie (reset)
ScrollTrigger.killAll();
```

---

## 📚 Więcej Informacji

- **Pełny guide:** `GSAP_PREMIUM_GUIDE.md`
- **Przykłady React:** `src/examples/PremiumGSAPExamples.tsx`
- **Konfiguracja:** `src/lib/gsapConfig.ts`
- **Wszystkie animacje:** `src/lib/gsapAnimations.ts`
- **Custom easings:** `src/lib/customEasings.ts`

---

**🎉 Gotowe! Twoje animacje są teraz na poziomie Awwwards!**
