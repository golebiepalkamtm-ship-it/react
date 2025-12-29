import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ImageSlider.css';

type Slide = { src: string; title?: string; likes?: number };

interface Props {
  slides: Slide[];
  repeat?: boolean;
  noArrows?: boolean;
  noBullets?: boolean;
  initial?: number;
  showLikes?: boolean;
}

export default function ImageSlider({ slides, repeat = false, noArrows = false, noBullets = false, initial = 0, showLikes = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [slideCurrent, setSlideCurrent] = useState<number>(Math.max(0, Math.min(initial, slides.length - 1)));

  const slideTotal = Math.max(0, slides.length - 1);

  useEffect(() => {
    // initialize classes
    const container = containerRef.current;
    if (!container) return;
    const nodes = Array.from(container.querySelectorAll('.slider-single')) as HTMLElement[];
    nodes.forEach((n, i) => {
      n.classList.remove('preactivede','preactive','active','proactive','proactivede');
      // default state
      if (i === slideCurrent) n.classList.add('active');
      else if (i === (slideCurrent - 1 + nodes.length) % nodes.length) n.classList.add('preactive');
      else if (i === (slideCurrent + 1) % nodes.length) n.classList.add('proactive');
      else n.classList.add('proactivede');
    });
    updateVisibility(nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCurrent, slides.length]);

  const updateVisibility = (nodes: HTMLElement[]) => {
    if (repeat) return;
    // hide left/right arrows if at ends
    const left = containerRef.current?.querySelector('.slider-left') as HTMLElement | null;
    const right = containerRef.current?.querySelector('.slider-right') as HTMLElement | null;
    if (!left || !right) return;
    if (slideCurrent === 0) {
      left.classList.add('not-visible');
      right.classList.remove('not-visible');
    } else if (slideCurrent === slideTotal) {
      right.classList.add('not-visible');
      left.classList.remove('not-visible');
    } else {
      left.classList.remove('not-visible');
      right.classList.remove('not-visible');
    }
  };

  const goTo = (index: number) => {
    setSlideCurrent(() => Math.max(0, Math.min(index, slideTotal)));
  };

  const slideRight = () => {
    setSlideCurrent((cur) => (cur < slideTotal ? cur + 1 : (repeat ? 0 : cur)));
  };

  const slideLeft = () => {
    setSlideCurrent((cur) => (cur > 0 ? cur - 1 : (repeat ? slideTotal : cur)));
  };

  return (
    <div className="slider-container" ref={containerRef}>
      <div className="slider-content">
        {slides.map((s, i) => (
          <div key={i} className={`slider-single`} data-hidden={i !== slideCurrent}>
            <img className="slider-single-image" src={s.src} alt={s.title ?? `Slide ${i + 1}`} />
            {s.title && <h1 className="slider-single-title">{s.title}</h1>}
            {showLikes ? (
              <button className="slider-single-likes" type="button" aria-label="Like">
                <i className="fa fa-heart" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {!noArrows && (
        <>
          <button className="slider-left" onClick={slideLeft} aria-label="Previous">
            <i className="fa fa-arrow-left" />
          </button>
          <button className="slider-right" onClick={slideRight} aria-label="Next">
            <i className="fa fa-arrow-right" />
          </button>
        </>
      )}

      {!noBullets && (
        <div className="bullet-container">
          {slides.map((_, i) => (
            <div key={i} id={`bullet-index-${i}`} className={`bullet ${i === slideCurrent ? 'active' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
