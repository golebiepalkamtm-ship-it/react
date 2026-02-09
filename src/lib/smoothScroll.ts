/**
 * Smooth Scroll Implementation - Native Wrapper
 * Replaced Lenis with native scroll for better performance and stability.
 */

import { ScrollTrigger } from '@/lib/gsapConfig';

const lenis: any = null;

export const initSmoothScroll = (lerp: number = 0.035, duration: number = 2.5) => {
  console.log('✨ [Scroll] Using native smooth scrolling');

  // Refresh ScrollTrigger to ensure all trigger positions are calculated correctly
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return null;
};

export const scrollTo = (target: string | HTMLElement | number) => {
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: 'smooth' });
  }
};

export const stopScroll = () => { };
export const startScroll = () => { };
export const destroySmoothScroll = () => { };
export const getLenis = () => null;

