import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateStaggerDelay } from '../../hooks/useScrollAnimation';

/**
 * Feature: premium-redesign, Property 4: Stagger delay calculation respects bounds and max elements
 * Validates: Requirements 3.3
 *
 * For any group of N elements (N ≥ 2) with stagger delay in range 50–100ms,
 * the delay for element at index i SHALL equal `i * staggerDelay`, and for groups
 * where N > 20, only the first 20 elements SHALL receive animation (remaining
 * receive instant display).
 */
describe('Property 4: Stagger delay calculation respects bounds and max elements', () => {
  it('for any index in [0, maxElements-1] and staggerDelay in [50, 100], result equals index * staggerDelay', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 19 }),         // index in [0, 19] (within default maxElements)
        fc.integer({ min: 50, max: 100 }), // staggerDelay in [50, 100]
        (index, staggerDelay) => {
          const result = calculateStaggerDelay(index, staggerDelay);
          expect(result).toBe(index * staggerDelay);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any index >= maxElements (default 20), result is 0 (instant display)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 20, max: 50 }),  // index >= 20
        fc.integer({ min: 50, max: 100 }), // staggerDelay in [50, 100]
        (index, staggerDelay) => {
          const result = calculateStaggerDelay(index, staggerDelay);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any negative index, result is 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: -1 }), // negative index
        fc.integer({ min: 50, max: 100 }),    // staggerDelay in [50, 100]
        (index, staggerDelay) => {
          const result = calculateStaggerDelay(index, staggerDelay);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('delay for index 0 is always 0 regardless of staggerDelay', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 100 }), // staggerDelay in [50, 100]
        (staggerDelay) => {
          const result = calculateStaggerDelay(0, staggerDelay);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for groups of N > 20 elements, elements at index 20+ get delay 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 21, max: 50 }),  // group size N > 20
        fc.integer({ min: 50, max: 100 }), // staggerDelay in [50, 100]
        (groupSize, staggerDelay) => {
          // Elements within bounds get correct delay
          for (let i = 0; i < 20; i++) {
            expect(calculateStaggerDelay(i, staggerDelay)).toBe(i * staggerDelay);
          }
          // Elements at index 20+ get 0 (instant display)
          for (let i = 20; i < groupSize; i++) {
            expect(calculateStaggerDelay(i, staggerDelay)).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
