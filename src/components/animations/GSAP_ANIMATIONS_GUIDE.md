# GSAP Scroll Animations - Przewodnik Użytkownika

## 📚 Przegląd

Biblioteka zawiera gotowe komponenty animacji GSAP z ScrollTrigger, które zostały zoptymalizowane dla wydajności i łatwości użycia.

## 🚀 Szybki Start

### Instalacja
Już zainstalowana! Biblioteka GSAP jest dostępna w `package.json`.

### Podstawowy Przykład

```jsx
import { GsapFadeInUp } from '@/components/animations';

export const MyComponent = () => (
  <GsapFadeInUp>
    <h1>Cześć, świecie!</h1>
  </GsapFadeInUp>
);
```

## 📦 Dostępne Komponenty

### 1. GsapFadeInUp
Fade in z przesunięciem do góry.

```jsx
<GsapFadeInUp delay={0} duration={0.6} className="my-class">
  <div>Treść</div>
</GsapFadeInUp>
```

**Props:**
- `delay?: number` - Opóźnienie animacji (domyślnie: 0)
- `duration?: number` - Czas trwania animacji (domyślnie: 0.6s)
- `className?: string` - Klasy CSS

---

### 2. GsapSlideInLeft
Element wślizga się z lewej strony.

```jsx
<GsapSlideInLeft distance={50} delay={0} duration={0.6}>
  <div>Zawartość</div>
</GsapSlideInLeft>
```

**Props:**
- `distance?: number` - Dystans przesunięcia (domyślnie: 50px)
- `delay?: number` - Opóźnienie
- `duration?: number` - Czas trwania
- `className?: string` - Klasy CSS

---

### 3. GsapSlideInRight
Element wślizga się z prawej strony.

```jsx
<GsapSlideInRight distance={50}>
  <div>Zawartość</div>
</GsapSlideInRight>
```

**Props:** Identyczne jak `GsapSlideInLeft`

---

### 4. GsapScaleIn
Element pojawia się ze skalowaniem.

```jsx
<GsapScaleIn delay={0} duration={0.6}>
  <div>Zawartość</div>
</GsapScaleIn>
```

**Props:**
- `delay?: number` - Opóźnienie
- `duration?: number` - Czas trwania
- `className?: string` - Klasy CSS

---

### 5. GsapParallax
Efekt parallax - element porusza się innym tempem niż reszta strony.

```jsx
<GsapParallax speed={0.5} className="my-class">
  <div>Zawartość z parallax</div>
</GsapParallax>
```

**Props:**
- `speed?: number` - Prędkość parallax (domyślnie: 0.5)
- `className?: string` - Klasy CSS

---

### 6. GsapStaggeredList
Animacja sekwencyjna dla listy elementów.

```jsx
<GsapStaggeredList staggerDelay={0.1}>
  {items.map(item => (
    <div key={item.id} data-stagger-item>
      {item.name}
    </div>
  ))}
</GsapStaggeredList>
```

**Props:**
- `staggerDelay?: number` - Opóźnienie między elementami (domyślnie: 0.1s)
- `className?: string` - Klasy CSS

**Ważne:** Każdy element musi mieć atrybut `data-stagger-item`

---

### 7. GsapTextReveal
Animacja tekstu - każdy znak pojawia się sekwencyjnie.

```jsx
<GsapTextReveal 
  text="CHAMPION PIGEON"
  delay={0}
  className="text-4xl font-bold"
/>
```

**Props:**
- `text: string` - Tekst do animacji
- `delay?: number` - Opóźnienie
- `className?: string` - Klasy CSS

---

### 8. GsapCountUp
Animacja licznika (zliczanie).

```jsx
<GsapCountUp 
  end={1250}
  start={0}
  duration={2}
  suffix="+"
  prefix="$"
  className="text-5xl font-bold"
/>
```

**Props:**
- `end: number` - Liczba końcowa
- `start?: number` - Liczba początkowa (domyślnie: 0)
- `duration?: number` - Czas animacji (domyślnie: 2s)
- `suffix?: string` - Tekst na końcu
- `prefix?: string` - Tekst na początku
- `className?: string` - Klasy CSS

---

### 9. GsapRotateIn
Element pojawia się z rotacją.

```jsx
<GsapRotateIn angle={360} delay={0} duration={0.8}>
  <div>Zawartość</div>
</GsapRotateIn>
```

