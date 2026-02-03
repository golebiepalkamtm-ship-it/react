import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PageTransitionType } from '@/lib/page-transitions';

/**
 * Page Transition Context
 * 
 * Kontekst do globalnego zarządzania animacjami przejść między stronami.
 */

interface PageTransitionContextType {
  /** Aktualny typ przejścia */
  transitionType: PageTransitionType;
  /** Ustawia globalny typ przejścia */
  setTransitionType: (type: PageTransitionType) => void;
  /** Typ przejścia dla następnej nawigacji (jednorazowy) */
  nextTransition: PageTransitionType | null;
  /** Ustawia przejście dla następnej nawigacji */
  setNextTransition: (type: PageTransitionType | null) => void;
  /** Nawiguj z określonym przejściem */
  navigateWithTransition: (type: PageTransitionType) => void;
  /** Pobiera aktywne przejście (nextTransition lub transitionType) */
  getActiveTransition: () => PageTransitionType;
  /** Czyści jednorazowe przejście */
  clearNextTransition: () => void;
  /** Czy animacje są włączone */
  enabled: boolean;
  /** Włącza/wyłącza animacje */
  setEnabled: (enabled: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

interface PageTransitionProviderProps {
  children: ReactNode;
  /** Domyślny typ przejścia */
  defaultTransition?: PageTransitionType;
  /** Czy animacje są domyślnie włączone */
  defaultEnabled?: boolean;
}

export const PageTransitionProvider: React.FC<PageTransitionProviderProps> = ({
  children,
  defaultTransition = 'elegant',
  defaultEnabled = true,
}) => {
  const [transitionType, setTransitionType] = useState<PageTransitionType>(defaultTransition);
  const [nextTransition, setNextTransition] = useState<PageTransitionType | null>(null);
  const [enabled, setEnabled] = useState(defaultEnabled);

  const navigateWithTransition = useCallback((type: PageTransitionType) => {
    setNextTransition(type);
  }, []);

  const getActiveTransition = useCallback((): PageTransitionType => {
    return nextTransition || transitionType;
  }, [nextTransition, transitionType]);

  const clearNextTransition = useCallback(() => {
    setNextTransition(null);
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{
        transitionType,
        setTransitionType,
        nextTransition,
        setNextTransition,
        navigateWithTransition,
        getActiveTransition,
        clearNextTransition,
        enabled,
        setEnabled,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = (): PageTransitionContextType => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    // Zwróć domyślne wartości jeśli kontekst nie istnieje
    return {
      transitionType: 'elegant',
      setTransitionType: () => {},
      nextTransition: null,
      setNextTransition: () => {},
      navigateWithTransition: () => {},
      getActiveTransition: () => 'elegant',
      clearNextTransition: () => {},
      enabled: true,
      setEnabled: () => {},
    };
  }
  return context;
};

export default PageTransitionContext;
