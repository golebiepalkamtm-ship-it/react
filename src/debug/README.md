# GSAP Animation Diagnostic Tool

## 🔍 Automatyczne uruchomienie

Skrypt diagnostyczny uruchamia się **automatycznie** 2 sekundy po załadowaniu strony głównej (`/`).

## 🎯 Ręczne uruchomienie

### Metoda 1: Skrót klawiszowy
Naciśnij **Ctrl+Shift+G** aby uruchomić diagnostykę w dowolnym momencie.

### Metoda 2: Konsola DevTools
```javascript
runGSAPDiagnostic()
```

### Metoda 3: Odśwież stronę
Po odświeżeniu strony głównej diagnostyka uruchomi się automatycznie po 2 sekundach.

## 📊 Co sprawdza diagnostyka?

1. **Environment Check**
   - Czy Reduced Motion jest włączony
   - Tryb dev/production
   - Rozmiar viewportu i pozycja scrolla

2. **Element Existence Check**
   - Czy sekcja AboutSection istnieje
   - Czy elementy (leftContent, cards) są znalezione
   - Pozycja sekcji na stronie

3. **Computed Styles Check**
   - **KLUCZOWE:** opacity elementów (powinno być 0)
   - Transform values
   - Visibility, display, willChange

4. **Inline Styles Check**
   - Czy GSAP ustawia inline styles
   - Czy są konflikty z innymi inline styles

5. **CSS Classes Check**
   - Jakie klasy mają elementy
   - Czy są konflikty z Tailwind/custom CSS

6. **GSAP Global State**
   - Wersja GSAP
   - Liczba aktywnych animacji
   - Konfiguracja GSAP

7. **ScrollTrigger State**
   - Liczba ScrollTriggers
   - **KLUCZOWE:** Progress AboutSection triggera
   - Pozycje start/end triggerów

8. **Framer Motion Conflict Check**
   - Czy są atrybuty Framer Motion na elementach
   - Czy są style variables Framer Motion

9. **CSS Specificity Check**
   - Czy można ustawić inline opacity
   - Test nadpisywania stylów

10. **CSS Animations/Transitions Check**
    - Czy są CSS animations konfliktujące
    - Czy są CSS transitions

11. **Lenis Smooth Scroll Check**
    - Czy Lenis jest zainicjalizowany
    - Czy scroll behavior jest ustawiony

12. **Summary & Recommendations**
    - Lista znalezionych problemów
    - Konkretne rekomendacje naprawy

## 📋 Wynik diagnostyki

Pełny raport jest zapisany w:
```javascript
window.__gsapDiagnostic
```

Możesz go obejrzeć w konsoli:
```javascript
console.log(window.__gsapDiagnostic)
```

## 🐛 Najczęstsze problemy i rozwiązania

### Problem 1: `leftOpacity` !== "0"
**Przyczyna:** `gsap.set()` nie działa lub jest nadpisywany  
**Rozwiązanie:** Sprawdź CSS specificity, usuń konflikty z Tailwind

### Problem 2: `aboutTrigger.progress > 0`
**Przyczyna:** Animacja już się wykonała (trigger był spełniony przy ładowaniu)  
**Rozwiązanie:** 
```javascript
window.scrollTo(0, 0); 
location.reload();
```

### Problem 3: `reducedMotion: true`
**Przyczyna:** Windows Reduced Motion włączony  
**Rozwiązanie:** 
- Windows Settings → Ease of Access → Display
- "Show animations in Windows" → ON

### Problem 4: `No ScrollTriggers found`
**Przyczyna:** ScrollTriggers nie są tworzone  
**Rozwiązanie:** Sprawdź czy AboutSection.tsx jest zaimportowany i renderowany

### Problem 5: `Framer Motion detected`
**Przyczyna:** Konflikt między Framer Motion a GSAP  
**Rozwiązanie:** Usuń `motion.div` z komponentów animowanych przez GSAP

## 🔧 Debug mode

Włącz dodatkowe logi w AboutSection:
- Logi są już włączone jeśli widzisz markery ScrollTrigger na stronie
- Wyłącz markery ustawiając `markers: false` w `AboutSection.tsx:133`

## 📞 Support

Jeśli diagnostyka pokazuje problem którego nie rozumiesz:
1. Skopiuj CAŁĄ zawartość `window.__gsapDiagnostic`
2. Zrób screenshot strony z markerami
3. Prześlij te dane do developera