**Props:**
- `angle?: number` - Kąt rotacji (domyślnie: 360°)
- `delay?: number` - Opóźnienie
- `duration?: number` - Czas trwania
- `className?: string` - Klasy CSS

---

### 10. GsapBlurIn
Element pojawia się z efektem rozmycia.

```jsx
<GsapBlurIn delay={0} duration={0.8}>
  <div>Zawartość</div>
</GsapBlurIn>
```

**Props:**
- `delay?: number` - Opóźnienie
- `duration?: number` - Czas trwania
- `className?: string` - Klasy CSS

---

## 🎯 Zaawansowane Przykłady

### Kombinacja Animacji

```jsx
export const Hero = () => (
  <div className="min-h-screen">
    <GsapFadeInUp duration={0.8}>
      <h1 className="text-6xl font-bold">Tytuł</h1>
    </GsapFadeInUp>

    <GsapSlideInLeft delay={0.2}>
      <p className="text-xl">Podtytuł</p>
    </GsapSlideInLeft>
  </div>
);
```

### Staggered Cards

```jsx
export const CardGrid = () => {
  const cards = [1, 2, 3, 4];

  return (
    <div className="grid grid-cols-2 gap-8">
      {cards.map(card => (
        <GsapScaleIn key={card} delay={card * 0.15}>
          <div className="bg-gold/10 p-8 rounded-xl">
            Card {card}
          </div>
        </GsapScaleIn>
      ))}
    </div>
  );
};
```

### Parallax Background

```jsx
export const Section = () => (
  <section className="relative overflow-hidden">
    <GsapParallax speed={0.3} className="absolute inset-0 -z-10">
      <div className="w-full h-full bg-gradient-gold opacity-20"></div>
    </GsapParallax>

    <div className="relative z-10">
      <h2>Zawartość nad parallax</h2>
    </div>
  </section>
);
```

### Sticky Section with Inner Animations

```jsx
export const StickySection = () => (
  <section className="min-h-screen">
    <GsapPinElement duration={5}>
      <div className="h-screen flex items-center justify-center">
        <GsapFadeInUp duration={1.5}>
          <h2 className="text-5xl font-bold">Sticky Content</h2>
        </GsapFadeInUp>
      </div>
    </GsapPinElement>
  </section>
);
```

### Scroll-Driven Visual Effects

```jsx
export const VisualEffectsSection = () => {
  const { visualEffects } = useLivingSite();

  useEffect(() => {
    const element = document.querySelector('.visual-effects-element');
    if (element) {
      visualEffects(element, {
        bokeh: true,
        depthOfField: true,
        glow: true,
        intensity: 1.5
      });
    }
  }, []);

  return (
    <section className="min-h-screen">
      <div className="visual-effects-element h-screen bg-gradient-to-b from-blue-500 to-purple-600">
        <h2 className="text-5xl font-bold text-white">Visual Effects</h2>
      </div>
    </section>
  );
};
```

---

## 🪝 Hooki Zaawansowane

### useGsapScroll
Utwórz niestandardową animację scroll.

```jsx
import { useGsapScroll } from '@/hooks/useGsapScroll';
import { gsap } from 'gsap';

export const CustomAnimation = () => {
  const ref = useGsapScroll((trigger) => {
    gsap.to(ref.current, {
      scrollTrigger: {
        trigger: trigger.selector,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
      rotation: 360,
      duration: 2
    });
  }, { once: false });

  return <div ref={ref}>Moja niestandardowa animacja</div>;
};
```

### useGsapTimeline
Utwórz sekwencję animacji.

```jsx
import { useGsapTimeline } from '@/hooks/useGsapScroll';
import { gsap } from 'gsap';

export const Sequence = () => {
  useGsapTimeline((tl) => {
    tl.to('.element1', { x: 100 })
      .to('.element2', { opacity: 1 })
      .to('.element3', { y: -50 });
  });

  return (
    <>
      <div className="element1">1</div>
      <div className="element2">2</div>
      <div className="element3">3</div>
    </>
  );
};
```

---

## 🎨 Tailwind CSS Integracja

Komponenty doskonale współpracują z Tailwind CSS:

```jsx
<GsapFadeInUp className="max-w-4xl mx-auto px-4">
  <h2 className="text-5xl font-display font-bold text-gold mb-8">
    Tytuł sekcji
  </h2>
  <p className="text-lg text-gray-300">
    Zawartość
  </p>
</GsapFadeInUp>
```

---

## ⚡ Performance Tips

