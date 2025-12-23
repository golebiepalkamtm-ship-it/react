import { useState, useEffect } from 'react';

export const useRatePLNperEUR = (): number => {
  const [rate, setRate] = useState(4.30); // Default rate

  useEffect(() => {
    // W prawdziwej aplikacji można pobrać z API
    // np. fetch('https://api.exchangerate-api.com/v4/latest/EUR')
    // Na razie używamy stałej wartości
    setRate(4.30);
  }, []);

  return rate;
};
