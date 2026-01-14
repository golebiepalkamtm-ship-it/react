import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/all';
import './AnimatedSections.css';

gsap.registerPlugin(Observer);

interface SectionData {
  title: string;
  className: string;
  bgImage?: string;
}

const sectionsData: SectionData[] = [
  { title: "Przewijaj w dół", className: "first" },
  { title: "Animacje GSAP", className: "second" },
  { title: "Champion Pigeon", className: "third" },
  { title: "Platforma Aukcyjna", className: "fourth" },
  { title: "Ekskluzywne Gołębie", className: "fifth" }
];

const AnimatedSections: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const outerWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const headingsRef = useRef<(HTMLHeadingElement | null)[]>([]);
  
  const currentIndex = useRef(-1);
  const animating = useRef(false);

  useEffect(() => {
    const sections = sectionsRef.current.filter((el): el is HTMLDivElement => el !== null);
    const outerWrappers = outerWrappersRef.current.filter((el): el is HTMLDivElement => el !== null);
    const innerWrappers = innerWrappersRef.current.filter((el): el is HTMLDivElement => el !== null);
    const images = imagesRef.current.filter((el): el is HTMLDivElement => el !== null);
    const headings = headingsRef.current.filter((el): el is HTMLHeadingElement => el !== null);

    const wrap = gsap.utils.wrap(0, sections.length);

    // Initial setup
    gsap.set(outerWrappers, { yPercent: 100 });
    gsap.set(innerWrappers, { yPercent: -100 });

    const gotoSection = (index: number, direction: number) => {
      index = wrap(index);
      animating.current = true;
      const fromTop = direction === -1;
      const dFactor = fromTop ? -1 : 1;
      const tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power1.inOut" },
        onComplete: () => {
          animating.current = false;
        }
      });

      if (currentIndex.current >= 0) {
        gsap.set(sections[currentIndex.current], { zIndex: 0 });
        tl.to(images[currentIndex.current], { yPercent: -15 * dFactor })
          .set(sections[currentIndex.current], { autoAlpha: 0 });
      }

      gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
      
      tl.fromTo([outerWrappers[index], innerWrappers[index]], { 
        yPercent: (i) => i ? -100 * dFactor : 100 * dFactor
      }, { 
        yPercent: 0 
      }, 0)
      .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
      .fromTo(headings[index], { 
        autoAlpha: 0, 
        yPercent: 150 * dFactor
      }, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 1,
        ease: "power2",
      }, 0.2);

      currentIndex.current = index;
    };

    const observer = Observer.create({
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onDown: () => !animating.current && gotoSection(currentIndex.current - 1, -1),
      onUp: () => !animating.current && gotoSection(currentIndex.current + 1, 1),
      tolerance: 10,
      preventDefault: true
    });

    // Start with first section
    gotoSection(0, 1);

    return () => {
      observer.kill();
    };
  }, []);

  return (
    <div className="animated-sections-container" ref={containerRef}>
      <header className="animated-sections-header">
        <div className="text-xl font-bold text-gold">CHAMPION PIGEON</div>
        <div className="text-sm opacity-70">Scrolluj, aby odkryć</div>
      </header>

      {sectionsData.map((section, index) => (
        <section 
          key={index} 
          className={`animated-section ${section.className}`}
          ref={(el: HTMLDivElement | null) => { sectionsRef.current[index] = el; }}
        >
          <div className="outer" ref={(el: HTMLDivElement | null) => { outerWrappersRef.current[index] = el; }}>
            <div className="inner" ref={(el: HTMLDivElement | null) => { innerWrappersRef.current[index] = el; }}>
              <div className="bg" ref={(el: HTMLDivElement | null) => { imagesRef.current[index] = el; }}>
                <h2 className="section-heading" ref={(el: HTMLHeadingElement | null) => { headingsRef.current[index] = el; }}>
                  {section.title}
                </h2>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default AnimatedSections;
