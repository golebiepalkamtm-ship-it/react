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
      title: "§ 1. Postanowienia ogólne i warunki udziału",
      icon: <FileText className="w-6 h-6 text-gold" />,
      content: [
        "Niniejszy Regulamin określa zasady korzystania z serwisu internetowego działającego pod adresem palkamtm.pl, zwanego dalej „Serwisem”.",
        "Właścicielem Serwisu jest MTM Pałka z siedzibą w Lubań, ul. Stawowa 6, 59-800 Lubań, NIP: [wpisz NIP], zwany dalej „Właścicielem” lub „Serwisem”.",
        "Moduł aukcyjny stanowi zaawansowaną platformę teleinformatyczną umożliwiającą licytację oraz bezpośredni zakup okazów hodowlanych, suplementów oraz akcesoriów (obrót B2B).",
        "Każdy Użytkownik rejestrujący konto zobowiązany jest do ukończenia 18 roku życia, podania prawdziwych danych profilowych oraz pełnej akceptacji niniejszego Regulaminu.",
      ],
    },
    {
      id: "buyer-rules",
      title: "§ 2. Warunki dla Kupujących i Licytujących",
      icon: <Gavel className="w-6 h-6 text-gold" />,
      content: [
        "1. Rejestracja i Weryfikacja: Udział w licytacji wymaga aktywnego konta o stanie niezablokowanym (status ACTIVE).",
        "2. Wiążący Charakter Ofert: Złożenie oferty w licytacji (tzw. postąpienie) lub skorzystanie z opcji 'Kup Teraz' jest prawnie wiążącym oświadczeniem woli. Oferty nie mogą być cofane przez licytanta.",
        "3. Zakaz Self-Bidding: Sprzedawca nie ma prawa licytować własnych aukcji bezpośrednio ani za pośrednictwem osób trzecich.",
        "4. Terminowość Płatności: Zwycięzca aukcji lub kupujący zobowiązany jest do uregulowania pełnej kwoty zakupu za pośrednictwem zintegrowanego systemu Stripe w terminie do 48 godzin od zakończenia aukcji.",
      ],
    },
    {
      id: "seller-rules",
      title: "§ 3. Warunki dla Wystawiających Aukcje (Sprzedawców)",
      icon: <ShieldCheck className="w-6 h-6 text-gold" />,
      content: [
        "1. Opłata Wystawieniowa (Listing Fee): Wystawienie nowej aukcji w serwisie wiąże się z jednorazową opłatą wstępną w wysokości 20,00 PLN (z wyłączeniem kont o uprawnieniach Administratora). Aukcja staje się widoczna dla licytujących natychmiast po zaksięgowaniu opłaty.",
        "2. Prowizja od Sprzedaży: Od każdej pomyślnie zakończonej aukcji lub zakupu Kup Teraz pobierana jest prowizja serwisu w wysokości 10% kwoty wygranej.",
        "3. Zgodność przedmiotu aukcji: Sprzedawca gwarantuje rzetelność opisu, stanu zdrowotnego, rodowodu oraz dołączonych fotografii.",
        "4. Zakaz Ochodzenia Platformy (Anti-Circumvention): Zabrania się umieszczania w opisach, nagłówkach lub wiadomościach numerów telefonów, adresów email oraz danych służących do finalizacji transakcji poza serwisem.",
      ],
    },
    {
      id: "payments",
      title: "§ 4. Płatności, Bezpieczeństwo i Stripe",
      icon: <ShieldCheck className="w-6 h-6 text-gold" />,
      content: [
        "Płatności za opłaty wstępne, wygrane aukcje oraz prowizje realizowane są za pośrednictwem szyfrowanego operatora Stripe.",
        "Wydanie lub wysyłka gołębia/towaru następuje po zaksięgowaniu pełnej kwoty na rachunku bankowym lub w panelu Stripe.",
        "W przypadku wycofania płatności (chargeback) lub braku wpłaty w terminie, transakcja zostaje anulowana, a konto Kupującego może zostać zablokowane.",
      ],
    },
    {
      id: "liability",
      title: "§ 5. Wyłączenie rękojmi i odpowiedzialność B2B",
      icon: <Scale className="w-6 h-6 text-gold" />,
      content: [
        "Zgodnie z art. 558 § 1 Kodeksu cywilnego, Strony całkowicie wyłączają odpowiedzialność Właściciela z tytułu rękojmi za wady fizyczne i prawne sprzedawanych okazów w transakcjach B2B.",
        "Właściciel Serwisu nie ponosi odpowiedzialności za przyszłe wyniki lotowe, sukcesy rozpłodowe ani opóźnienia wynikające z transportu kurierskiego organizowanego przez Kupującego.",
      ],
    },
    {
      id: "final",
      title: "§ 6. Postanowienia końcowe",
      icon: <FileText className="w-6 h-6 text-gold" />,
      content: [
        "Wszelkie spory wynikające z funkcjonowania Serwisu lub zawartych umów sprzedaży będą rozstrzygane przez sąd powszechny właściwy dla siedziby Właściciela Serwisu.",
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
