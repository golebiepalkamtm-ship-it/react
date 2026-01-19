# 🎬 LIVING WEB - Szybki Start

## ✅ System Zainstalowany i Gotowy!

**Utworzone komponenty:**
- ✅ SmoothScrollProvider (Lenis + GSAP sync)
- ✅ SplitText (character-by-character reveals)
- ✅ LottieScroll (Lottie zsynchronizowane ze scrollem)
- ✅ ParallaxSection & ParallaxLayer (multi-layer depth)
- ✅ PinnedSection (scroll-jacking)
- ✅ RevealOnScroll (universal reveal)
- ✅ HorizontalScroll (horizontal scroll-jacking)
- ✅ useGSAP hook (lifecycle management)

---

## 🚀 Zobacz Demo

Otwórz w przeglądarce:

```
http://localhost:5173/living-web
```

---

## 📝 Jak Używać w Swoich Stronach

### 1. Importuj komponenty

```tsx
import {
  SplitText,
  RevealOnScroll,
  ParallaxSection,
  ParallaxLayer,
  PinnedSection,
  HorizontalScroll,
  LottieScroll
} from '@/components/animations';
```

### 2. Użyj w JSX

```tsx
// Character-by-character reveal
<SplitText 
  animationType="slide" 
  stagger={0.03}
  scrub={1}
>
  PAŁKA MTM
</SplitText>

// Fade in from bottom
<RevealOnScroll direction="up" delay={0.3}>
  <p>Twój tekst</p>
</RevealOnScroll>

// Parallax layers
<ParallaxSection>
  <ParallaxLayer speed={0.3}>
    {/* Wolna warstwa */}
  </ParallaxLayer>
  <ParallaxLayer speed={0.7}>
    {/* Szybka warstwa */}
  </ParallaxLayer>
</ParallaxSection>
```

---

## 🎯 Następne Kroki

1. **Obejrzyj Demo:**
   - Przejdź do http://localhost:5173/living-web
   - Scrolluj powoli aby zobaczyć wszystkie efekty
   - Zwróć uwagę na synchronizację animacji

2. **Eksperymentuj z Parametrami:**
   - Zmień `stagger` w SplitText
   - Dostosuj `speed` w ParallaxLayer
   - Wypróbuj różne `animationType`

3. **Dodaj do HomePage:**
   - Zastąp istniejące sekcje komponentami Living Web
   - Użyj SplitText dla głównych nagłówków
   - Dodaj ParallaxSection dla tła

4. **Czytaj Dokumentację:**
   - Pełna dokumentacja w `LIVING_WEB_DOCS.md`
   - Przykłady użycia dla każdego komponentu
   - API reference i best practices

---

## 🎨 Przykład: Hero Section

```tsx
<section className="min-h-screen flex items-center justify-center">
  <ParallaxSection className="absolute inset-0">
    <ParallaxLayer speed={0.2}>
      <div className="bg-gold/20 w-full h-full" />
    </ParallaxLayer>
  </ParallaxSection>

  <div className="relative z-10 text-center">
    <SplitText
      className="text-8xl font-bold"
      animationType="slide"
      stagger={0.03}
    >
      PAŁKA MTM
    </SplitText>

    <RevealOnScroll direction="up" delay={0.5}>
      <p className="text-2xl">Trzy pokolenia doskonałości</p>
    </RevealOnScroll>
  </div>
</section>
```

---

## 🔥 Funkcje Zaawansowane

### Pinned Section z Timeline

```tsx
<PinnedSection end="+=200%">
  {/* Viewport przypięty, wewnętrzne animacje się odgrywają */}
</PinnedSection>
```

### Horizontal Scroll Gallery

```tsx
<HorizontalScroll speed={1.5}>
  <div className="min-w-[500px]">Card 1</div>
  <div className="min-w-[500px]">Card 2</div>
  <div className="min-w-[500px]">Card 3</div>
</HorizontalScroll>
```

### Custom GSAP z useGSAP Hook

```tsx
const ref = useRef(null);

useGSAP(() => {
  gsap.to('.element', {
    scrollTrigger: {
      trigger: ref.current,
      scrub: 1,
    },
    rotate: 360,
    scale: 2,
  });
}, [], ref);
```

---

## 🎬 **Living Web Is Active!**

Każdy scroll to klatka filmu. Każda sekcja to scena.

**Czas stworzyć magię! 🚀**
