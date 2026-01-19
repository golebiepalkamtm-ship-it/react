import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

// ============ KOMPONENT: Fade In Up ============
interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const GsapFadeInUp: React.FC<FadeInUpProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          end: 'top 60%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [duration, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Slide In Left ============
interface SlideInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
}

export const GsapSlideInLeft: React.FC<SlideInProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  distance = 50,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: -distance },
      {
        opacity: 1,
        x: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [duration, delay, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Slide In Right ============
export const GsapSlideInRight: React.FC<SlideInProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  distance = 50,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: distance },
      {
        opacity: 1,
        x: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [duration, delay, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Scale In ============
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const GsapScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [duration, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Parallax (Follow Mouse) ============
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const GsapParallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        if (ref.current) {
          ref.current.style.transform = `translateY(${self.progress * window.innerHeight * speed}px)`;
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Staggered List ============
interface StaggeredListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const GsapStaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 0.1,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const items = ref.current.querySelectorAll('[data-stagger-item]');

    gsap.fromTo(
      items,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: staggerDelay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [staggerDelay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Pin Element ============
interface PinElementProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export const GsapPinElement: React.FC<PinElementProps> = ({
  children,
  duration = 3,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start: 'top center',
        end: `+=${duration * 100}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });
  }, [duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Text Reveal ============
interface TextRevealProps {
  text: string;
  delay?: number;
  className?: string;
}

export const GsapTextReveal: React.FC<TextRevealProps> = ({
  text,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chars = ref.current.querySelectorAll('.char');

    gsap.fromTo(
      chars,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: {
          amount: 0.6,
          from: 'start',
        },
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [text, delay]);

  return (
    <div ref={ref} className={className}>
      {text.split('').map((char, i) => (
        <span key={`char-${i}`} className="char">
          {char}
        </span>
      ))}
    </div>
  );
};

// ============ KOMPONENT: Number Counter ============
interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const GsapCountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const obj = { value: start };

    gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate() {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.floor(obj.value).toLocaleString()}${suffix}`;
        }
      },
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        scrub: false,
        once: true,
      },
    });
  }, [end, start, duration, suffix, prefix]);

  return (
    <div ref={ref} className={className}>
      {prefix}
      {start}
      {suffix}
    </div>
  );
};

// ============ KOMPONENT: Rotate In ============
interface RotateInProps {
  children: React.ReactNode;
  angle?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

export const GsapRotateIn: React.FC<RotateInProps> = ({
  children,
  angle = 360,
  delay = 0,
  duration = 0.8,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, rotation: angle, scale: 0.8 },
      {
        opacity: 1,
        rotation: 0,
        scale: 1,
        duration,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [angle, duration, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ============ KOMPONENT: Blur In ============
interface BlurInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const GsapBlurIn: React.FC<BlurInProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, filter: 'blur(10px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          scrub: false,
          once: true,
        },
      }
    );
  }, [duration, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
