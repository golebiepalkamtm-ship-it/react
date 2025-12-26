import { useState, useCallback, startTransition } from 'react';

interface UseTransitionStateOptions {
  timeoutMs?: number;
}

export const useTransitionState = <T>(
  initialState: T,
  options: UseTransitionStateOptions = {}
) => {
  const { timeoutMs = 5000 } = options;
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const setTransitionState = useCallback((
    newState: T | ((prevState: T) => T),
    callback?: () => void
  ) => {
    startTransition(() => {
      setIsPending(true);
      setState(newState);
      if (callback) {
        callback();
      }
      setIsPending(false);
    });
  }, []);

  return {
    state,
    setState: setTransitionState,
    isPending,
  };
};
