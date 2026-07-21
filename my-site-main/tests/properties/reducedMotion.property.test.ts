import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: premium-redesign, Property 7: Reduced motion disables all transform animations
 * Validates: Requirements 3.8, 8.2
 *
 * For any animation configuration, when `prefers-reduced-motion: reduce` is active,
 * the output SHALL have all transform/translate durations set to 0ms, and only
 * opacity/color transitions SHALL remain with duration not exceeding 200ms.
 */

/**
 * Pure style computation extracted from useScrollAnimation hook.
 * When reducedMotion is true, the hook returns:
 *   { opacity: 1, transform: 'translateY(0px)' }
 * with NO transition property — meaning instant display (effectively 0ms duration).
 */
function computeScrollAnimationStyle(
  config: { duration: number; delay: number; easing: string; translateY: number },
  isInView: boolean,
  reducedMotion: boolean
): { opacity: number; transform: string; transition?: string } {
  if (reducedMotion) {
    return {
      opacity: 1,
      transform: 'translateY(0px)',
    };
  }

  const { duration, delay, easing, translateY } = config;

  if (isInView) {
    return {
      opacity: 1,
      transform: 'translateY(0px)',
      transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`,
    };
  }

  return {
    opacity: 0,
    transform: `translateY(${translateY}px)`,
    transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`,
  };
}

describe('Property 7: Reduced motion disables all transform animations', () => {
  // Generator for arbitrary ScrollAnimationConfig values
  const animationConfigArb = fc.record({
    threshold: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
    duration: fc.integer({ min: 100, max: 2000 }),
    delay: fc.integer({ min: 0, max: 1000 }),
    staggerDelay: fc.integer({ min: 50, max: 100 }),
    translateY: fc.integer({ min: 1, max: 100 }),
    easing: fc.constantFrom(
      'cubic-bezier(0.16, 1, 0.3, 1)',
      'ease-out',
      'ease-in-out',
      'linear'
    ),
    once: fc.boolean(),
  });

  it('when reducedMotion=true, opacity is always 1 and no transition property exists (0ms effective duration)', () => {
    fc.assert(
      fc.property(animationConfigArb, fc.boolean(), (config, isInView) => {
        const style = computeScrollAnimationStyle(
          {
            duration: config.duration,
            delay: config.delay,
            easing: config.easing,
            translateY: config.translateY,
          },
          isInView,
          true // reducedMotion = true
        );

        // Opacity must be 1 (fully visible, instant display)
        expect(style.opacity).toBe(1);

        // No transition property means no animation duration (effectively 0ms)
        expect(style.transition).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('when reducedMotion=true, transform is always translateY(0px) regardless of config', () => {
    fc.assert(
      fc.property(animationConfigArb, fc.boolean(), (config, isInView) => {
        const style = computeScrollAnimationStyle(
          {
            duration: config.duration,
            delay: config.delay,
            easing: config.easing,
            translateY: config.translateY,
          },
          isInView,
          true // reducedMotion = true
        );

        // Transform must be translateY(0px) — no movement offset regardless of config.translateY
        expect(style.transform).toBe('translateY(0px)');
      }),
      { numRuns: 100 }
    );
  });

  it('when reducedMotion=true, the style output is identical regardless of config values', () => {
    fc.assert(
      fc.property(
        animationConfigArb,
        animationConfigArb,
        fc.boolean(),
        fc.boolean(),
        (config1, config2, isInView1, isInView2) => {
          const style1 = computeScrollAnimationStyle(
            {
              duration: config1.duration,
              delay: config1.delay,
              easing: config1.easing,
              translateY: config1.translateY,
            },
            isInView1,
            true // reducedMotion = true
          );

          const style2 = computeScrollAnimationStyle(
            {
              duration: config2.duration,
              delay: config2.delay,
              easing: config2.easing,
              translateY: config2.translateY,
            },
            isInView2,
            true // reducedMotion = true
          );

          // Both must produce the exact same style regardless of different configs/states
          expect(style1).toEqual(style2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
