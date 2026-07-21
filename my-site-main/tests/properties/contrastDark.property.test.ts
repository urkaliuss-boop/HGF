import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: premium-redesign, Property 17: Dark theme color pairs meet WCAG AAA contrast
 * Validates: Requirements 9.3
 *
 * For any primary text color / dark background color pair from the dark theme tokens,
 * the contrast ratio SHALL be at least 7:1. For secondary/muted text, the contrast ratio
 * SHALL be at least 4.5:1.
 */

// --- WCAG 2.1 Contrast Ratio Implementation ---

/**
 * Convert a hex color string to its sRGB components (0-255).
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert an sRGB component (0-255) to its linear value.
 * Per WCAG 2.1: if C_sRGB <= 0.04045, C_linear = C_sRGB / 12.92
 * else C_linear = ((C_sRGB + 0.055) / 1.055) ^ 2.4
 */
function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Compute relative luminance per WCAG 2.1.
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const R = linearize(r);
  const G = linearize(g);
  const B = linearize(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Compute contrast ratio between two colors per WCAG 2.1.
 * Ratio = (L1 + 0.05) / (L2 + 0.05) where L1 >= L2
 */
function computeContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Dark Theme Design Tokens ---

/** Dark theme background colors */
const DARK_BACKGROUNDS = [
  { name: '--surface-primary', hex: '#0A0A0F' },
  { name: '--surface-secondary', hex: '#12121A' },
  { name: '--surface-accent', hex: '#1A1A2E' },
  { name: '--surface-dark', hex: '#060608' },
] as const;

/** Dark theme primary text — must meet WCAG AAA (≥7:1) */
const PRIMARY_TEXT = { name: '--text-primary', hex: '#F0F0F5' } as const;

/** Dark theme secondary text — must meet WCAG AA (≥4.5:1) */
const SECONDARY_TEXT = { name: '--text-secondary', hex: '#A0A0B0' } as const;

/** Dark theme muted text — must meet WCAG AA (≥4.5:1) */
const MUTED_TEXT = { name: '--text-muted', hex: '#9494A4' } as const;

// --- Generators ---

const darkBackgroundArb = fc.constantFrom(...DARK_BACKGROUNDS);

describe('Property 17: Dark theme color pairs meet WCAG AAA contrast', () => {
  it('primary text (#F0F0F5) on all dark backgrounds meets WCAG AAA contrast ≥ 7:1', () => {
    fc.assert(
      fc.property(darkBackgroundArb, (background) => {
        const ratio = computeContrastRatio(PRIMARY_TEXT.hex, background.hex);
        expect(ratio).toBeGreaterThanOrEqual(7);
      }),
      { numRuns: 100 }
    );
  });

  it('secondary text (#A0A0B0) on all dark backgrounds meets WCAG AA contrast ≥ 4.5:1', () => {
    fc.assert(
      fc.property(darkBackgroundArb, (background) => {
        const ratio = computeContrastRatio(SECONDARY_TEXT.hex, background.hex);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  it('muted text (#9494A4) on all dark backgrounds meets WCAG AA contrast ≥ 4.5:1', () => {
    fc.assert(
      fc.property(darkBackgroundArb, (background) => {
        const ratio = computeContrastRatio(MUTED_TEXT.hex, background.hex);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  it('all text/background combinations from dark theme tokens meet their required ratios', () => {
    type TextCategory = 'primary' | 'secondary' | 'muted';
    const textColors: Array<{ category: TextCategory; hex: string; name: string }> = [
      { category: 'primary', hex: PRIMARY_TEXT.hex, name: PRIMARY_TEXT.name },
      { category: 'secondary', hex: SECONDARY_TEXT.hex, name: SECONDARY_TEXT.name },
      { category: 'muted', hex: MUTED_TEXT.hex, name: MUTED_TEXT.name },
    ];

    const textColorArb = fc.constantFrom(...textColors);

    fc.assert(
      fc.property(
        fc.tuple(textColorArb, darkBackgroundArb),
        ([textColor, background]) => {
          const ratio = computeContrastRatio(textColor.hex, background.hex);
          const minRatio = textColor.category === 'primary' ? 7 : 4.5;

          expect(ratio).toBeGreaterThanOrEqual(minRatio);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('computeContrastRatio is symmetric', () => {
    const textColors = [PRIMARY_TEXT.hex, SECONDARY_TEXT.hex, MUTED_TEXT.hex];
    const textColorArb = fc.constantFrom(...textColors);

    fc.assert(
      fc.property(
        fc.tuple(textColorArb, darkBackgroundArb),
        ([textHex, background]) => {
          const ratio1 = computeContrastRatio(textHex, background.hex);
          const ratio2 = computeContrastRatio(background.hex, textHex);
          expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('contrast ratio is always ≥ 1', () => {
    fc.assert(
      fc.property(darkBackgroundArb, (background) => {
        // Even the same color against itself should return exactly 1
        const ratioSelf = computeContrastRatio(background.hex, background.hex);
        expect(ratioSelf).toBeCloseTo(1, 5);

        // Any text on any background should be ≥ 1
        const ratioPrimary = computeContrastRatio(PRIMARY_TEXT.hex, background.hex);
        expect(ratioPrimary).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });
});
