import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Eye, Share2, UserCheck, Cookie } from "lucide-react";

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "administrator",
      title: "§ 1. Administrator Danych Osobowych",
      icon: <Shield className="w-6 h-6 text-gold" />,
      content: [
        'Administratorem danych osobowych zbieranych za pośrednictwem serwisu palkamtm.pl jest MTM Pałka, adres: ul. Stawowa 6, 59-800 Lubań, e-mail: kontakt@palkamtm.pl (dalej: "Administrator").',
      ],
    },
    {
      id: "purpose",
      title: "§ 2. Cel i podstawy przetwarzania danych",
      icon: <Eye className="w-6 h-6 text-gold" />,
      content: [
        "Dane osobowe Użytkowników przetwarzane są wyłącznie w niezbędnym zakresie do:",
        "1. Świadczenia usług drogą elektroniczną, w tym prowadzenia konta Użytkownika i obsługi modułu aukcyjnego (na podstawie art. 6 ust. 1 lit. b RODO - realizacja umowy).",
        "2. Obsługi procesu płatności i wysyłki wylicytowanych gołębi.",
        "3. Wypełnienia obowiązków prawnych, w tym podatkowych, rachunkowych oraz wynikających z przepisów weterynaryjnych (art. 6 ust. 1 lit. c RODO).",
        "4. Ewentualnego ustalenia, dochodzenia lub obrony przed roszczeniami, co stanowi prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO).",
      ],
    },
    {
      id: "sharing",
      title:
        "§ 3. Udostępnianie danych podmiotom trzecim i zrzeczenie się odpowiedzialności",
      icon: <Share2 className="w-6 h-6 text-gold" />,
      content: [
        "W celu realizacji umowy Administrator może przekazywać niezbędne dane Użytkownika podmiotom trzecim, w szczególności:",
        "a) Operatorowi płatności – firmie Stripe, w celu procesowania transakcji.",
        "b) Firmom kurierskim zajmującym się transportem żywych zwierząt.",
        "Operator płatności Stripe posiada własną politykę prywatności. Administrator nie ponosi żadnej odpowiedzialności za sposób gromadzenia, przetwarzania i zabezpieczania danych (w tym danych finansowych) przez firmę Stripe.",
        "Administrator stosuje adekwatne środki techniczne w celu ochrony danych, jednak z uwagi na specyfikę sieci Internet, wyłącza swoją odpowiedzialność za kradzież danych w wyniku zaawansowanych ataków cybernetycznych (hakerskich), złośliwego oprogramowania na urządzeniu Użytkownika lub działań siły wyższej, na które nie miał wpływu. Użytkownik korzysta z Serwisu na własne ryzyko.",
      ],
    },
    {
      id: "rights",
      title: "§ 4. Prawa Użytkownika",
      icon: <UserCheck className="w-6 h-6 text-gold" />,
      content: [
        "Użytkownikowi przysługuje prawo dostępu do treści swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz prawo do przenoszenia danych.",
        'Prawo do usunięcia danych ("bycia zapomnianym") może zostać ograniczone przez Administratora w sytuacji, gdy dalsze przetwarzanie jest niezbędne do wywiązania się z obowiązku prawnego (np. faktury) lub do obrony przed roszczeniami (np. ewidencja sprzedanych ptaków).',
        "Podanie danych osobowych jest dobrowolne, ale niezbędne do założenia konta i brania udziału w aukcjach.",
        "Użytkownik ponosi wyłączną odpowiedzialność za podanie nieprawdziwych, niepełnych lub cudzych danych osobowych.",
      ],
    },
    {
      id: "cookies",
      title: "§ 5. Pliki Cookies (Ciasteczka)",
      icon: <Cookie className="w-6 h-6 text-gold" />,
      content: [
        "Serwis wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania strony (utrzymanie sesji logowania, funkcjonowanie modułu aukcyjnego) oraz w celach technicznych wymaganych przez integrację z systemem Stripe.",
        "Użytkownik może samodzielnie zarządzać plikami cookies z poziomu ustawień swojej przeglądarki internetowej.",
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
              <span className="heading-black">Polityka</span>{" "}
              <span className="gold-heading">Prywatności</span>
            </h1>
            <div className="h-1 w-24 bg-gold mx-auto rounded-full mb-8 shadow-[0_0_15px_rgba(166,142,78,0.5)]" />
            <p className="text-zinc-400 text-lg md:text-xl uppercase tracking-[0.2em] font-medium">
              I KLAUZULA RODO
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

export default PrivacyPage;
