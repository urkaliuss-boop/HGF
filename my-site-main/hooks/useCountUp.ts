import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Applies an ease-out cubic curve to a progress value [0, 1].
 * Formula: 1 - (1 - t)^3
 * Exported for property testing.
 */
export function easeOutValue(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

/**
 * Applies an ease-in-out cubic curve to a progress value [0, 1].
 */
function easeInOutValue(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export interface CountUpConfig {
  end: number;
  duration?: number;       // default 1000ms, clamped to 800-1500ms
  easing?: 'easeOut' | 'easeInOut';
  startOnView?: boolean;   // default true
  threshold?: number;      // default 0.5
}

export interface CountUpResult {
  ref: React.RefObject<HTMLElement>;
  value: number;
  isComplete: boolean;
}

/**
 * Hook that animates a count-up effect from 0 to config.end.
 *
 * - Starts when element appears in viewport (threshold 0.5 by default)
 * - Duration defaults to 1000ms, configurable in range 800-1500ms
 * - Applies easeOut easing by default (deceleration curve)
 * - Uses requestAnimationFrame for smooth updates
 * - Ensures monotonically non-decreasing sequence of values
 * - Final value exactly equals config.end
 * - Integrates with useReducedMotion — immediately sets value to target
 * - startOnView defaults to true; if false, starts immediately on mount
 *
 * Validates: Requirements 3.5
 */
export function useCountUp(config: CountUpConfig): CountUpResult {
  const {
    end,
    duration: rawDuration = 1000,
    easing = 'easeOut',
    startOnView = true,
    threshold = 0.5,
  } = config;

  // Clamp duration to 800-1500ms
  const duration = Math.max(800, Math.min(1500, rawDuration));

  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null!);
  const [value, setValue] = useState<number>(reducedMotion ? end : 0);
  const [isComplete, setIsComplete] = useState<boolean>(reducedMotion);
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(!startOnView);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastValueRef = useRef<number>(0);

  const easingFn = easing === 'easeInOut' ? easeInOutValue : easeOutValue;

  // Handle reduced motion: immediately set to target
  useEffect(() => {
    if (reducedMotion) {
      setValue(end);
      setIsComplete(true);
    }
  }, [reducedMotion, end]);

  // IntersectionObserver to detect when element enters viewport
  useEffect(() => {
    if (!startOnView || reducedMotion) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldAnimate(true);
            observer.disconnect();
          }
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [startOnView, threshold, reducedMotion]);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);

      // Compute new value, ensuring monotonically non-decreasing
      let newValue = Math.round(easedProgress * end);
      if (newValue < lastValueRef.current) {
        newValue = lastValueRef.current;
      }
      lastValueRef.current = newValue;

      setValue(newValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure final value is exactly the target
        setValue(end);
        lastValueRef.current = end;
        setIsComplete(true);
      }
    },
    [duration, easingFn, end]
  );

  // Start animation when shouldAnimate becomes true
  useEffect(() => {
    if (!shouldAnimate || reducedMotion || isComplete) return;

    // Reset state for animation start
    startTimeRef.current = null;
    lastValueRef.current = 0;
    setValue(0);

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldAnimate, reducedMotion, isComplete, animate]);

  return { ref, value, isComplete };
}

export default useCountUp;
