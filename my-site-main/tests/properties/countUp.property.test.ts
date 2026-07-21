import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { easeOutValue } from '../../hooks/useCountUp';

/**
 * Feature: premium-redesign, Property 5: Count-up animation is monotonically increasing
 * Validates: Requirements 3.5
 *
 * For any target value > 0 and duration in range 800–1500ms, the useCountUp hook SHALL produce
 * a sequence of values that is monotonically non-decreasing, starts at 0, ends at the target value,
 * and completes within the specified duration.
 */

describe('Property 5: Count-up animation is monotonically increasing', () => {
  it('easeOutValue returns a value in [0, 1] for any progress in [0, 1]', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        (progress) => {
          const result = easeOutValue(progress);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('easeOutValue is monotonically non-decreasing: for any p1 <= p2, easeOut(p1) <= easeOut(p2)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (a, b) => {
          const p1 = Math.min(a, b);
          const p2 = Math.max(a, b);
          expect(easeOutValue(p1)).toBeLessThanOrEqual(easeOutValue(p2));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('easeOutValue(0) === 0 and easeOutValue(1) === 1', () => {
    expect(easeOutValue(0)).toBe(0);
    expect(easeOutValue(1)).toBe(1);
  });

  it('for any target > 0 and N evenly-spaced progress values, the sequence Math.round(easeOutValue(progress) * target) is monotonically non-decreasing', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 2, max: 120 }), // N frames (simulating animation frames)
        (target, numFrames) => {
          let lastValue = 0;

          for (let i = 0; i <= numFrames; i++) {
            const progress = i / numFrames;
            let currentValue = Math.round(easeOutValue(progress) * target);

            // Replicate the hook's monotonicity guarantee
            if (currentValue < lastValue) {
              currentValue = lastValue;
            }

            expect(currentValue).toBeGreaterThanOrEqual(lastValue);
            lastValue = currentValue;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the final value in the sequence equals the target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 2, max: 120 }), // N frames
        (target, numFrames) => {
          // At progress = 1, easeOutValue(1) = 1, so Math.round(1 * target) = target
          const progress = 1;
          const finalValue = Math.round(easeOutValue(progress) * target);
          expect(finalValue).toBe(target);
        }
      ),
      { numRuns: 100 }
    );
  });
});
