# Instrukcja Integracji Efektów Ethereal Canvas

## Przegląd

Ten dokument opisuje zaimplementowane efekty wizualne z repozytorium `ethereal-canvas` do projektu `champion-pigeon-auctions`.

## Zaimplementowane Komponenty

### 1. Karuzela 3D (`src/components/gallery/Carousel3D.tsx`)
- **Lokalizacja**: Strona główna (`HomePage.tsx`)
- **Funkcjonalności**:
  - Momentum scrolling z fizyką bezwładności
  - Karty 3D z perspektywą i rotacją
  - Interaktywne hover effects
  - Nawigacja strzałkami i kropkami
  - Cząsteczki tła w scenie 3D

### 2. Tło z Cząsteczkami (`src/components/gallery/ParticleBackground.tsx`)
- **Warianty**: `gold`, `primary`, `mixed`
- **Funkcjonalności**:
  - Animowane cząsteczki Canvas API
  - Interakcja z kursorem (odpychanie)
  - Połączenia między bliskimi cząsteczkami
  - Ambient light orbs z animacją

### 3. Galeria Championów (`src/pages/ChampionsGallery.tsx`)
- **Ścieżka**: `/champions`
- **Funkcjonalności**:
  - Grid z efektami staggered entrance
  - Modal ze szczegółami championa
  - Floating sparkles
  - Animowane nagłówki

### 4. Hook Efektów (`src/hooks/useEtherealEffects.ts`)
- **Zawartość**:
  - `useMomentumScroll` - fizyka momentum dla scroll/drag
  - `useCursorTracking` - śledzenie pozycji kursora
  - `useSmoothScroll` - płynne scrollowanie z lerp
  - `useInViewAnimation` - intersection observer dla animacji
  - `easingFunctions` - funkcje easingu
  - `projectColors` - paleta kolorów HSL

### 5. Shadery GLSL (`src/components/gallery/shaders.ts`)
- Liquid Distortion Shader
- Background Noise Shader
- Glow Effect Shader
- Particle Shader
- Kolory dostosowane do palety projektu

---

## Instrukcja Modyfikacji Plików Globalnych

### Dodanie Smooth Scroll do Całego Projektu

**Plik: `src/App.tsx` lub główny layout**

```tsx
import { useEffect } from 'react';
import { useSmoothScroll } from '@/hooks/useEtherealEffects';

// W komponencie głównym:
const App = () => {
  // Smooth scroll dla całej strony
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    // ... reszta aplikacji
  );
};
```

### Dodanie ParticleBackground Globalnie

**Plik: `src/App.tsx`**

```tsx
import { ParticleBackground } from '@/components/gallery/ParticleBackground';

const App = () => {
  return (
    <>
      {/* Globalne tło z cząsteczkami */}
      <ParticleBackground particleCount={30} variant="gold" />
      
      {/* Reszta aplikacji */}
      <div className="relative z-10">
        {/* Routes, Layout, etc. */}
      </div>
    </>
  );
};
```

### Dodanie Mikro-Interakcji do Przycisków

**Plik: `src/components/ui/button.tsx`**

```tsx
import { motion } from 'framer-motion';

// Wariant z mikro-interakcją
export const AnimatedButton = ({ children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    {...props}
  >
    {children}
  </motion.button>
);
```

### Dodanie Efektów Wejścia do Sekcji

**Użycie w dowolnym komponencie:**

```tsx
import { motion } from 'framer-motion';

const SectionWithEntrance = () => (
  <motion.section
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ 
      type: "spring",
      stiffness: 100,
      damping: 15 
    }}
  >
    {/* Zawartość sekcji */}
  </motion.section>
);
```

---

## Paleta Kolorów

Wszystkie efekty używają kolorów zdefiniowanych w projekcie:

| Nazwa | HSL | HEX | Użycie |
|-------|-----|-----|--------|
| Primary | `hsl(186, 88%, 44%)` | `#13b8c4` | Turkus/cyjan - akcenty |
| Gold | `hsl(45, 55%, 52%)` | `#c9a227` | Złoty - nagłówki, badge |
| Gold Light | `hsl(45, 65%, 62%)` | `#d8b352` | Jasny złoty - hover |
| Background | `hsl(222, 47%, 6%)` | `#0d1117` | Ciemny navy - tło |
| Card | `hsl(222, 47%, 9%)` | `#141b23` | Karty |
| Border | `hsl(222, 47%, 18%)` | `#21262d` | Obramowania |
| Muted | `hsl(215, 20%, 65%)` | `#8b949e` | Wyciszony tekst |

---

## Wymagane Zależności

```bash
npm install framer-motion @react-three/fiber @react-three/drei three lucide-react
```

**package.json** - upewnij się, że masz:
```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.160.x",
    "lucide-react": "^0.x"
  }
}
```

---

## Routing

Upewnij się, że w routingu masz ścieżki:

```tsx
// src/App.tsx lub router config
import { HomePage } from '@/pages/HomePage';
import { ChampionsGallery } from '@/pages/ChampionsGallery';

// Routes:
// "/" - HomePage z Karuzelą 3D
// "/champions" - Galeria Championów
```

---

## Optymalizacja Wydajności

### Canvas Performance
- `ParticleBackground` używa `requestAnimationFrame` z cleanup
- Karuzela 3D ma `dpr={[1, 2]}` i `performance={{ min: 0.5 }}`

### Lazy Loading
Można dodać lazy loading dla ciężkich komponentów:

```tsx
import { lazy, Suspense } from 'react';

const Carousel3D = lazy(() => import('@/components/gallery/Carousel3D'));

// Użycie:
<Suspense fallback={<div>Loading...</div>}>
  <Carousel3D />
</Suspense>
```

### Reduced Motion
Komponenty respektują `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Struktura Plików

```
src/
├── components/
│   └── gallery/
│       ├── Carousel3D.tsx      # Karuzela 3D
│       ├── ChampionCard.tsx    # Karta championa
│       ├── ParticleBackground.tsx # Tło z cząsteczkami
│       ├── shaders.ts          # Shadery GLSL
│       └── index.ts            # Eksporty
├── hooks/
│   └── useEtherealEffects.ts   # Hook z efektami
├── pages/
│   ├── HomePage.tsx            # Strona główna
│   └── ChampionsGallery.tsx    # Galeria
└── data/
    └── champions.ts            # Dane championów
```

---

## Testowanie

Po integracji uruchom projekt:

```bash
npm run dev
```

Sprawdź:
1. ✅ Strona główna wyświetla karuzelę 3D
2. ✅ Cząsteczki animują się w tle
3. ✅ Kolory są zgodne z paletą (gold/primary/navy)
4. ✅ Hover effects działają na kartach
5. ✅ Nawigacja do `/champions` działa
6. ✅ Modal ze szczegółami otwiera się

---

## Troubleshooting

### Three.js nie renderuje się
- Sprawdź czy Canvas ma określoną wysokość
- Upewnij się, że `@react-three/fiber` jest poprawnie zainstalowany

### Cząsteczki nie są widoczne
- Sprawdź z-index komponentów
- Upewnij się, że canvas ma `pointer-events: none`

### Kolory są nieprawidłowe
- Sprawdź czy CSS variables są zdefiniowane w `:root`
- Upewnij się, że używasz klas Tailwind z palety projektu

---

## Autor

Integracja przeprowadzona w ramach fuzji projektów `ethereal-canvas` + `champion-pigeon-auctions`.
