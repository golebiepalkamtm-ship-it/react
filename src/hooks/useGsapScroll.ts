import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';

interface UseGsapScrollOptions {
  trigger?: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  once?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
}

export const useGsapScroll = (
  callback: (trigger: ScrollTrigger) => void,
  options: UseGsapScrollOptions = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: options.trigger || elementRef.current,
      start: options.start || 'top center',
      end: options.end || 'bottom center',
      scrub: options.scrub ?? false,
      markers: options.markers ?? false,
      once: options.once ?? false,
      onEnter: options.onEnter,
      onLeave: options.onLeave,
    });

    callback(trigger);

    return () => {
      trigger.kill();
    };
  }, [callback, options.trigger, options.start, options.end, options.scrub, options.markers, options.once, options.onEnter, options.onLeave]);

  return elementRef;
};

export const useGsapTimeline = (
  callback: (timeline: gsap.core.Timeline) => void
) => {
  useEffect(() => {
    const tl = gsap.timeline();
    callback(tl);

    return () => {
      tl.kill();
    };
  }, [callback]);
};

// Utility functions for common GSAP animations
export const gsapUtils = {
  fadeInUp: (element: HTMLElement, delay = 0, duration = 0.6) => {
    gsap.fromTo(element,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'top 50%',
          scrub: false,
        }
      }
    );
  },

  fadeInDown: (element: HTMLElement, delay = 0, duration = 0.6) => {
    gsap.fromTo(element,
      { opacity: 0, y: -30 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'top 50%',
          scrub: false,
        }
      }
    );
  },

  slideInLeft: (element: HTMLElement, delay = 0, duration = 0.6) => {
    gsap.fromTo(element,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          scrub: false,
        }
      }
    );
  },

  slideInRight: (element: HTMLElement, delay = 0, duration = 0.6) => {
    gsap.fromTo(element,
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          scrub: false,
        }
      }
    );
  },

  scaleIn: (element: HTMLElement, delay = 0, duration = 0.6) => {
    gsap.fromTo(element,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration,
        delay,
        ease: 'back.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          scrub: false,
        }
      }
    );
  },

  parallax: (element: HTMLElement, speed = 0.5) => {
    gsap.to(element, {
      y: () => window.scrollY * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        markers: false,
      }
    });
  },

  textReveal: (element: HTMLElement, delay = 0) => {
    const text = element.textContent || '';
    element.innerHTML = text.split('').map(() => '<span class="char">​</span>').join('');
    const chars = element.querySelectorAll('.char');
    
    gsap.fromTo(chars,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: {
          amount: 0.6,
          from: 'start'
        },
        delay,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          scrub: false,
        }
      }
    );
  },

  countUp: (element: HTMLElement, endValue: number, duration = 2) => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate() {
        element.textContent = Math.floor(obj.value).toString();
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        scrub: false,
      }
    });
  },

  pinElement: (element: HTMLElement, duration = 3) => {
    gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top center',
        end: `+=${duration * 100}`,
        scrub: 1,
        pin: true,
        markers: false,
      }
    });
  }
};
