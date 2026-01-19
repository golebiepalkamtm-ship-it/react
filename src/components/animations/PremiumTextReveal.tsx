/**
 * ============================================================================
 * PREMIUM TEXT REVEAL - Character & Word Animations
 * ============================================================================
 * 
 * Zaawansowane animacje tekstowe z podziałem na znaki i słowa.
 * Staggering z custom easingami dla efektu premium.
 */

import { useRef, useEffect, ReactNode, useMemo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface PremiumTextRevealProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  splitBy?: 'chars' | 'words' | 'lines';
  animation?: 'slide' | 'fade' | 'rotate' | 'scale' | 'blur' | 'scramble';
  stagger?: number;
  duration?: number;
  delay?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  once?: boolean;
}

export const PremiumTextReveal = ({
  children,
  className = '',
  as: Component = 'div',
  splitBy = 'chars',
  animation = 'slide',
  stagger = 0.02,
  duration = 0.8,
  delay = 0,
  scrub = false,
  start = 'top 85%',
  end = 'bottom 20%',
  once = true,
}: PremiumTextRevealProps) => {
  const containerRef = useRef<HTMLElement>(null);

  const splitElements = useMemo(() => {
    const text = children.toString();
    
    if (splitBy === 'chars') {
      return text.split('').map((char, i) => (
        <span 
          key={i} 
          className="char inline-block"
          style={{ willChange: 'transform, opacity' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    }
    
    if (splitBy === 'words') {
      return text.split(' ').map((word, i, arr) => (
        <span key={i} className="word-wrapper inline-block overflow-hidden">
          <span 
            className="word inline-block"
            style={{ willChange: 'transform, opacity' }}
          >
            {word}
            {i < arr.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ));
    }
    
    return text.split('\n').map((line, i) => (
      <span key={i} className="line-wrapper block overflow-hidden">
        <span 
          className="line inline-block"
          style={{ willChange: 'transform, opacity' }}
        >
          {line}
        </span>
      </span>
    ));
  }, [children, splitBy]);

  useEffect(() => {
    if (!containerRef.current) return;

    const selector = splitBy === 'chars' ? '.char' : splitBy === 'words' ? '.word' : '.line';
    const elements = containerRef.current.querySelectorAll(selector);

    const animations: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
      slide: {
        from: { y: '100%', opacity: 0 },
        to: { y: 0, opacity: 1 },
      },
      fade: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      rotate: {
        from: { rotationX: 90, opacity: 0, transformOrigin: 'center bottom' },
        to: { rotationX: 0, opacity: 1 },
      },
      scale: {
        from: { scale: 0, opacity: 0 },
        to: { scale: 1, opacity: 1 },
      },
      blur: {
        from: { filter: 'blur(10px)', opacity: 0, y: 20 },
        to: { filter: 'blur(0px)', opacity: 1, y: 0 },
      },
      scramble: {
        from: { opacity: 0, y: 30, rotationZ: () => Math.random() * 30 - 15 },
        to: { opacity: 1, y: 0, rotationZ: 0 },
      },
    };

    const { from, to } = animations[animation];

    gsap.set(elements, from);

    const scrollTriggerConfig: ScrollTrigger.Vars = scrub === false
      ? {
          trigger: containerRef.current,
          start,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
        }
      : {
          trigger: containerRef.current,
          start,
          end,
          scrub: typeof scrub === 'number' ? scrub : 1,
        };

    const tl = gsap.timeline({ scrollTrigger: scrollTriggerConfig });

    tl.to(elements, {
      ...to,
      duration,
      stagger: {
        amount: stagger * elements.length,
        from: 'start',
        ease: 'power2.inOut',
      },
      ease: 'power3.out',
      delay,
    });

    return () => {
      tl.kill();
    };
  }, [animation, splitBy, stagger, duration, delay, scrub, start, end, once]);

  return (
    <Component ref={containerRef as any} className={className}>
      {splitElements}
    </Component>
  );
};

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
}

export const TypewriterText = ({
  text,
  className = '',
  speed = 0.05,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  onComplete,
}: TypewriterTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = text.split('');
    containerRef.current.innerHTML = '';
    
    chars.forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      containerRef.current?.appendChild(span);
    });

    const spans = containerRef.current.querySelectorAll('span');

    const tl = gsap.timeline({
      delay,
      onComplete,
    });

    spans.forEach((span, i) => {
      tl.to(span, {
        opacity: 1,
        duration: 0.01,
      }, i * speed);
    });

    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      });
    }

    return () => {
      tl.kill();
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      <span ref={containerRef} />
      {cursor && (
        <span ref={cursorRef} className="text-gold">
          {cursorChar}
        </span>
      )}
    </span>
  );
};

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export const CountUp = ({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0,
}: CountUpProps) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef({ value: start });

  useEffect(() => {
    if (!numberRef.current) return;

    const animation = gsap.to(valueRef.current, {
      value: end,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: numberRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = 
            prefix + valueRef.current.value.toFixed(decimals) + suffix;
        }
      },
    });

    return () => {
      animation.kill();
    };
  }, [end, start, duration, delay, suffix, prefix, decimals]);

  return (
    <span ref={numberRef} className={className}>
      {prefix}{start.toFixed(decimals)}{suffix}
    </span>
  );
};

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animateGradient?: boolean;
  duration?: number;
}

export const GradientText = ({
  children,
  className = '',
  colors = ['#d4af37', '#ffd700', '#ffed4e', '#ffd700', '#d4af37'],
  animateGradient = true,
  duration = 3,
}: GradientTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current || !animateGradient) return;

    const animation = gsap.to(textRef.current, {
      backgroundPosition: '200% center',
      duration,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      animation.kill();
    };
  }, [animateGradient, duration]);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${colors.join(', ')})`,
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <span ref={textRef} className={className} style={gradientStyle}>
      {children}
    </span>
  );
};
