# Champion Pigeon – Style Guide (aktualny wzór)

## Główne zasady
 - Kolorystyka nagłówków: czarno‑złota (bez wyjątków).
 - Złoty akcent: #A68E4E (spójny na całej stronie).
 - Tła sekcji i stopki: „champion‑teal” (ciemny morski gradient z subtelnym radialem).
 - Zero poświat, blendów i overlayów wpływających na czytelność nagłówków.
 - Brak splitowania nagłówków na znaki/słowa – stały, klarowny tekst.

## Paleta kolorów
 - Gold (akcent): #A68E4E
 - Black (nagłówki/czerń): #000000
 - Teal (tło kart/stopki): 
   - radial: rgba(66, 192, 206, 0.18) u góry
   - linear 185deg: rgba(2,10,19,0.96) → rgba(6,35,46,0.93) → rgba(9,61,77,0.9)
 - Biały tekst na ciemnym tle: #FFFFFF (ostrożnie, nagłówki nie używają białego)

## Klasy i tokeny (użycie obowiązkowe)
 - gold-heading – złoty akcent tekstu (posiada !important): [index.css](../src/index.css)
 - heading-black – mocny czarny bez blend/poświat: [index.css](../src/index.css)
 - bg-champion-teal – tło kart i stopki: [index.css](../src/index.css)

## Nagłówki sekcji (wzór czarno‑złoty)
 - Struktura: 
   - pierwsza część czarna (heading-black)
   - druga część złota (gold-heading)
 - Bez text-shadow, mix-blend-mode i overlayów nad h1/h2/h3.
 - Przykłady:
   - O Hodowli: heading-black + gold-heading: [AboutSection.tsx](../src/components/AboutSection.tsx)
   - Media (homepage): heading-black + gold-heading: [PressSection.tsx](../src/components/PressSection.tsx)
   - Prasa (strona): heading-black + gold-heading: [Press.tsx](../src/pages/Press.tsx)
   - Kontakt: heading-black + gold-heading: [ContactSection.tsx](../src/components/ContactSection.tsx)

## Hero (wzór)
 - Homepage:
   - Pałka – czarne (heading-black)
   - MTM – złote (gold-heading)
   - „— Geny Zwycięzców” – złote (gold-heading)
   - Źródło: [Index.tsx](../src/pages/Index.tsx)
 - Home Premium:
   - podtytuł „— Geny Zwycięzców” – złote (gold-heading, nadrzędne nad hero-subtitle)
   - tekst „Trzy pokolenia pasji. Setki mistrzostw.” – czarny (heading-black)
   - Źródło: [HomePagePremium.tsx](../src/pages/HomePagePremium.tsx)

## Stopka (Footer)
 - Tło: bg-champion-teal (spójne z kartami).
 - Złoty pasek na górze stopki:
   - gradient: from-[#A68E4E]/70 → transparent (blur i poświata nad paskiem)
   - pasek: bg-[#A68E4E] (z poświatą rgba(166,142,78,1/0.4))
   - Źródło: [Footer.tsx](../src/components/Footer.tsx), wymuszenie: [emergency-fix.css](../src/styles/emergency-fix.css)

## Karty (Champions/aukcje)
 - Zalecane tło: bg-champion-teal lub odpowiednik kartowy (#010509 + złote linie).
 - Złote linie krawędziowe i delikatna poświata akcentują premium charakter.
 - Przykład: [ChampionCard.tsx](../src/components/gallery/ChampionCard.tsx)

## Tła i overlaye
 - Overlaye nie mogą być nad nagłówkami.
 - Subtelne gradienty dopuszczalne, ale nie przyciemniają nagłówków.
 - Usuwamy elementy typu bg-gradient-to-* nad tytułami sekcji (Press/Kontakt itp.).

## Animacje
 - GSAP/Framer Motion nie zmienia koloru nagłówków.
 - Nie ukrywać nagłówków podczas scrolla (opacity/y muszą startować jako widoczne).
 - Brak data-split i podobnych zabiegów na tytułach sekcji.

## Checklist przed wdrożeniem sekcji
 - Nagłówek: heading-black + gold-heading.
 - Brak overlayu nad nagłówkiem.
 - Złote akcenty (#A68E4E) są spójne.
 - Tło sekcji nie obniża czytelności.
 - Animacje nie modyfikują kolorów ani widoczności nagłówka.

## Szybkie przykłady użycia
 - Nagłówek sekcji:
   - `<h2><span class="heading-black">Czarna część</span> <span class="gold-heading">Złota część</span></h2>`
 - Podtytuł hero (gold):
   - `<span class="gold-heading">— Geny Zwycięzców</span>`
 - Stopka (gold stripe):
   - górny pasek: `bg-[#A68E4E]` + poświata; overlay gradient: `from-[#A68E4E]/70`

## Odwołania do kodu
 - gold-heading / heading-black / bg-champion-teal: [index.css](../src/index.css)
 - O Hodowli: [AboutSection.tsx](../src/components/AboutSection.tsx)
 - Media (homepage): [PressSection.tsx](../src/components/PressSection.tsx)
 - Prasa (strona): [Press.tsx](../src/pages/Press.tsx)
 - Kontakt: [ContactSection.tsx](../src/components/ContactSection.tsx)
 - Hero: [Index.tsx](../src/pages/Index.tsx), [HomePagePremium.tsx](../src/pages/HomePagePremium.tsx)
