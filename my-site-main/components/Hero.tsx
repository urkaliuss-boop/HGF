import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section } from './ui/Section';
import type { DecorativeElement } from './ui/Section';

/**
 * Computes parallax offset for decorative background elements.
 * Factor must be between 0.1 and 0.3 (10–30% of scroll speed).
 *
 * Validates: Requirements 3.7
 */
export function computeParallaxOffset(scrollY: number, factor: number): number {
  const clampedFactor = Math.max(0.1, Math.min(0.3, factor));
  return scrollY * clampedFactor;
}

// --- Decorative elements for the Hero section (≥3 elements as per req 1.5) ---
const heroDecorElements: DecorativeElement[] = [
  {
    type: 'dots',
    position: { top: '8%', right: '6%' },
    opacity: 0.07,
    size: '160px',
  },
  {
    type: 'lines',
    position: { bottom: '12%', left: '4%' },
    opacity: 0.06,
    size: '140px',
  },
  {
    type: 'geometric',
    position: { top: '20%', left: '8%' },
    opacity: 0.05,
    size: '100px',
  },
  {
    type: 'grid',
    position: { bottom: '8%', right: '10%' },
    opacity: 0.04,
    size: '120px',
  },
];

// --- Sequential entrance animation variants (req 3.4: ≤1200ms total) ---
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0,
    },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2,
    },
  },
};

const buttonsVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.5,
    },
  },
};

const trustBadgeVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.8,
    },
  },
};

// --- Tactile button animation (req 3.6): scale(0.95) 100ms → scale(1) 200ms ---
const buttonTapTransition = {
  scale: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
  },
};

/**
 * Hero section — redesigned with:
 * - Section component with ≥3 decorative elements (dots grid, diagonal lines, geometric shapes, grid)
 * - Asymmetric grid layout (2fr 1fr)
 * - Accent color instead of gradient text
 * - Sequential entrance animation (heading → subtitle → buttons → trust-badges, ≤1200ms)
 * - Parallax for background decorative elements (10-30% scroll speed)
 * - Tactile button animations (click → scale(0.95) 100ms → scale(1) 200ms)
 *
 * Validates: Requirements 1.1, 1.2, 1.5, 3.2, 3.4, 3.6, 3.7
 */