1. **Użyj `scrub: true`** dla płynnych animacji scroll-driven (Living Sites)
2. **Użyj `once: false`** dla animacji które powinny reagować na scroll
3. **Limit animacji na stronie** - zbyt wiele animacji wpłynęłoby na wydajność
4. **Unikaj animacji na dużych listach** - użyj `GsapStaggeredList` dla optimizacji
5. **Testuj na wolnych urządzeniach** - sprawdzaj wydajność

---

## 🔗 Demo Strona

Odwiedź `/gsap-animations` aby zobaczyć wszystkie animacje w akcji.

---

## 📖 Dokumentacja GSAP

Pełna dokumentacja GSAP: https://greensock.com/docs/

---

## 💡 Wskazówki

- Komponenty automatycznie wykonują się gdy element wejdzie w viewport
- Wszystkie animacje są responsive
- Nie potrzebujesz konfigurować ScrollTrigger - zrobione za Ciebie
- Możesz kombinować różne komponenty dla złożonych efektów
- Używaj `scrub: true` dla płynnych animacji scroll-driven (Living Sites)

---

## 🐛 Troubleshooting

### Animacja się nie wykonuje
- Sprawdź czy komponent jest w viewport
- Upewnij się że element ma wysokość (`min-h-screen` lub konkretną wysokość)

### Animacja jest zbyt szybka/wolna
- Zmień `duration` prop na komponencie
- Lub zmień `staggerDelay` dla list

### Parallax nie działa
- Upewnij się że `speed` jest ustawiony poprawnie
- Sprawdź czy element ma poprawne CSS

### Scroll-driven animacje nie działają
- Upewnij się że używasz `scrub: true` i `once: false`
- Sprawdź czy element ma poprawną wysokość i pozycję

---

**Wersja:** 2.0.0
**Ostatnia aktualizacja:** 2026
**Nowe funkcje:**
- Wszystkie animacje używają `scrub: true` dla płynnych animacji scroll-driven
- Dodano zaawansowane techniki "Sticky Triggering" z animacjami wewnątrz
- Dodano efekty wizualne (bokeh, depth of field, glow)
- Zoptymalizowano viewport awareness dla lepszej wydajności
- Dodano hook `visualEffects` dla zaawansowanych efektów wizualnych
- Zaktualizowano dokumentację z nowymi przykładami i najlepszymi praktykami

---

## 🎨 CSS dla efektów wizualnych

Dodaj te klasy CSS do swojego projektu dla efektów wizualnych:

```css
/* Bokeh Effect */
.bokeh-effect {
  position: relative;
  overflow: hidden;
}

.bokeh-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  filter: blur(calc(var(--bokeh-intensity, 1) * 20px));
  opacity: calc(var(--bokeh-intensity, 1) * 0.5);
  pointer-events: none;
}

/* Depth of Field Effect */
.depth-of-field-effect {
  position: relative;
  overflow: hidden;
}

.depth-of-field-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
  opacity: calc(var(--dof-intensity, 1) * 0.3);
  pointer-events: none;
}

/* Glow Effect */
.glow-effect {
  position: relative;
}

.glow-effect::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
  filter: blur(calc(var(--glow-intensity, 1) * 30px));
  opacity: calc(var(--glow-intensity, 1) * 0.8);
  pointer-events: none;
  z-index: -1;
}
```

---

## 🎯 Integracja z Tailwind CSS

Dodaj te klasy do swojego `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      animation: {
        'bokeh-pulse': 'bokeh-pulse 3s ease-in-out infinite',
        'dof-fade': 'dof-fade 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'bokeh-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'dof-fade': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.3' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.9' },
        },
      },
    },
  },
};
```

---

## 🚀 Optymalizacja Wydajności

1. **Używaj `will-change`** dla elementów z animacjami:
   ```jsx
   <div style={{ willChange: 'transform, opacity' }} />
   ```

2. **Ograniczaj ilość animacji** na stronie do 10-15 dla najlepszej wydajności

3. **Używaj GPU acceleration**:
   ```jsx
   <div style={{ transform: 'translateZ(0)' }} />
   ```

4. **Optymalizuj obrazy** i używaj formatów WebP dla lepszej wydajności

5. **Testuj na różnych urządzeniach** i przeglądarkach

---

**Zespół Champion Pigeon Auctions**
**Lead Creative Developer: Cline**
**Data: 2026**
**Wersja: 2.0.0 - Living Sites Edition**