import React from 'react';

// --- Types ---

export type CardVariant = 'flat' | 'elevated' | 'bordered' | 'glass';

export interface CardProps {
  variant: CardVariant;
  children: React.ReactNode;
  className?: string;
  accent?: 'line' | 'corner' | 'pattern';
  accentColor?: string;
  hoverable?: boolean;
}

// --- Content → Variant mapping ---

export const CONTENT_VARIANT_MAP: Record<string, CardVariant> = {
  pricing: 'elevated',
  benefit: 'bordered',
  step: 'bordered',
  testimonial: 'glass',
  stat: 'flat',
};

// --- Variant-specific styles ---

const variantStyles: Record<CardVariant, string> = {
  flat: 'bg-surface-primary border-none shadow-none',
  elevated: [
    'bg-surface-primary',
    'shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.08)]',
    'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_30px_rgba(0,113,227,0.12)]',
    'border border-transparent',
  ].join(' '),
  bordered: [
    'bg-surface-primary border-2 border-accent-primary shadow-none',
    'dark:border-white/30',
  ].join(' '),
  glass: [
    'backdrop-blur-xl bg-white/10',
    'dark:bg-white/5',
    'border border-white/20',
    'dark:border-white/10',
  ].join(' '),
};

/**
 * Hover styles only apply on devices with fine pointer (mouse/trackpad).
 * On touch devices, these are replaced by active (tap) states via CSS media query.
 *
 * Validates: Requirements 8.4
 */
const hoverStyles: Record<CardVariant, string> = {
  flat: 'hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.10)]',
  elevated: 'hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.12)]',
  bordered: 'hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.10)]',
  glass: 'hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.10)]',
};

/**
 * Active (tap) styles for touch devices — 100ms response time.
 * Uses scale transform only (no width/height/margin) for ≥55fps.
 *
 * Validates: Requirements 8.3, 8.4
 */
const TAP_FEEDBACK_CLASSES = 'active:scale-[0.98] active:transition-transform active:duration-100';

// --- Decorative accent elements ---

function AccentLine({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 left-0 w-full h-[3px] rounded-t-card"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function AccentCorner({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 right-0 w-6 h-6 overflow-hidden rounded-tr-card"
      aria-hidden="true"
    >
      <div
        className="absolute top-0 right-0 w-0 h-0"
        style={{
          borderTop: `24px solid ${color}`,
          borderLeft: '24px solid transparent',
        }}
      />
    </div>
  );
}

function AccentPattern({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0 rounded-card overflow-hidden pointer-events-none opacity-[0.05]"
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="card-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#card-pattern)" />
      </svg>
    </div>
  );
}

// --- Card component ---

export function Card({
  variant,
  children,
  className = '',
  accent,
  accentColor,
  hoverable = true,
}: CardProps) {
  const resolvedColor = accentColor || 'var(--accent-primary)';

  const baseClasses = [
    'relative',
    'rounded-card',
    'p-6 md:p-8',
    'transition-[transform,box-shadow] duration-[250ms] ease-out',
    variantStyles[variant],
    hoverable ? `card-hoverable will-change-transform ${hoverStyles[variant]} ${TAP_FEEDBACK_CLASSES}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={baseClasses}>
      {/* Decorative accent elements */}
      {accent === 'line' && <AccentLine color={resolvedColor} />}
      {accent === 'corner' && <AccentCorner color={resolvedColor} />}
      {accent === 'pattern' && <AccentPattern color={resolvedColor} />}

      {/* Card content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default Card;
