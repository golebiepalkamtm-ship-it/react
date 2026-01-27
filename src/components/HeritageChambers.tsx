import { useEffect, useMemo, useRef } from "react";
import { achievementsHistory } from "@/data/achievements-history";
import "./HeritageChambers.css";

type Chamber = {
  year: number;
  title: string;
  achievements: string[];
  trophyCount: number;
};

const TrophyIcon = () => (
  <svg
    className="trophy-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const FooterTrophy = () => (
  <svg
    className="footer-trophy"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

const HeritageChambers = () => {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  const chambersData = useMemo<Chamber[]>(() => {
    const fromHistory = achievementsHistory.map<Chamber>((season) => {
      const yearNum = Number(season.year);
      const achievementsStrings = season.achievements.map((a) => {
        const pts = a.points !== "-" ? `${a.points} pkt` : "";
        const cnt = a.count !== "-" ? `${a.count} con` : "";
        const meta = [pts, cnt].filter(Boolean).join(", ");
        return `${a.region} – ${a.category}: ${a.position}${meta ? ` (${meta})` : ""}`;
      });
      return {
        year: yearNum,
        title: `Sezon ${season.year}`,
        achievements: achievementsStrings,
        trophyCount: season.achievements.length,
      };
    });

    return fromHistory.sort((a, b) => b.year - a.year);
  }, []);

  const totalTrophies = useMemo(
    () => chambersData.reduce((acc, c) => acc + c.trophyCount, 0),
    [chambersData]
  );

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(centerY - windowHeight / 2);
        const maxDistance = windowHeight / 2;
        const proximity = 1 - Math.min(distanceFromCenter / maxDistance, 1);

        const opacity = 0.3 + proximity * 0.7;
        const scale = 0.85 + proximity * 0.15;
        const blur = (1 - proximity) * 8;

        card.style.opacity = `${opacity}`;
        card.style.transform = `scale(${scale})`;
        card.style.filter = `blur(${blur}px)`;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.style.opacity = "1";
    };

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="heritage-root">
      <div className="heritage-background" />
      <div className="heritage-noise" />
      <div className="heritage-cursor" ref={cursorRef} />

      <header>
        <div className="header-line">
          <div className="divider" />
          <span>Est. 2001 • Heritage Archive</span>
        </div>
        <h1>
          <span className="line1">Komory</span>
          <span className="line2">Pamięci</span>
        </h1>
        <p className="subtitle">
          Dwadzieścia cztery lata mistrzowskiej hodowli. Każda komora przechowuje
          wspomnienia triumfów, które ukształtowały legendę Pałka MTM.
        </p>
      </header>

      <div className="chambers-container">
        <div className="cards-shell">
          <div className="glass-bubble b1" />
          <div className="glass-bubble b2" />
          {chambersData.map((chamber, index) => {
            const trophies = Array.from({
              length: Math.min(chamber.trophyCount, 5),
            }).map((_, i) => <TrophyIcon key={`t${index}-${i}`} />);
            const extraCount =
              chamber.trophyCount > 5 ? (
                <span className="trophy-count">
                  +{chamber.trophyCount - 5}
                </span>
              ) : null;
            const rotation = index % 2 === 0 ? "-2deg" : "2deg";
            const translation = index % 2 === 0 ? "-5%" : "5%";

            return (
              <div
                className="chamber-card"
                key={chamber.year}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
              >
                <div className="chamber-wrapper">
                  <div
                    className="bg-year"
                    style={{
                      transform: `translateX(-50%) translateY(${translation}) rotate(${rotation})`,
                    }}
                  >
                    {chamber.year}
                  </div>
                  <div className="chamber-content">
                    <div className="corner-decoration">
                      <div className="corner-fill" />
                    </div>
                    <div className="chamber-inner">
                      <div className="chamber-header">
                        <div className="year-display">
                          <span className="year-number">{chamber.year}</span>
                          <div className="trophy-icons">
                            {trophies}
                            {extraCount}
                          </div>
                        </div>
                        <div className="stats-display">
                          <div className="big-number">{chamber.trophyCount}</div>
                          <div className="stats-label">Osiągnięć</div>
                        </div>
                      </div>

                      <div className="title-section">
                        <h2>{chamber.title}</h2>
                      </div>

                      <div className="achievements-section">
                        <div className="section-divider">
                          <span>Kronika Zwycięstw</span>
                          <div className="line" />
                        </div>
                        <div className="achievements-list">
                          {chamber.achievements.map((ach, i) => (
                            <div className="achievement-item" key={i}>
                              <div className="achievement-bullet" />
                              <p className="achievement-text">{ach}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer>
        <div className="footer-content">
          <div className="footer-stats">
            <FooterTrophy />
            <div className="footer-number">
              <div className="number">{totalTrophies}</div>
              <div className="label">Osiągnięć Łącznie</div>
            </div>
          </div>
          <p className="footer-text">
            Każde trofeum to historia pasji, dedykacji i mistrzostwa
            przekazywanego z pokolenia na pokolenie. Tradycja Pałka MTM trwa
            nieprzerwanie od 2001 roku.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HeritageChambers;
