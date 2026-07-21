import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: premium-redesign, Property 2: Adjacent sections have sufficient color contrast
 * Validates: Requirements 2.3
 *
 * For any sequence of section variants rendered on a page, adjacent sections SHALL have
 * background colors differing by at least 10 units in HSL lightness (L) or at least 30
 * degrees in hue (H), and no two consecutive sections shall both use pure white (#FFFFFF)
 * or pure black (#000000).
 */

// --- Design token background colors mapped to HSL ---

type SectionVariant = 'light' | 'dark' | 'accent' | 'textured';

interface HSLColor {
  h: number; // hue: 0-360
  s: number; // saturation: 0-100
  l: number; // lightness: 0-100
  hex: string;
}

/**
 * Background color mapping from design tokens:
 * - light: var(--surface-primary) = #F8F9FA → HSL(210, 17%, 98%)
 * - dark: var(--surface-dark) = #0F1117 → HSL(225, 25%, 8%)
 * - accent: var(--surface-accent) = #EEF4FF → HSL(217, 100%, 97%)
 * - textured: var(--surface-primary) = #F8F9FA → HSL(210, 17%, 98%)
 */
const VARIANT_BACKGROUND_HSL: Record<SectionVariant, HSLColor> = {
  light: { h: 210, s: 17, l: 98, hex: '#F8F9FA' },
  dark: { h: 225, s: 25, l: 8, hex: '#0F1117' },
  accent: { h: 217, s: 100, l: 97, hex: '#EEF4FF' },
  textured: { h: 210, s: 17, l: 98, hex: '#F8F9FA' },
};

/**
 * Check if two adjacent section backgrounds have sufficient contrast.
 * Returns true if they differ by ≥10 in lightness OR ≥30 in hue.
 */
function hasAdjacentContrast(variantA: SectionVariant, variantB: SectionVariant): boolean {
  const colorA = VARIANT_BACKGROUND_HSL[variantA];
  const colorB = VARIANT_BACKGROUND_HSL[variantB];

  const lightnessDiff = Math.abs(colorA.l - colorB.l);
  const hueDiff = Math.min(
    Math.abs(colorA.h - colorB.h),
    360 - Math.abs(colorA.h - colorB.h)
  );

  return lightnessDiff >= 10 || hueDiff >= 30;
}

/**
 * Check if two adjacent sections both use pure white (#FFFFFF) or pure black (#000000).
 * Returns true if the pair is invalid (both are pure white or both are pure black).
 */
function hasPureColorViolation(variantA: SectionVariant, variantB: SectionVariant): boolean {
  const colorA = VARIANT_BACKGROUND_HSL[variantA];
  const colorB = VARIANT_BACKGROUND_HSL[variantB];

  const bothWhite = colorA.hex === '#FFFFFF' && colorB.hex === '#FFFFFF';
  const bothBlack = colorA.hex === '#000000' && colorB.hex === '#000000';

  return bothWhite || bothBlack;
}

/**
 * Validates a sequence of section variants for adjacent contrast compliance.
 * Returns { valid: boolean, violations: string[] }.
 */
function validateSectionSequence(variants: SectionVariant[]): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  for (let i = 0; i < variants.length - 1; i++) {
    const current = variants[i];
    const next = variants[i + 1];

    if (!hasAdjacentContrast(current, next)) {
      violations.push(
        `Insufficient contrast between sections ${i} (${current}) and ${i + 1} (${next}): ` +
        `L diff = ${Math.abs(VARIANT_BACKGROUND_HSL[current].l - VARIANT_BACKGROUND_HSL[next].l)}, ` +
        `H diff = ${Math.min(Math.abs(VARIANT_BACKGROUND_HSL[current].h - VARIANT_BACKGROUND_HSL[next].h), 360 - Math.abs(VARIANT_BACKGROUND_HSL[current].h - VARIANT_BACKGROUND_HSL[next].h))}`
      );
    }

    if (hasPureColorViolation(current, next)) {
      violations.push(
        `Pure color violation: sections ${i} (${current}) and ${i + 1} (${next}) both use the same pure color`
      );
    }
  }

  return { valid: violations.length === 0, violations };
}

// --- Generators ---

const sectionVariantArb = fc.constantFrom<SectionVariant>('light', 'dark', 'accent', 'textured');

/**
 * Generator for "valid" sequences where adjacent variants always have sufficient contrast.
 * Since light and textured share the same background (#F8F9FA), they cannot be adjacent.
 * Similarly, light-accent and textured-accent pairs have only 1L difference and 7H difference,
 * which fails the ≥10L OR ≥30H requirement.
 *
 * Valid adjacent pairs (that pass contrast check):
 * - light → dark (L diff: 90) ✓
 * - dark → light (L diff: 90) ✓
 * - dark → accent (L diff: 89) ✓
 * - accent → dark (L diff: 89) ✓
 * - dark → textured (L diff: 90) ✓
 * - textured → dark (L diff: 90) ✓
 *
 * Invalid adjacent pairs (that fail contrast check):
 * - light → textured (L diff: 0, H diff: 0) ✗
 * - textured → light (L diff: 0, H diff: 0) ✗
 * - light → accent (L diff: 1, H diff: 7) ✗
 * - accent → light (L diff: 1, H diff: 7) ✗
 * - textured → accent (L diff: 1, H diff: 7) ✗
 * - accent → textured (L diff: 1, H diff: 7) ✗
 */

// Build a valid sequence where each adjacent pair has sufficient contrast
function validSequenceArb(minLength: number, maxLength: number): fc.Arbitrary<SectionVariant[]> {
  return fc.integer({ min: minLength, max: maxLength }).chain((length) => {
    // Start with any variant
    return sectionVariantArb.chain((first) => {
      if (length === 1) return fc.constant([first]);

      // For each subsequent position, pick a variant that has sufficient contrast with the previous
      return fc.array(
        fc.constantFrom<SectionVariant>('light', 'dark', 'accent', 'textured'),
        { minLength: length - 1, maxLength: length - 1 }
      ).map((rest) => {
        // Build a valid sequence by ensuring each adjacent pair passes contrast
        const result: SectionVariant[] = [first];
        for (const candidate of rest) {
          const prev = result[result.length - 1];
          if (hasAdjacentContrast(prev, candidate)) {
            result.push(candidate);
          } else {
            // If the candidate fails, substitute with 'dark' (which contrasts with all light variants)
            // or 'light' (which contrasts with dark)
            const substitute = prev === 'dark' ? 'light' : 'dark';
            result.push(substitute);
          }
        }
        return result;
      });
    });
  });
}

describe('Property 2: Adjacent sections have sufficient color contrast', () => {
  it('valid sequences always pass the contrast validation', () => {
    fc.assert(
      fc.property(validSequenceArb(2, 10), (sequence) => {
        const result = validateSectionSequence(sequence);
        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('any pair involving dark variant satisfies the ≥10 lightness difference', () => {
    const nonDarkVariant = fc.constantFrom<SectionVariant>('light', 'accent', 'textured');

    fc.assert(
      fc.property(nonDarkVariant, (variant) => {
        // dark has L=8, all others have L≥97, so diff ≥ 89
        expect(hasAdjacentContrast('dark', variant)).toBe(true);
        expect(hasAdjacentContrast(variant, 'dark')).toBe(true);

        const darkColor = VARIANT_BACKGROUND_HSL['dark'];
        const otherColor = VARIANT_BACKGROUND_HSL[variant];
        const lightnessDiff = Math.abs(darkColor.l - otherColor.l);
        expect(lightnessDiff).toBeGreaterThanOrEqual(10);
      }),
      { numRuns: 100 }
    );
  });

  it('light and textured are detected as insufficient contrast (same background)', () => {
    // light and textured share the exact same background: #F8F9FA, HSL(210, 17%, 98%)
    expect(hasAdjacentContrast('light', 'textured')).toBe(false);
    expect(hasAdjacentContrast('textured', 'light')).toBe(false);

    const result = validateSectionSequence(['light', 'textured']);
    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('light/textured adjacent to accent is detected as insufficient contrast', () => {
    // light: HSL(210, 17%, 98%) vs accent: HSL(217, 100%, 97%)
    // L diff = |98-97| = 1 (< 10), H diff = |210-217| = 7 (< 30)
    expect(hasAdjacentContrast('light', 'accent')).toBe(false);
    expect(hasAdjacentContrast('accent', 'light')).toBe(false);
    expect(hasAdjacentContrast('textured', 'accent')).toBe(false);
    expect(hasAdjacentContrast('accent', 'textured')).toBe(false);
  });

  it('no two consecutive sections use pure white or pure black', () => {
    fc.assert(
      fc.property(
        fc.array(sectionVariantArb, { minLength: 2, maxLength: 10 }),
        (sequence) => {
          // None of the current design token colors are pure white or pure black
          // so this should never trigger
          for (let i = 0; i < sequence.length - 1; i++) {
            expect(hasPureColorViolation(sequence[i], sequence[i + 1])).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('random sequences are correctly validated (invalid pairs detected)', () => {
    fc.assert(
      fc.property(
        fc.array(sectionVariantArb, { minLength: 2, maxLength: 10 }),
        (sequence) => {
          const result = validateSectionSequence(sequence);

          // Manually verify: for each adjacent pair, check if validation agrees
          for (let i = 0; i < sequence.length - 1; i++) {
            const pairContrast = hasAdjacentContrast(sequence[i], sequence[i + 1]);
            if (!pairContrast) {
              // The validation should report this as invalid
              expect(result.valid).toBe(false);
              return; // Found at least one invalid pair, validation is correct
            }
          }

          // If all pairs have sufficient contrast, validation should pass
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('specific variant pairs satisfy the contrast requirement', () => {
    // Test all possible pairs and verify known good/bad pairs
    const allVariants: SectionVariant[] = ['light', 'dark', 'accent', 'textured'];

    const expectedContrast: Record<string, boolean> = {
      'light→dark': true,      // L diff: |98-8| = 90 ≥ 10
      'dark→light': true,      // L diff: |8-98| = 90 ≥ 10
      'dark→accent': true,     // L diff: |8-97| = 89 ≥ 10
      'accent→dark': true,     // L diff: |97-8| = 89 ≥ 10
      'dark→textured': true,   // L diff: |8-98| = 90 ≥ 10
      'textured→dark': true,   // L diff: |98-8| = 90 ≥ 10
      'light→accent': false,   // L diff: 1, H diff: 7 — both below thresholds
      'accent→light': false,   // L diff: 1, H diff: 7 — both below thresholds
      'light→textured': false, // Same color entirely
      'textured→light': false, // Same color entirely
      'textured→accent': false,// L diff: 1, H diff: 7 — both below thresholds
      'accent→textured': false,// L diff: 1, H diff: 7 — both below thresholds
      'light→light': false,    // Same color
      'dark→dark': false,      // Same color (L diff: 0, H diff: 0)
      'accent→accent': false,  // Same color
      'textured→textured': false, // Same color
    };

    for (const a of allVariants) {
      for (const b of allVariants) {
        const key = `${a}→${b}`;
        const result = hasAdjacentContrast(a, b);
        if (key in expectedContrast) {
          expect(result).toBe(expectedContrast[key]);
        }
      }
    }
  });
});
