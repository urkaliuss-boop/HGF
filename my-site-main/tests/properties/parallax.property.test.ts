import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeParallaxOffset } from '../../components/Hero';

/**
 * Feature: premium-redesign, Property 6: Parallax offset is proportional to scroll position
 * Validates: Requirements 3.7
 *
 * For any scroll position (scrollY ≥ 0) and parallax factor (0.1–0.3), the computed decorative
 * element offset SHALL equal scrollY * factor, and the factor SHALL always be within the
 * range [0.1, 0.3].
 */

describe('Property 6: Parallax offset is proportional to scroll position', () => {
  it('for any scrollY >= 0 and factor in [0.1, 0.3], offset equals scrollY * factor', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        fc.double({ min: 0.1, max: 0.3, noNaN: true }),
        (scrollY, factor) => {
          const offset = computeParallaxOffset(scrollY, factor);
          expect(offset).toBeCloseTo(scrollY * factor, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('factor is always clamped to [0.1, 0.3] — factors below 0.1 get clamped up', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.double({ min: -100, max: 0.09, noNaN: true }),
        (scrollY, factor) => {
          const offset = computeParallaxOffset(scrollY, factor);
          // Factor below 0.1 should be clamped to 0.1
          expect(offset).toBeCloseTo(scrollY * 0.1, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('factor is always clamped to [0.1, 0.3] — factors above 0.3 get clamped down', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.double({ min: 0.31, max: 100, noNaN: true }),
        (scrollY, factor) => {
          const offset = computeParallaxOffset(scrollY, factor);
          // Factor above 0.3 should be clamped to 0.3
          expect(offset).toBeCloseTo(scrollY * 0.3, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for scrollY = 0, offset is always 0 regardless of factor', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: 100, noNaN: true }),
        (factor) => {
          const offset = computeParallaxOffset(0, factor);
          expect(offset).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('offset is proportional: if scrollY doubles, offset doubles (for the same factor)', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 50000 }),
        fc.double({ min: 0.1, max: 0.3, noNaN: true }),
        (scrollY, factor) => {
          const offset1 = computeParallaxOffset(scrollY, factor);
          const offset2 = computeParallaxOffset(scrollY * 2, factor);
          expect(offset2).toBeCloseTo(offset1 * 2, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any factor outside [0.1, 0.3], the result still uses a clamped factor within bounds', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        (scrollY, factor) => {
          const offset = computeParallaxOffset(scrollY, factor);
          // The effective factor used is always within [0.1, 0.3]
          if (scrollY > 0) {
            const effectiveFactor = offset / scrollY;
            expect(effectiveFactor).toBeGreaterThanOrEqual(0.1 - 1e-10);
            expect(effectiveFactor).toBeLessThanOrEqual(0.3 + 1e-10);
          } else {
            expect(offset).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
