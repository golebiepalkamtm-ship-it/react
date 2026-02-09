# 🚨 EMERGENCY FIX - Granat i Footer

## Problem:

- Brak granatu w tle
- Footer bez tekstu

## Rozwiązanie:

### 1. **emergency-fix.css** - Wymuszenie stylów z !important

- HTML: Granatowy gradient jako fallback
- BODY: Transparent (nie przykrywa)
- FOOTER: Ciemne tło + biały tekst

### 2. **GlobalParallaxBackground** - Zmiana z-index

- PRZED: `z-index: -50` (za wszystkim, niewidoczne)
- PO: `z-index: -10` (za treścią, ale widoczne)

### 3. **index.css** - Body transparent

- PRZED: `background-color: hsl(230, 50%, 8%)` (przykrywał granat)
- PO: `background: transparent` (nie przykrywa)

## Jak przetestować:

1. **HARD REFRESH** w przeglądarce:
   - Windows: `Ctrl + Shift + R` lub `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Sprawdź DevTools** (F12):
   - Zakładka "Elements"
   - Znajdź `<html>` - powinien mieć granatowy gradient
   - Znajdź `<footer id="footer">` - powinien mieć ciemne tło
   - Sprawdź czy style z `emergency-fix.css` są załadowane

3. **Jeśli nadal nie działa**:
   - Wyczyść cache przeglądarki
   - Sprawdź konsolę (F12) czy są błędy CSS
   - Zrestartuj serwer dev (`npm run dev`)

## Pliki zmienione:

- `src/styles/emergency-fix.css` (NOWY)
- `src/index.css` (dodany import)
- `src/components/GlobalParallaxBackground.tsx` (z-index: -10)

## Co powinno być widoczne:

✅ Granatowe tło na całej stronie
✅ Złote poświaty w różnych miejscach
✅ Footer z ciemnym tłem i białym tekstem
