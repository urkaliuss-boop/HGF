import { useRef, useState, useEffect, useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import type { MotionStyle } from 'framer-motion';

/**
 * Configuration for scroll-triggered animations.
 *
 * Validates: Requirements 3.1, 3.3, 3.8, 3.9
 */
export interface ScrollAnimationConfig {
  /** IntersectionObserver threshold (0.0–1.0). Default: 0.2 */
  threshold?: number;
  /** Animation duration in ms (400–600). Default: 500 */
  duration?: number;
  /** Base delay before animation starts in ms. Default: 0 */
  delay?: number;
  /** Stagger delay per element in ms (50–100) for groups. Default: 75 */
  staggerDelay?: number;
  /** Vertical offset in px to animate from. Default: 24 */
  translateY?: number;
  /** Custom easing function. Default: cubic-bezier(0.16, 1, 0.3, 1) */
  easing?: string;
  /** Animate only on first appearance. Default: true */
  once?: boolean;
}

export interface ScrollAnimationResult {
  ref: React.RefObject<HTMLElement>;
  style: MotionStyle;
  isInView: boolean;
}

/**
 * Calculates the stagger delay for a given index.
 * Elements beyond maxElements receive 0 delay (instant display).
 *
 * @param index - Zero-based index of the element in the group
 * @param staggerDelay - Delay increment per element in ms
 * @param maxElements - Maximum number of elements to animate (default 20)
 * @returns Computed delay in ms, or 0 if index >= maxElements
 *
 * Validates: Requirements 3.3
 */
export function calculateStaggerDelay(
  index: number,
  staggerDelay: number,
  maxElements: number = 20
): number {
  if (index < 0) return 0;
  if (index >= maxElements) return 0;
  return index * staggerDelay;
}

const DEFAULT_CONFIG: Required<ScrollAnimationConfig> = {
  threshold: 0.2,
  duration: 500,
  delay: 0,
  staggerDelay: 75,
  translateY: 24,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  once: true,
};

/**
 * Hook that provides scroll-triggered entrance animations using
 * IntersectionObserver and Framer Motion compatible style values.
 *
 * Features:
 * - IntersectionObserver with configurable threshold (default 0.2)
 * - Opacity 0→1 and translateY offset→0 animation
 * - Duration 400-600ms with exponential ease-out
 * - Respects prefers-reduced-motion (instant display when active)
 * - Stagger support via delay configuration
 * - Once mode: animate only on first appearance (default)
 *
 * Validates: Requirements 3.1, 3.3, 3.8, 3.9
 */
export function useScrollAnimation(
  config?: ScrollAnimationConfig
): ScrollAnimationResult {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null!);
  const [isInView, setIsInView] = useState(false);
  const hasAnimated = useRef(false);

  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [
      config?.threshold,
      config?.duration,
      config?.delay,
      config?.staggerDelay,
      config?.translateY,
      config?.easing,
      config?.once,
    ]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If reduced motion is active, show immediately
    if (reducedMotion) {
      setIsInView(true);
      hasAnimated.current = true;
      return;
    }

    // If IntersectionObserver is not supported, show immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            hasAnimated.current = true;

            if (mergedConfig.once) {
              observer.unobserve(element);
            }
          } else if (!mergedConfig.once && !entry.isIntersecting) {
            setIsInView(false);
          }
        }
      },
      { threshold: mergedConfig.threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [reducedMotion, mergedConfig.threshold, mergedConfig.once]);

  const style: MotionStyle = useMemo(() => {
    // Reduced motion: instant display, no transforms
    if (reducedMotion) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
      };
    }

    const totalDelay = mergedConfig.delay;
    const duration = mergedConfig.duration;
    const easing = mergedConfig.easing;
    const translateY = mergedConfig.translateY;

    if (isInView) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
        transition: `opacity ${duration}ms ${easing} ${totalDelay}ms, transform ${duration}ms ${easing} ${totalDelay}ms`,
      };
    }

    // Initial state: hidden, offset downward
    return {
      opacity: 0,
      transform: `translateY(${translateY}px)`,
      transition: `opacity ${duration}ms ${easing} ${totalDelay}ms, transform ${duration}ms ${easing} ${totalDelay}ms`,
    };
  }, [isInView, reducedMotion, mergedConfig.delay, mergedConfig.duration, mergedConfig.easing, mergedConfig.translateY]);

  return { ref, style, isInView };
}

export default useScrollAnimation;
