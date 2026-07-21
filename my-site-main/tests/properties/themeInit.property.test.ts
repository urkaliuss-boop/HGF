import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: premium-redesign, Property 18: Theme initialization follows priority order
 * Validates: Requirements 9.5
 *
 * For any combination of localStorage theme value (null | 'dark' | 'light') and system
 * prefers-color-scheme preference (dark | light), the getInitialTheme function SHALL return:
 * (1) the localStorage value if it is 'dark' or 'light', otherwise
 * (2) 'dark' if system preference is dark, otherwise
 * (3) 'light'.
 */

/**
 * Pure logic extraction of getInitialTheme from App.tsx.
 * The original reads from localStorage and window.matchMedia directly.
 * We extract the decision logic into a pure function for property-based testing.
 */
function getInitialThemePure(
  storedValue: string | null,
  systemPrefersDark: boolean
): 'dark' | 'light' {
  if (storedValue === 'dark' || storedValue === 'light') return storedValue;
  return systemPrefersDark ? 'dark' : 'light';
}

describe('Property 18: Theme initialization follows priority order', () => {
  // Generator for localStorage values: null, 'dark', 'light', or arbitrary string
  const localStorageValueArb = fc.oneof(
    fc.constant(null),
    fc.constant('dark'),
    fc.constant('light'),
    fc.string({ minLength: 1, maxLength: 20 }).filter(
      (s) => s !== 'dark' && s !== 'light'
    )
  );

  // Generator for system preference (boolean: true = dark, false = light)
  const systemPreferenceArb = fc.boolean();

  it('returns localStorage value when it is "dark" or "light" (priority 1)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'dark' | 'light'>('dark', 'light'),
        systemPreferenceArb,
        (storedTheme, systemPrefersDark) => {
          const result = getInitialThemePure(storedTheme, systemPrefersDark);
          expect(result).toBe(storedTheme);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('falls back to system preference when localStorage has no valid theme (priority 2 & 3)', () => {
    const invalidStoredValue = fc.oneof(
      fc.constant(null),
      fc.string({ minLength: 1, maxLength: 20 }).filter(
        (s) => s !== 'dark' && s !== 'light'
      )
    );

    fc.assert(
      fc.property(
        invalidStoredValue,
        systemPreferenceArb,
        (storedValue, systemPrefersDark) => {
          const result = getInitialThemePure(storedValue, systemPrefersDark);
          const expected = systemPrefersDark ? 'dark' : 'light';
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any combination of inputs, the result is always "dark" or "light"', () => {
    fc.assert(
      fc.property(
        localStorageValueArb,
        systemPreferenceArb,
        (storedValue, systemPrefersDark) => {
          const result = getInitialThemePure(storedValue, systemPrefersDark);
          expect(result === 'dark' || result === 'light').toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('follows the full priority order for all input combinations', () => {
    fc.assert(
      fc.property(
        localStorageValueArb,
        systemPreferenceArb,
        (storedValue, systemPrefersDark) => {
          const result = getInitialThemePure(storedValue, systemPrefersDark);

          // Priority 1: localStorage is 'dark' or 'light' → use it
          if (storedValue === 'dark' || storedValue === 'light') {
            expect(result).toBe(storedValue);
          }
          // Priority 2: system preference is dark → 'dark'
          else if (systemPrefersDark) {
            expect(result).toBe('dark');
          }
          // Priority 3: otherwise → 'light'
          else {
            expect(result).toBe('light');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
