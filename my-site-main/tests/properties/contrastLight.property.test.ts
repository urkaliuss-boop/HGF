import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: premium-redesign, Property 9: Light theme color pairs meet WCAG AA contrast
 * Validates: Requirements 5.6
 *
 * For any text-color/background-color pair from the light theme design tokens, the computed
 * contrast ratio SHALL be at least 4.5:1 for text smaller than 24px (or smaller than 18px bold),
 * and at least 3:1 for large text (≥24px or ≥18px bold).
 */

// --- Light theme design token colors ---

interface ColorToken {
  name: string;
  hex: string;
}

const LIGHT_BACKGROUNDS: ColorToken[] = [
  { name: '--surface-primary', hex: '#F8F9FA' },
  { name: '--surface-secondary', hex: '#FFFFFF' },
  { name: '--surface-accent', hex: '#EEF4FF' },
];

const LIGHT_TEXT_COLORS: ColorToken[] = [
  { name: '--text-primary', hex: '#1A1A2E' },
  { name: '--text-secondary', hex: '#4A4A6A' },
  { name: '--text-muted', hex: '#6E6E80' },
];

const LIGHT_ACCENT_COLORS: ColorToken[] = [
  { name: '--accent-primary', hex: '#006BDB' },
];

// All foreground text colors (text + accent used as text)
const ALL_TEXT_COLORS: ColorToken[] = [...LIGHT_TEXT_COLORS, ...LIGHT_ACCENT_COLORS];

// --- WCAG 2.1 Contrast Ratio Computation ---

/**
 * Parse a hex color string (e.g., '#F8F9FA') into RGB components (0-255).
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

/**
 * Convert an sRGB channel value (0-255) to its linear RGB value.
 * Per WCAG 2.1: if C_srgb <= 0.04045, C_linear = C_srgb / 12.92
 * otherwise C_linear = ((C_srgb + 0.055) / 1.055) ^ 2.4
 */
function srgbToLinear(channel: number): number {
  const normalized = channel / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Compute the relative luminance of a color per WCAG 2.1.
 * L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Compute the WCAG 2.1 contrast ratio between two colors.
 * Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05)
 * where L_lighter is the higher luminance value.
 */
function computeContrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hex1);
  const lum2 = relativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Text size categories ---

type TextSize = 'normal' | 'large';

interface TextSizeToken {
  name: string;
  size: TextSize;
  description: string;
}

/**
 * Typography scale from design tokens:
 * - h1: 56px / 800 weight → large text (≥24px)
 * - h2: 45px / 800 weight → large text (≥24px)
 * - h3: 36px / 600 weight → large text (≥24px)
 * - h4: 28px / 600 weight → large text (≥24px)
 * - body: 18px / 400 weight → normal text (< 24px, not bold ≥ 18px)
 * - small: 16px / 400 weight → normal text
 * - caption: 14px / 400 weight → normal text
 */
const TEXT_SIZE_TOKENS: TextSizeToken[] = [
  { name: 'h1', size: 'large', description: '56px weight 800' },
  { name: 'h2', size: 'large', description: '45px weight 800' },
  { name: 'h3', size: 'large', description: '36px weight 600' },
  { name: 'h4', size: 'large', description: '28px weight 600' },
  { name: 'body', size: 'normal', description: '18px weight 400' },
  { name: 'small', size: 'normal', description: '16px weight 400' },
  { name: 'caption', size: 'normal', description: '14px weight 400' },
];

/**
 * Required contrast ratio per WCAG AA:
 * - Normal text (< 24px, or < 18px bold): 4.5:1
 * - Large text (≥ 24px, or ≥ 18px bold): 3:1
 */
function getRequiredContrastRatio(size: TextSize): number {
  return size === 'large' ? 3.0 : 4.5;
}

// --- Generators ---

const textColorArb = fc.constantFrom(...ALL_TEXT_COLORS);
const backgroundArb = fc.constantFrom(...LIGHT_BACKGROUNDS);
const textSizeArb = fc.constantFrom(...TEXT_SIZE_TOKENS);

describe('Property 9: Light theme color pairs meet WCAG AA contrast', () => {
  it('all text-on-background pairs meet minimum contrast ratio for normal text (≥4.5:1)', () => {
    fc.assert(
      fc.property(textColorArb, backgroundArb, (textColor, background) => {
        const ratio = computeContrastRatio(textColor.hex, background.hex);
        const required = getRequiredContrastRatio('normal');

        expect(ratio).toBeGreaterThanOrEqual(required);
      }),
      { numRuns: 100 }
    );
  });

  it('all text-on-background pairs meet minimum contrast ratio for large text (≥3:1)', () => {
    fc.assert(
      fc.property(textColorArb, backgroundArb, (textColor, background) => {
        const ratio = computeContrastRatio(textColor.hex, background.hex);
        const required = getRequiredContrastRatio('large');

        expect(ratio).toBeGreaterThanOrEqual(required);
      }),
      { numRuns: 100 }
    );
  });

  it('text-color/background/size combinations meet WCAG AA requirements', () => {
    fc.assert(
      fc.property(textColorArb, backgroundArb, textSizeArb, (textColor, background, textSize) => {
        const ratio = computeContrastRatio(textColor.hex, background.hex);
        const required = getRequiredContrastRatio(textSize.size);

        expect(ratio).toBeGreaterThanOrEqual(required);
      }),
      { numRuns: 100 }
    );
  });

  it('computeContrastRatio helper produces correct known values', () => {
    // Black on white should be 21:1 (maximum contrast)
    const blackOnWhite = computeContrastRatio('#000000', '#FFFFFF');
    expect(blackOnWhite).toBeCloseTo(21, 0);

    // White on white should be 1:1 (no contrast)
    const whiteOnWhite = computeContrastRatio('#FFFFFF', '#FFFFFF');
    expect(whiteOnWhite).toBeCloseTo(1, 1);

    // The function should be symmetric
    const ratio1 = computeContrastRatio('#1A1A2E', '#F8F9FA');
    const ratio2 = computeContrastRatio('#F8F9FA', '#1A1A2E');
    expect(ratio1).toBeCloseTo(ratio2, 5);
  });

  it('primary text (--text-primary: #1A1A2E) on all backgrounds meets ≥4.5:1', () => {
    fc.assert(
      fc.property(backgroundArb, (background) => {
        const ratio = computeContrastRatio('#1A1A2E', background.hex);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  it('secondary text (--text-secondary: #4A4A6A) on all backgrounds meets ≥4.5:1', () => {
    fc.assert(
      fc.property(backgroundArb, (background) => {
        const ratio = computeContrastRatio('#4A4A6A', background.hex);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  it('muted text (--text-muted: #6E6E80) on all backgrounds meets ≥4.5:1', () => {
    fc.assert(
      fc.property(backgroundArb, (background) => {
        const ratio = computeContrastRatio('#6E6E80', background.hex);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 }
    );
  });

  it('accent text (--accent-primary: #006BDB) on all backgrounds meets ≥3:1 for large text', () => {
    fc.assert(
      fc.property(backgroundArb, (background) => {
        const ratio = computeContrastRatio('#006BDB', background.hex);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      }),
      { numRuns: 100 }
    );
  });
});
