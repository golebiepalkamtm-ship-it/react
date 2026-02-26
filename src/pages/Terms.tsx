import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Scale, Gavel } from "lucide-react";

const TermsPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "general",
      title: "§ 1. Postanowienia ogólne",
      icon: <FileText className="w-6 h-6 text-gold" />,
      content: [
        "Niniejszy Regulamin określa zasady korzystania z serwisu internetowego działającego pod adresem palkamtm.pl, zwanego dalej „Serwisem”.",
        "Właścicielem Serwisu jest MTM Pałka z siedzibą w Lubań, ul. Stawowa 6, 59-800 Lubań, NIP: [wpisz NIP], zwany dalej „Właścicielem” lub „Sprzedającym”.",
        "Serwis ma charakter przede wszystkim informacyjno-reklamowy. Stanowi on wirtualny katalog własnej hodowli Właściciela.",
        "Udostępniony w Serwisie moduł aukcyjny jest wyłącznie narzędziem teleinformatycznym ułatwiającym zawarcie umowy sprzedaży na odległość.",
        "Serwis skierowany jest wyłącznie do osób prowadzących działalność gospodarczą, rolniczą lub zawodową działalność hodowlaną. Rejestracja w Serwisie i udział w aukcjach oznacza oświadczenie Użytkownika, że dokonuje zakupu w celach związanych z jego zawodową lub gospodarczą działalnością hodowlaną (obrót B2B).",
      ],
    },
    {
      id: "bidding",
      title: "§ 2. Zasady licytacji i zawarcie umowy",
      icon: <Gavel className="w-6 h-6 text-gold" />,
      content: [
        "Udział w aukcji wymaga rejestracji konta i akceptacji niniejszego Regulaminu.",
        "Złożenie oferty w licytacji (tzw. postąpienie) jest prawnie wiążące i nie może zostać cofnięte przez licytanta.",
        "Umowa sprzedaży zostaje zawarta z chwilą zakończenia aukcji, pomiędzy Właścicielem a licytantem, który zaoferował najwyższą kwotę (Zwycięzca Aukcji).",
        "Właściciel Serwisu zastrzega sobie bezwzględne prawo do odwołania aukcji w dowolnym momencie, usunięcia ofert lub zablokowania konta Użytkownika bez podania przyczyny i bez ponoszenia z tego tytułu jakiejkolwiek odpowiedzialności odszkodowawczej.",
      ],
    },
    {
      id: "payments",
      title: "§ 3. Płatności i obsługa Stripe",
      icon: <ShieldCheck className="w-6 h-6 text-gold" />,
      content: [
        "Płatności za wygrane aukcje realizowane są za pośrednictwem zewnętrznego operatora płatności – systemu Stripe.",
        "Właściciel Serwisu nie przetwarza danych kart płatniczych i nie ponosi żadnej odpowiedzialności za przerwy w działaniu systemu Stripe, błędy autoryzacji, opóźnienia w księgowaniu środków czy blokady nałożone przez bank Użytkownika.",
        "Wydanie lub wysyłka gołębia następuje wyłącznie po faktycznym zaksięgowaniu pełnej kwoty zakupu na rachunku bankowym Właściciela Serwisu (a nie w momencie zainicjowania płatności w systemie Stripe).",
        "W przypadku cofnięcia płatności (chargeback) lub zablokowania transakcji przez Stripe, umowa sprzedaży uważana jest za nieważną z winy Kupującego, a Właścicielowi przysługuje prawo zachowania ptaka oraz dochodzenia odszkodowania.",
      ],
    },
    {
      id: "liability",
      title: "§ 4. Wyłączenie rękojmi i ograniczenie odpowiedzialności",
      icon: <Scale className="w-6 h-6 text-gold" />,
      content: [
        "Zgodnie z art. 558 § 1 Kodeksu cywilnego, Strony całkowicie wyłączają odpowiedzialność Właściciela z tytułu rękojmi za wady fizyczne i prawne sprzedawanych gołębi.",
        "Właściciel Serwisu dokłada starań, aby opisy, zdjęcia i rodowody były zgodne ze stanem faktycznym w dniu wystawienia aukcji. Jednakże, ze względu na naturę żywych organizmów, Właściciel nie udziela żadnej gwarancji na:",
        "a) przyszłe wyniki lotowe i sportowe gołębia,",
        "b) zdolności rozpłodowe, płodność i jakość potomstwa,",
        "c) ukryte wady genetyczne lub choroby, które ujawnią się po opuszczeniu hodowli Właściciela.",
        "Właściciel nie ponosi odpowiedzialności za przerwy w funkcjonowaniu Serwisu (awarie serwerów, ataki hakerskie, siła wyższa), które mogą wpłynąć na przebieg aukcji.",
      ],
    },
    {
      id: "transport",
      title: "§ 5. Transport, przejście ryzyka i brak zwrotów",
      icon: <FileText className="w-6 h-6 text-gold" />,
      content: [
        "Organizacja i koszty transportu leżą po stronie Kupującego, chyba że opis aukcji stanowi inaczej.",
        "Przejście ryzyka: Z chwilą wydania gołębia Kupującemu osobiście lub powierzenia go profesjonalnemu przewoźnikowi (kurierowi), na Kupującego przechodzą wszelkie korzyści i ciężary związane z gołębiem oraz niebezpieczeństwo jego przypadkowej utraty, ucieczki, zachorowania, urazu lub śmierci (zgodnie z art. 548 § 1 Kodeksu cywilnego). Właściciel nie odpowiada za błędy i opóźnienia firm kurierskich.",
        "Brak zwrotów: Ze względów weterynaryjnych, sanitarnych oraz z uwagi na bioasekurację hodowli Właściciela, raz zakupiony i wydany gołąb nie podlega zwrotowi ani wymianie pod żadnym pozorem.",
      ],
    },
    {
      id: "final",
      title: "§ 6. Postanowienia końcowe",
      icon: <ShieldCheck className="w-6 h-6 text-gold" />,
      content: [
        "Wszelkie spory wynikające z funkcjonowania Serwisu lub zawartych umów sprzedaży będą rozstrzygane wyłącznie przez sąd powszechny właściwy miejscowo dla siedziby Właściciela Serwisu.",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent relative overflow-hidden">
      <Header />

      <main className="flex-1 pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              <span className="heading-black">Regulamin</span>{" "}
              <span className="gold-heading">Serwisu</span>
            </h1>
            <div className="h-1 w-24 bg-gold mx-auto rounded-full mb-8 shadow-[0_0_15px_rgba(166,142,78,0.5)]" />
            <p className="text-zinc-400 text-lg md:text-xl uppercase tracking-[0.2em] font-medium">
              PALKAMTM.PL
            </p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative p-8 md:p-10 rounded-2xl border border-[#A68E4E]/30 bg-champion-teal shadow-[0_12px_40px_-5px_rgba(0,0,0,0.5)] overflow-hidden group"
              >
                {/* Visual accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 shadow-inner">
                    {section.icon}
                  </div>
                  <h2 className="font-display text-2xl md:text-2xl font-bold text-[#A68E4E]">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4 relative z-10">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-zinc-300 leading-relaxed text-base md:text-lg font-light tracking-wide"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center"
          >
            <p className="text-zinc-500 text-sm">
              Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
