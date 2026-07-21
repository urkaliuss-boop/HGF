import { useState, useCallback, useRef, useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Configuration for the animation queue.
 */
export interface AnimationQueueConfig {
  maxConcurrent: number;       // 3 on mobile (<768px), Infinity on desktop
  defaultDuration: number;     // 500ms
}

/**
 * Internal queue item representing a pending animation.
 */
interface QueueItem {
  id: string;
  duration: number;
  resolve: () => void;
}

const MOBILE_BREAKPOINT = 768;
const DEFAULT_DURATION = 500;
const MOBILE_MAX_CONCURRENT = 3;

/**
 * Pure function that determines maxConcurrent based on viewport width.
 * Returns 3 for width < 768, Infinity for >= 768.
 *
 * Exported for property-based testing.
 *
 * Validates: Requirements 8.1, 8.5
 */
export function getMaxConcurrent(viewportWidth: number): number {
  return viewportWidth < MOBILE_BREAKPOINT ? MOBILE_MAX_CONCURRENT : Infinity;
}

/**
 * Hook that manages an animation queue with viewport-aware concurrency limits.
 *
 * - On mobile (<768px): limits concurrent animations to 3
 * - On desktop (>=768px): unlimited concurrent animations
 * - Integrates with useReducedMotion: if active, all animations resolve immediately (duration 0)
 * - FIFO queue: animations start in the order they were enqueued
 *
 * enqueue(id, duration) returns a Promise that resolves when the animation slot
 * is available AND the duration has elapsed (i.e., when the animation completes).
 *
 * Validates: Requirements 8.1, 8.5
 */
export function useAnimationQueue(): {
  enqueue: (id: string, duration: number) => Promise<void>;
  isActive: (id: string) => boolean;
  activeCount: number;
} {
  const reducedMotion = useReducedMotion();

  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  const [activeCount, setActiveCount] = useState(0);

  const queueRef = useRef<QueueItem[]>([]);
  const activeRef = useRef<Set<string>>(new Set());
  const maxConcurrentRef = useRef<number>(
    typeof window !== 'undefined'
      ? getMaxConcurrent(window.innerWidth)
      : Infinity
  );

  // Listen for window resize to update maxConcurrent dynamically
  useEffect(() => {
    const updateMaxConcurrent = () => {
      maxConcurrentRef.current = getMaxConcurrent(window.innerWidth);
      // When switching to desktop (more slots available), process queued items
      processQueue();
    };

    window.addEventListener('resize', updateMaxConcurrent);
    return () => window.removeEventListener('resize', updateMaxConcurrent);
  }, []);

  /**
   * Attempt to process queued items when slots become available.
   * Starts animations from the front of the FIFO queue.
   */
  const processQueue = useCallback(() => {
    while (
      queueRef.current.length > 0 &&
      activeRef.current.size < maxConcurrentRef.current
    ) {
      const item = queueRef.current.shift()!;
      runAnimation(item);
    }
  }, []);

  /**
   * Run an animation: add to active set, wait for duration, then dequeue.
   * The item's promise resolves after the duration elapses.
   */
  const runAnimation = useCallback((item: QueueItem) => {
    activeRef.current.add(item.id);
    setActiveAnimations(new Set(activeRef.current));
    setActiveCount(activeRef.current.size);

    // After duration elapses, remove from active and resolve the promise
    setTimeout(() => {
      activeRef.current.delete(item.id);
      setActiveAnimations(new Set(activeRef.current));
      setActiveCount(activeRef.current.size);

      // Resolve — the animation has completed
      item.resolve();

      // Process next items in queue
      processQueue();
    }, item.duration);
  }, [processQueue]);

  /**
   * Enqueue an animation. Returns a Promise that resolves when the animation
   * slot is available AND the duration has elapsed (animation completed).
   *
   * If reduced motion is active, resolves immediately (duration treated as 0).
   */
  const enqueue = useCallback((id: string, duration: number = DEFAULT_DURATION): Promise<void> => {
    // If reduced motion is active, resolve immediately without entering the queue
    if (reducedMotion) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const item: QueueItem = { id, duration, resolve };

      // If there's room, start immediately
      if (activeRef.current.size < maxConcurrentRef.current) {
        runAnimation(item);
      } else {
        // Otherwise, add to FIFO queue
        queueRef.current.push(item);
      }
    });
  }, [reducedMotion, runAnimation]);

  /**
   * Check if a specific animation is currently active (playing).
   */
  const isActive = useCallback((id: string): boolean => {
    return activeAnimations.has(id);
  }, [activeAnimations]);

  return {
    enqueue,
    isActive,
    activeCount,
  };
}

export default useAnimationQueue;
