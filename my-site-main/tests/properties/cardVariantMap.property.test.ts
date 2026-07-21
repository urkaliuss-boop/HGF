import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { CONTENT_VARIANT_MAP, CardVariant } from '../../components/ui/Card';

/**
 * Feature: premium-redesign, Property 10: Content type maps to correct card variant
 * Validates: Requirements 6.3
 *
 * For any valid content type string from the set {pricing, benefit, step, testimonial, stat},
 * the CONTENT_VARIANT_MAP lookup SHALL return the specified variant (elevated, bordered, bordered,
 * glass, flat respectively), and the mapping SHALL be total (every valid content type has a
 * defined variant).
 */

// The specification-defined mapping
const EXPECTED_MAPPING: Record<string, CardVariant> = {
  pricing: 'elevated',
  benefit: 'bordered',
  step: 'bordered',
  testimonial: 'glass',
  stat: 'flat',
};

const VALID_CONTENT_TYPES = Object.keys(EXPECTED_MAPPING) as string[];

describe('Property 10: Content type maps to correct card variant', () => {
  const contentTypeArb = fc.constantFrom(...VALID_CONTENT_TYPES);

  it('returns the expected variant for any valid content type', () => {
    fc.assert(
      fc.property(contentTypeArb, (contentType) => {
        const result = CONTENT_VARIANT_MAP[contentType];
        const expected = EXPECTED_MAPPING[contentType];
        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it('the mapping is total: every valid content type has a defined (non-undefined) variant', () => {
    fc.assert(
      fc.property(contentTypeArb, (contentType) => {
        const result = CONTENT_VARIANT_MAP[contentType];
        expect(result).toBeDefined();
        expect(result).not.toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('the mapping matches the specification exactly (pricing→elevated, benefit→bordered, step→bordered, testimonial→glass, stat→flat)', () => {
    fc.assert(
      fc.property(contentTypeArb, (contentType) => {
        const result = CONTENT_VARIANT_MAP[contentType];
        // Verify against the full specification
        switch (contentType) {
          case 'pricing':
            expect(result).toBe('elevated');
            break;
          case 'benefit':
            expect(result).toBe('bordered');
            break;
          case 'step':
            expect(result).toBe('bordered');
            break;
          case 'testimonial':
            expect(result).toBe('glass');
            break;
          case 'stat':
            expect(result).toBe('flat');
            break;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('all valid content types are present as keys in CONTENT_VARIANT_MAP', () => {
    fc.assert(
      fc.property(contentTypeArb, (contentType) => {
        expect(contentType in CONTENT_VARIANT_MAP).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
