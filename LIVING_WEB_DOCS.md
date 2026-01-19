# 🎬 Living Web Animation System

**Kompletny system scroll-driven animations dla Champion Pigeon Auctions**

## 🚀 Stack Technologiczny

- **GSAP + ScrollTrigger** - Główny orkiestrator animacji scroll
- **Lenis** - Buttery smooth scrolling z perfekcyjną synchronizacją
- **React** - Component-based architecture
- **TypeScript** - Type safety
- **Framer Motion** - Micro-interactions (opcjonalne)
- **Lottie** - Animacje wektorowe zsynchronizowane ze scrollem

---

## 📦 Zainstalowane Komponenty

### 1. **SmoothScrollProvider**
Opakowuje całą aplikację w Lenis smooth scroll, zsynchronizowany z GSAP.

```tsx
import { SmoothScrollProvider } from '@/components/animations';

<SmoothScrollProvider>
  <App />
</SmoothScrollProvider>
```

### 2. **SplitText**
Character-by-character reveal zsynchronizowany ze scrollem.

```tsx
import { SplitText } from '@/components/animations';

<SplitText
  animationType="slide"  // 'fade' | 'slide' | 'scale' | 'rotate'
  stagger={0.03}         // Opóźnienie między literami
  scrub={1}              // Synchronizacja ze scrollem
  start="top 60%"        // Kiedy zaczyna
  end="bottom 20%"       // Kiedy kończy
>
  TWÓJ TEKST
</SplitText>
```

### 3. **LottieScroll**
Lottie animation frame kontrolowany scrollem.

```tsx
import { LottieScroll } from '@/components/animations';
import animationData from './animation.json';

<LottieScroll
  animationData={animationData}
  scrub={1}
  start="top center"
  end="bottom center"
  pin={false}  // Przypnij podczas animacji
/>
```

### 4. **ParallaxSection & ParallaxLayer**
Multi-layer parallax z różnymi prędkościami.

```tsx
import { ParallaxSection, ParallaxLayer } from '@/components/animations';

<ParallaxSection>
  <ParallaxLayer speed={0.2}>
    {/* Wolna warstwa - tło */}
  </ParallaxLayer>
  
  <ParallaxLayer speed={0.5}>
    {/* Średnia warstwa */}
  </ParallaxLayer>
  
  <ParallaxLayer speed={0.8}>
    {/* Szybka warstwa - pierwszy plan */}
  </ParallaxLayer>
</ParallaxSection>
```

### 5. **PinnedSection**
Przypina viewport podczas gdy wewnętrzne animacje się odgrywają.

```tsx
import { PinnedSection } from '@/components/animations';

<PinnedSection
  start="top top"
  end="+=200%"  // Jak długo przypięte
  pinSpacing={true}
>
  {/* Zawartość która będzie przypięta */}
</PinnedSection>
```

### 6. **RevealOnScroll**
Uniwersalny reveal z wieloma opcjami.

```tsx
import { RevealOnScroll } from '@/components/animations';

<RevealOnScroll
  direction="up"  // 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  distance={100}
  duration={1}
  delay={0.3}
  stagger={0.1}  // Dla dzieci
  scrub={false}  // lub liczba dla scroll-sync
>
  <div>Element 1</div>
  <div>Element 2</div>
  <div>Element 3</div>
</RevealOnScroll>
```

### 7. **HorizontalScroll**
Scroll-jacked horizontal movement.

```tsx
import { HorizontalScroll } from '@/components/animations';

<HorizontalScroll speed={1.5}>
  <div className="min-w-[400px]">Card 1</div>
  <div className="min-w-[400px]">Card 2</div>
  <div className="min-w-[400px]">Card 3</div>
</HorizontalScroll>
```

---

## 🎨 Hook: useGSAP

Bezpieczny lifecycle management dla GSAP animacji.

```tsx
import { useGSAP } from '@/hooks/useGSAP';
import { gsap } from 'gsap';

const MyComponent = () => {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.to('.element', {
      scrollTrigger: {
        trigger: ref.current,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
      x: 100,
      rotation: 360,
    });
  }, [], ref);

  return <div ref={ref}>...</div>;
};
```

---

## 🎯 Przykłady Użycia

### Hero Section z Character Reveal

```tsx
<section className="min-h-screen flex items-center justify-center">
  <div className="max-w-6xl mx-auto text-center">
    <SplitText
      className="text-8xl font-bold"
      animationType="slide"
      stagger={0.03}
      scrub={1}
    >
      PAŁKA MTM
    </SplitText>
    
    <RevealOnScroll direction="up" delay={0.5}>
      <p>Subtitle text</p>
    </RevealOnScroll>
  </div>
</section>
```

