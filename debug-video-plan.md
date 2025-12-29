# Plan naprawy problemu z wideo gołębia

## Status: Zidentyfikowany problem z wideo

### Znalezione pliki wideo:
- ✅ `pigeon-tlo-Picsart-BackgroundRemover.mp4` (916,920 bajtów) - używany w kodzie
- ✅ `pigeon-tlo.mp4` (1,587,519 bajtów) - alternatywny plik

### Potencjalne problemy:
1. **Problem z autoodtwarzaniem** - przeglądarki blokują autoodtwarzanie wideo
2. **Problem z formatem wideo** - może być niekompatybilny
3. **Problem z framer-motion** - może wpływać na odtwarzanie
4. **Problem z preload** - może nie działać poprawnie

## Plan naprawy:

### Kroki do wykonania:
- [ ] 1. Sprawdzić czy wideo odtwarza się bezpośrednio w przeglądarce
- [ ] 2. Zmienić konfigurację wideo (usunąć motion.video, użyć zwykłego video)
- [ ] 3. Dodać obsługę błędów odtwarzania wideo
- [ ] 4. Dodać fallback (obraz/gif) gdy wideo nie działa
- [ ] 5. Przetestować odtwarzanie na różnych przeglądarkach
- [ ] 6. Zweryfikować poprawę

### Rozwiązania do przetestowania:
1. **Zamiana na zwykły element video** bez framer-motion
2. **Dodanie obsługi błędów** i fallback
3. **Optymalizacja preload** i autoplay
4. **Dodanie kontrolek** dla debugowania
5. **Fallback do gif** gdy video nie działa
