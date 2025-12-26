import { useState, useEffect } from 'react';

interface UseDebounceOptions {
  delay?: number;
}

export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): T {
  const { delay = 300 } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseDebounceCallbackOptions {
  delay?: number;
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceCallbackOptions = {}
): T {
  const { delay = 300 } = options;
  const [debouncedCallback, setDebouncedCallback] = useState<T>(callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);

  return debouncedCallback;
}
