# 🎯 LIVING WEB - Guide Po Refaktoryzacji

## 🚀 Szybki Start

### 1. Podstawowe Użycie

```tsx
// ✅ Poprawny import
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { 
  SplitText, 
  RevealOnScroll, 
  ParallaxSection 
} from '@/components/animations';

// Twój komponent
const MyPage = () => {
  return (
    <div>
      {/* Character-by-character reveal */}
      <SplitText animationType="slide" stagger={0.03}>
        Mój Tytuł
      </SplitText>

      {/* Reveal from bottom */}
      <RevealOnScroll direction="up">
        <p>Tekst pojawi się od dołu</p>
      </RevealOnScroll>
    </div>
  );
};
```

### 2. Custom GSAP Animacje

```tsx
import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

const MyComponent = () => {
  const boxRef = useRef(null);

  useGSAP(() => {
    gsap.to(boxRef.current, {
      rotation: 360,
      scrollTrigger: {
        trigger: boxRef.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
    });
  }, []);

  return <div ref={boxRef}>Rotujący box</div>;
};
```

### 3. Parallax Multi-Layer

```tsx
import { ParallaxSection, ParallaxLayer } from '@/components/animations';

const MySection = () => {
  return (
    <ParallaxSection className="h-screen">
      {/* Wolna warstwa (tło) */}
      <ParallaxLayer speed={0.2}>
        <div className="bg-gradient-to-b from-gold/20" />
      </ParallaxLayer>

      {/* Średnia warstwa */}
      <ParallaxLayer speed={0.5}>
        <h2 className="text-9xl opacity-10">MTM</h2>
      </ParallaxLayer>

      {/* Szybka warstwa (treść) */}
      <ParallaxLayer speed={0.8}>
        <div className="content">
          <h1>Główna treść</h1>
        </div>
      </ParallaxLayer>
    </ParallaxSection>
  );
};
```

---

## 🎨 Dostępne Komponenty

### `<SplitText>`
Character-by-character text reveal.

```tsx
<SplitText
  animationType="fade"    // 'fade' | 'slide' | 'scale' | 'rotate'
  stagger={0.03}          // Opóźnienie między znakami
  scrub={1}               // Sync ze scrollem (false lub liczba)
  start="top 60%"         // Kiedy zaczyna
  end="bottom 20%"        // Kiedy kończy
>
  TWÓJ TEKST
</SplitText>
```

### `<RevealOnScroll>`
Universal reveal component.

```tsx
<RevealOnScroll
  direction="up"          // 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  distance={100}          // Dystans animacji (px)
  duration={1}            // Czas trwania (s)
  delay={0.3}             // Opóźnienie (s)
  stagger={0.1}           // Stagger dla children
  scrub={false}           // Sync ze scrollem
>
  <div>Element 1</div>
  <div>Element 2</div>
</RevealOnScroll>
```

### `<ParallaxLayer>`
Individual parallax layer.

```tsx
<ParallaxLayer 
  speed={0.5}  // 0 = static, 0.5 = połowa prędkości, 1 = pełna prędkość
>
  {children}
</ParallaxLayer>
```

### `<PinnedSection>`
Pin viewport while animations play.

```tsx
<PinnedSection
  start="top top"
  end="+=200%"            // Jak długo przypięte
  pinSpacing={true}       // Czy zachować przestrzeń
>
  {children}
</PinnedSection>
```

### `<HorizontalScroll>`
Horizontal scroll-jacking.

```tsx
<HorizontalScroll speed={1.5}>
  <div className="min-w-[400px]">Card 1</div>
  <div className="min-w-[400px]">Card 2</div>
  <div className="min-w-[400px]">Card 3</div>
</HorizontalScroll>
```

### `<LottieScroll>`
Lottie synced with scroll.

```tsx
import animationData from './animation.json';

<LottieScroll
  animationData={animationData}
  scrub={1}
  start="top center"
  end="bottom center"
  pin={false}
/>
```

---

## 🔧 Hooks

### `useGSAP(callback, dependencies, scope)`
Safe GSAP lifecycle management.

```tsx
import { useRef } from 'react';
import { gsap } from '@/lib/gsapConfig';
import { useGSAP } from '@/hooks/useGSAP';

const MyComponent = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.to('.box', {
      x: 100,
      scrollTrigger: {
        trigger: '.box',
        scrub: 1,
      },
    });
  }, [], containerRef); // Scope to container

  return <div ref={containerRef}>...</div>;
};
```

---

## 🎭 Przykłady Użycia

### Hero Section
```tsx
<section className="min-h-screen flex items-center justify-center">
  <ParallaxSection>
    <ParallaxLayer speed={0.2}>
      <div className="bg-gold/20 w-full h-full" />
    </ParallaxLayer>
  </ParallaxSection>

  <div className="relative z-10">
    <SplitText
      className="text-8xl font-bold"
      animationType="slide"
      stagger={0.03}
    >
      PAŁKA MTM
    </SplitText>

    <RevealOnScroll direction="up" delay={0.5}>
      <p>Trzy pokolenia doskonałości</p>
    </RevealOnScroll>
  </div>
</section>
```

### Stats Section
```tsx
<PinnedSection end="+=150%">
  <RevealOnScroll direction="scale" stagger={0.2}>
    <div className="stat">45 Lat</div>
    <div className="stat">320 Nagród</div>
    <div className="stat">1500 Mistrzów</div>
  </RevealOnScroll>
</PinnedSection>
```

### Gallery
```tsx
<HorizontalScroll speed={1}>
  {images.map((img, i) => (
    <div key={i} className="min-w-[500px]">
      <img src={img} alt="" />
    </div>
  ))}
</HorizontalScroll>
```

---

## ⚙️ Konfiguracja

### GSAP Config (`src/lib/gsapConfig.ts`)
```tsx
import { gsap, ScrollTrigger, easings } from '@/lib/gsapConfig';

// Użyj easingów
gsap.to(element, {
  x: 100,
  ease: easings.easeOutExpo,
});
```

### Smooth Scroll Provider (App.tsx)
```tsx
import { SmoothScrollProvider } from '@/components/animations';

<SmoothScrollProvider>
  <App />
</SmoothScrollProvider>
```

---

## 🐛 Troubleshooting

### Animacje nie działają
1. Sprawdź czy `SmoothScrollProvider` opakowuje App
2. Upewnij się że importujesz z `@/lib/gsapConfig`
3. Sprawdź console na błędy

### Scroll nie jest smooth
1. Sprawdź czy nie ma duplikatu Lenis
2. Zrestartuj dev server
3. Wyczyść cache przeglądarki

### TypeScript errors
1. Upewnij się że importujesz typy z `@/lib/gsapConfig`
2. Sprawdź czy wszystkie dependencies są zainstalowane

---

## 📚 Zasoby

- **Demo Page:** http://localhost:5173/living-web
- **Example HomePage:** http://localhost:5173/home-living
- **Dokumentacja:** `LIVING_WEB_DOCS.md`
- **Raport Refaktoryzacji:** `REFACTORING_REPORT.md`

---

**🎬 Gotowe! Czas tworzyć Living Web experiences! 🚀**
