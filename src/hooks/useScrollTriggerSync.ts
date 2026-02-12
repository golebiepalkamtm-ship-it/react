/**
 * Hook do synchronizacji GSAP ScrollTrigger z Lenis
 * Zapewnia prawidłową integrację i odświeżanie ScrollTriggerów
 */

import { useEffect, useRef, useCallback } from 'react';
import { ScrollTrigger } from '@/lib/gsapConfig';
import { useLenis } from '@/components/animations/SmoothScrollProvider';

interface ScrollTriggerSyncOptions {
  refreshOnMount?: boolean;
  refreshOnUnmount?: boolean;
  refreshDelay?: number;
  dependencies?: any[];
}

/**
 * Hook zapewniający synchronizację GSAP ScrollTrigger z Lenis
 * @param options Opcje konfiguracyjne
 */
export const useScrollTriggerSync = (options: ScrollTriggerSyncOptions = {}) => {
  const {
    refreshOnMount = true,
    refreshOnUnmount = false,
    refreshDelay = 100,
    dependencies = []
  } = options;
  
  const { getLenis, isReduced } = useLenis();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Funkcja do bezpiecznego odświeżania ScrollTriggerów z useCallback
  const safeRefresh = useCallback((deep = true) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setTimeout(() => {
      ScrollTrigger.refresh(deep);
      refreshTimerRef.current = null;
    }, refreshDelay);
  }, [refreshDelay]);

  // Odświeżanie przy montowaniu komponentu
  useEffect(() => {
    if (refreshOnMount && !isReduced) {
      safeRefresh();
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      if (refreshOnUnmount && !isReduced) {
        ScrollTrigger.refresh();
      }
    };
  }, [refreshOnMount, refreshOnUnmount, isReduced, safeRefresh]);
  
  // Osobny useEffect dla dynamicznych zależności
  useEffect(() => {
    if (dependencies.length > 0 && !isReduced) {
      safeRefresh();
    }
  }, [dependencies, isReduced, safeRefresh]);

  return { refresh: safeRefresh };
};
