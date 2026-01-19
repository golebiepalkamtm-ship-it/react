import { useEffect, useRef } from 'react';

/**
 * Wywołuje efekt tylko raz (ekwiwalent componentDidMount).
 * Zapobiega wielokrotnemu rejestrowaniu triggerów GSAP przy remountach.
 */
export const useEffectOnce = (effect: () => void | (() => void)) => {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const cleanup = effect();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
