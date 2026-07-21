import { useState, useEffect } from 'react';

/**
 * Hook that detects whether the user prefers reduced motion.
 * Returns true when `prefers-reduced-motion: reduce` is active.
 * All animation hooks should check this value and disable/reduce animations accordingly.
 *
 * Validates: Requirements 3.8, 8.2
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return reducedMotion;
}

export default useReducedMotion;
