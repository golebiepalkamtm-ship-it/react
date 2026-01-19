/**
 * GSAP LIFECYCLE HOOK
 * Proper cleanup and memory management for GSAP animations
 */

import { useEffect, useRef, MutableRefObject } from 'react';
import { gsap } from '@/lib/gsapConfig';

type GSAPCallback = (context: GSAPContext) => void | (() => void);

interface GSAPContext {
  selector: (selector: string) => HTMLElement[];
}

export const useGSAP = (
  callback: GSAPCallback,
  dependencies: any[] = [],
  scope?: MutableRefObject<HTMLElement | null>
) => {
  const ctxRef = useRef<gsap.Context | null>(null);
  const scopeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scopeElement = scope?.current || (typeof document !== 'undefined' ? document.body : null);
    
    if (!scopeElement) {
      return;
    }

    const ctx = gsap.context(() => {
      const context: GSAPContext = {
        selector: (selector: string) => {
          return gsap.utils.toArray(selector, scopeElement);
        },
      };
      const cleanup = callback(context);
      return cleanup;
    }, scopeElement);

    ctxRef.current = ctx;
    scopeRef.current = scopeElement;

    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ctxRef;
};
