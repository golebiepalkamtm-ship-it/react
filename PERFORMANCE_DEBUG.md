# Performance Debug - Forced Reflow Violations

## Problem
Setki "Forced reflow while executing JavaScript" violations mimo wyłączenia ScrollTrigger animations.

## Źródła forced reflow (po analizie):

### 1. **Lenis Smooth Scroll** - główne źródło
- `requestAnimationFrame` handler wywołuje layout calculations
- Każdy frame scroll powoduje forced reflow
- **Rozwiązanie**: Wyłączyć Lenis lub użyć natywnego scroll

### 2. **GSAP split-text animations**
- `splitTextToChars()` w Index.tsx manipuluje DOM
- Każdy char powoduje reflow podczas tworzenia
- **Rozwiązanie**: Usunąć split-text lub pre-renderować

### 3. **Framer Motion transforms**
- 166 elementów z transform
- Każdy transform może powodować layout shift
- **Rozwiązanie**: Użyć CSS transforms zamiast JS

### 4. **Custom cursor**
- `cursorRef` i `followerRef` aktualizują pozycję co frame
- **Rozwiązanie**: Użyć CSS cursor lub throttle updates

## Akcje do wykonania:

1. ✅ Wyłączyć Lenis (test natywnego scroll)
2. ⏳ Usunąć split-text animations z Hero
3. ⏳ Wyłączyć custom cursor
4. ⏳ Zredukować Framer Motion animations

## Test:
```javascript
// Wyłącz Lenis tymczasowo
window.lenis?.destroy()

// Sprawdź violations
// Powinno być znacznie mniej
```
