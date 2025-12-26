import { useState, useEffect } from 'react';

export const useRatePLNperEUR = (): number => {
  // Use a sane default rate as initial state; no effect needed.
  const [rate] = useState(4.30); // Default rate

  return rate;
};
