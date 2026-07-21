import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { clampDecorElements, type DecorativeElement } from '../../components/ui/Section';

/**
 * Feature: premium-redesign, Property 1: Decorative element count is bounded
 * Validates: Requirements 2.2
 *
 * For any Section component with any `decorElements` array, the rendered number of
 * visible decorative elements SHALL be at least 2 and at most 6, regardless of the
 * input array length.
 */

const decorElementType = fc.constantFrom<DecorativeElement['type']>(
  'blob',
  'grid',
  'dots',
  'lines',
  'geometric'
);

const decorElementArb: fc.Arbitrary<DecorativeElement> = fc.record({
  type: decorElementType,
  position: fc.record({
    top: fc.option(fc.constant('10%'), { nil: undefined }),
    left: fc.option(fc.constant('5%'), { nil: undefined }),
    right: fc.option(fc.constant('5%'), { nil: undefined }),
    bottom: fc.option(fc.constant('15%'), { nil: undefined }),
  }),
  opacity: fc.double({ min: 0.03, max: 0.15, noNaN: true }),
  size: fc.constantFrom('80px', '100px', '120px', '150px', '200px'),
  className: fc.option(fc.constant('custom-class'), { nil: undefined }),
});

describe('Property 1: Decorative element count is bounded', () => {
  it('output always has length >= 2 and <= 6 for any input array (0 to 20 elements)', () => {
    fc.assert(
      fc.property(
        fc.array(decorElementArb, { minLength: 0, maxLength: 20 }),
        (elements) => {
          const result = clampDecorElements(elements);
          expect(result.length).toBeGreaterThanOrEqual(2);
          expect(result.length).toBeLessThanOrEqual(6);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for arrays with 2-6 elements, output length equals input length', () => {
    fc.assert(
      fc.property(
        fc.array(decorElementArb, { minLength: 2, maxLength: 6 }),
        (elements) => {
          const result = clampDecorElements(elements);
          expect(result.length).toBe(elements.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for arrays with 0-1 elements, output is padded to length 2', () => {
    fc.assert(
      fc.property(
        fc.array(decorElementArb, { minLength: 0, maxLength: 1 }),
        (elements) => {
          const result = clampDecorElements(elements);
          expect(result.length).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for arrays with >6 elements, output is trimmed to 6', () => {
    fc.assert(
      fc.property(
        fc.array(decorElementArb, { minLength: 7, maxLength: 20 }),
        (elements) => {
          const result = clampDecorElements(elements);
          expect(result.length).toBe(6);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 2 default elements when input is undefined', () => {
    const result = clampDecorElements(undefined);
    expect(result.length).toBe(2);
  });

  it('returns 2 default elements when input is empty array', () => {
    const result = clampDecorElements([]);
    expect(result.length).toBe(2);
  });
});