const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Section
      variant="light"
      decorElements={heroDecorElements}
      className="pt-44 pb-20 relative"
    >
      {/* Parallax decorative overlays — positioned absolutely, respond to scroll */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        aria-hidden="true"
      >
        {/* Parallax circle — 15% speed */}
        <div
          className="absolute top-[15%] right-[12%] w-24 h-24 rounded-full border-2 border-accent-primary/10 dark:border-accent-primary/20"
          style={{
            transform: `translateY(${computeParallaxOffset(scrollY, 0.15)}px)`,
          }}
        />
        {/* Parallax diagonal line — 20% speed */}
        <div
          className="absolute top-[40%] left-[5%] w-32 h-[2px] bg-accent-secondary/10 dark:bg-accent-secondary/20 rotate-45"
          style={{
            transform: `rotate(45deg) translateY(${computeParallaxOffset(scrollY, 0.2)}px)`,
          }}
        />
        {/* Parallax small square — 10% speed */}
        <div
          className="absolute bottom-[20%] right-[20%] w-8 h-8 border border-accent-primary/8 dark:border-accent-primary/15 rotate-12"
          style={{
            transform: `rotate(12deg) translateY(${computeParallaxOffset(scrollY, 0.1)}px)`,
          }}
        />
        {/* Parallax dots cluster — 25% speed */}
        <div
          className="absolute top-[60%] left-[15%] opacity-[0.06] dark:opacity-[0.1]"
          style={{
            transform: `translateY(${computeParallaxOffset(scrollY, 0.25)}px)`,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
            {[0, 1, 2, 3].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={col * 18 + 6}
                  cy={row * 18 + 6}
                  r="2"
                  fill="currentColor"
                />
              ))
            )}
          </svg>
        </div>
      </div>

      {/* Asymmetric grid: 2fr 1fr (req 1.1) — content takes 2/3, decorative space 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-center">
        {/* Main content column */}
        <motion.div
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Heading — delay 0ms (req 3.4) */}
          <motion.h1
            className="text-[36px] lg:text-[56px] font-extrabold text-text-primary leading-[1.1] tracking-[-0.02em] mb-6 max-w-4xl"
            variants={headingVariants}
          >
            Биржа простых{' '}
            <br />
            <span className="text-accent-primary relative inline-block">
              микрозадач.
              {/* Decorative underline instead of gradient (req 1.2) */}
              <span
                className="absolute left-0 bottom-0 w-full h-[3px] bg-accent-primary/40 rounded-full"
                aria-hidden="true"
              />
            </span>
          </motion.h1>

          {/* Subtitle — delay 200ms (req 3.4) */}
          <motion.p
            className="text-[16px] lg:text-[18px] text-text-secondary max-w-2xl tracking-[0.01em] leading-[1.6] mb-8 font-medium"
            variants={subtitleVariants}
          >
            Зарабатывай на лайках, отзывах и активностях. Оплата сразу после проверки. Вывод от 40₽.
          </motion.p>

          {/* Buttons — delay 500ms (req 3.4) */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-center lg:justify-start mb-6"
            variants={buttonsVariants}
          >
            {/* Primary CTA — tactile animation (req 3.6) */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={buttonTapTransition}
            >
              <Link
                to="/tasks"
                className="min-w-[180px] px-8 py-4 bg-accent-primary hover:bg-primary-600 text-white rounded-button font-medium text-base transition-all shadow-glow hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                Смотреть задания
              </Link>
            </motion.div>

            {/* Secondary CTA — tactile animation (req 3.6) */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={buttonTapTransition}
            >
              <a
                href="https://t.me/noxiss_work"
                target="_blank"
                rel="noreferrer"
                className="min-w-[180px] px-8 py-4 bg-surface-secondary dark:bg-surface-secondary text-text-primary rounded-button font-medium text-base hover:bg-surface-accent dark:hover:bg-surface-accent transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Bell size={18} /> Канал
              </a>
            </motion.div>
          </motion.div>

          {/* Trust badge — delay 800ms (req 3.4) */}
          <motion.div variants={trustBadgeVariants}>
            <Link
              to="/business"
              className="text-sm font-medium text-text-muted hover:text-accent-primary transition-colors border-b border-dashed border-text-muted hover:border-accent-primary"
            >
              Вы владелец бизнеса?{' '}
              <span className="text-text-primary">Заказать отзывы →</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right decorative column — visible on lg+ (asymmetric layout) */}
        <div className="hidden lg:flex items-center justify-center relative" aria-hidden="true">
          {/* Decorative geometric composition */}
          <div className="relative w-full h-64">
            {/* Large circle */}
            <div
              className="absolute top-4 right-8 w-32 h-32 rounded-full border-2 border-accent-primary/15 dark:border-accent-primary/25"
              style={{
                transform: `translateY(${computeParallaxOffset(scrollY, 0.12)}px)`,
              }}
            />
            {/* Medium hexagon outline */}
            <svg
              className="absolute bottom-8 left-4 text-accent-secondary/10 dark:text-accent-secondary/20"
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                transform: `translateY(${computeParallaxOffset(scrollY, 0.18)}px)`,
              }}
            >
              <polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {/* Small filled dot */}
            <div
              className="absolute top-[50%] left-[40%] w-4 h-4 rounded-full bg-accent-primary/20 dark:bg-accent-primary/30"
              style={{
                transform: `translateY(${computeParallaxOffset(scrollY, 0.28)}px)`,
              }}
            />
            {/* Grid pattern */}
            <svg
              className="absolute top-12 left-12 opacity-[0.05] dark:opacity-[0.08]"
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                transform: `translateY(${computeParallaxOffset(scrollY, 0.15)}px)`,
              }}
            >
              {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 5 }).map((_, col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={col * 20 + 4}
                    y={row * 20 + 4}
                    width="6"
                    height="6"
                    rx="1"
                    fill="currentColor"
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Hero;
