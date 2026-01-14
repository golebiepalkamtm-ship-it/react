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

1. **Użyj `once: true`** dla animacji które powinny wykonać się tylko raz
2. **Limit animacji na stronie** - zbyt wiele animacji wpłynęłoby na wydajność
3. **Unikaj animacji na dużych listach** - użyj `GsapStaggeredList` dla optimizacji
4. **Testuj na wolnych urządzeniach** - sprawdzaj wydajność

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

---

**Wersja:** 1.0.0
**Ostatnia aktualizacja:** 2024