### Pinned Section z Animowanymi Statystykami

```tsx
<PinnedSection className="min-h-screen" end="+=150%">
  <div className="max-w-6xl mx-auto">
    <RevealOnScroll direction="scale" stagger={0.2}>
      <div className="stat">45 Lat</div>
      <div className="stat">320 Nagród</div>
      <div className="stat">1500 Mistrzów</div>
    </RevealOnScroll>
  </div>
</PinnedSection>
```

### Horizontal Gallery

```tsx
<HorizontalScroll className="py-20" speed={1}>
  {images.map((img, i) => (
    <div key={i} className="min-w-[500px]">
      <img src={img} alt="" />
    </div>
  ))}
</HorizontalScroll>
```

### Multi-Layer Parallax

```tsx
<ParallaxSection className="min-h-screen">
  <ParallaxLayer speed={0.2}>
    <div className="bg-gradient-to-b from-gold/20" />
  </ParallaxLayer>
  
  <ParallaxLayer speed={0.5}>
    <h2 className="text-9xl opacity-10">MTM</h2>
  </ParallaxLayer>
  
  <ParallaxLayer speed={0.8}>
    <div className="content">
      <SplitText>Główna zawartość</SplitText>
    </div>
  </ParallaxLayer>
</ParallaxSection>
```

---

## 🎭 Demo Page

Kompletna demonstracja wszystkich możliwości znajduje się na:

```
http://localhost:5173/living-web
```

Ta strona pokazuje:
- ✅ Hero z parallax background + SplitText
- ✅ Pinned section z counter animations
- ✅ Horizontal scroll gallery
- ✅ Multi-layer parallax depth
- ✅ Wszystkie typy text splitting (fade, slide, scale, rotate)
- ✅ RevealOnScroll w różnych wariantach

---

## ⚡ Performance Best Practices

1. **will-change: transform** - Automatycznie dodawane do animowanych elementów
2. **useGSAP hook** - Automatyczne cleanup, brak memory leaks
3. **Suspense boundaries** - Lazy loading dla ciężkich komponentów
4. **Hardware acceleration** - Wszystkie animacje używają GPU
5. **Lenis smoothing** - Zoptymalizowane dla 60fps

---

## 🔧 Konfiguracja

### Smooth Scroll Settings (SmoothScrollProvider.tsx)

```tsx
const lenis = new Lenis({
  duration: 1.2,        // Długość smoothingu
  easing: (t) => ...,   // Funkcja easingu
  smoothWheel: true,    // Smooth wheel events
  wheelMultiplier: 1,   // Czułość scrolla
});
```

### ScrollTrigger Markers (Debug)

Ustaw `markers: true` w dowolnym komponencie aby zobaczyć debug markers:

```tsx
<SplitText markers={true} ...>
```

---

## 🎬 Scroll-as-Timeline Workflow

**Zasada Złota:** Każdy scroll = klatka filmu

1. **Zdefiniuj trigger** - Który element uruchamia animację
2. **Ustaw start/end** - Kiedy animacja zaczyna/kończy
3. **scrub** - Synchronizuj ze scrollem (true/liczba)
4. **pin** - Przypnij viewport jeśli potrzeba
5. **Orkiestruj** - Połącz wiele animacji w timeline

```tsx
gsap.timeline({
  scrollTrigger: {
    trigger: element,
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
    pin: true,
  }
})
.to('.a', { x: 100 })
.to('.b', { scale: 2 }, '<')  // Jednocześnie
.to('.c', { opacity: 0 });
```

---

## 📚 Dokumentacja API

### SplitText Props
- `animationType`: 'fade' | 'slide' | 'scale' | 'rotate'
- `stagger`: number (opóźnienie między literami)
- `scrub`: boolean | number
- `start/end`: string (np. 'top 80%')

### RevealOnScroll Props
- `direction`: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
- `distance`: number (px)
- `duration`: number (s)
- `delay`: number (s)
- `stagger`: number (dla dzieci)
- `scrub`: boolean | number

### ParallaxLayer Props
- `speed`: number (0-1, gdzie 0.5 to połowa prędkości scrolla)

### PinnedSection Props
- `start/end`: string
- `pinSpacing`: boolean (czy zachować przestrzeń)

---

## 🚀 Następne Kroki

1. Uruchom demo: `npm run dev` → `http://localhost:5173/living-web`
2. Eksperymentuj z parametrami (scrub, stagger, speed)
3. Dodaj swoje własne sekcje używając komponentów
4. Integruj z istniejącymi stronami (HomePage, Auctions, etc.)

---

**🎬 Welcome to Living Web - Where Every Scroll Tells a Story**
