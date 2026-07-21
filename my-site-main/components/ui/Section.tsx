import React, { Suspense, useMemo } from 'react';

// --- Interfaces ---

export interface DecorativeElement {
  type: 'blob' | 'grid' | 'dots' | 'lines' | 'geometric';
  position: { top?: string; left?: string; right?: string; bottom?: string };
  opacity: number; // 0.03–0.15
  size: string;
  className?: string;
}

export interface SectionProps {
  variant: 'light' | 'dark' | 'accent' | 'textured';
  children: React.ReactNode;
  className?: string;
  decorElements?: DecorativeElement[];
  id?: string;
}

// --- Default decorative elements (used when fewer than 2 provided) ---

const DEFAULT_DECOR_ELEMENTS: DecorativeElement[] = [
  {
    type: 'dots',
    position: { top: '10%', right: '5%' },
    opacity: 0.05,
    size: '120px',
  },
  {
    type: 'geometric',
    position: { bottom: '15%', left: '3%' },
    opacity: 0.04,
    size: '80px',
  },
];

// --- Lazy-loaded SVG decorative components ---

const LazyBlobDecor = React.lazy(() =>
  Promise.resolve({
    default: ({ opacity, size, className }: { opacity: number; size: string; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        <path
          d="M44.7,-76.4C58.8,-69.2,71.8,-58.7,79.6,-45.2C87.4,-31.7,90,-15.8,88.5,-0.9C87,14.1,81.4,28.1,73.1,40.3C64.8,52.5,53.8,62.8,41,70.1C28.2,77.4,14.1,81.7,-0.8,83.1C-15.7,84.5,-31.5,83,-44.5,76.1C-57.5,69.2,-67.8,56.9,-75.2,43.2C-82.5,29.5,-87,14.8,-86.3,0.4C-85.6,-14,-79.7,-28,-71.2,-39.9C-62.7,-51.8,-51.6,-61.6,-39,-68.8C-26.4,-76,-13.2,-80.6,1.2,-82.7C15.6,-84.7,30.5,-83.6,44.7,-76.4Z"
          fill="currentColor"
          transform="translate(100 100)"
        />
      </svg>
    ),
  })
);

const LazyGridDecor = React.lazy(() =>
  Promise.resolve({
    default: ({ opacity, size, className }: { opacity: number; size: string; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        {Array.from({ length: 10 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 10 + 3}
              y={row * 10 + 3}
              width="4"
              height="4"
              rx="1"
              fill="currentColor"
            />
          ))
        )}
      </svg>
    ),
  })
);

const LazyDotsDecor = React.lazy(() =>
  Promise.resolve({
    default: ({ opacity, size, className }: { opacity: number; size: string; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 12.5 + 6.25}
              cy={row * 12.5 + 6.25}
              r="2"
              fill="currentColor"
            />
          ))
        )}
      </svg>
    ),
  })
);

const LazyLinesDecor = React.lazy(() =>
  Promise.resolve({
    default: ({ opacity, size, className }: { opacity: number; size: string; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 18 + 5}
            x2="100"
            y2={i * 18 + 5}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
      </svg>
    ),
  })
);

const LazyGeometricDecor = React.lazy(() =>
  Promise.resolve({
    default: ({ opacity, size, className }: { opacity: number; size: string; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className={className}
        style={{ opacity }}
        aria-hidden="true"
      >
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="currentColor" strokeWidth="1" />
        <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    ),
  })
);

// --- Decor type → lazy component map ---

const DECOR_COMPONENT_MAP = {
  blob: LazyBlobDecor,
  grid: LazyGridDecor,
  dots: LazyDotsDecor,
  lines: LazyLinesDecor,
  geometric: LazyGeometricDecor,
} as const;

// --- Variant background classes ---

const VARIANT_CLASSES: Record<SectionProps['variant'], string> = {
  light: 'bg-surface-primary text-text-primary',
  dark: 'bg-surface-dark text-white',
  accent: 'bg-surface-accent text-text-primary',
  textured: 'bg-surface-primary text-text-primary',
};

// --- Clamp decorative elements: min 2, max 6 ---

export function clampDecorElements(elements: DecorativeElement[] | undefined): DecorativeElement[] {
  if (!elements || elements.length === 0) {
    return DEFAULT_DECOR_ELEMENTS;
  }

  if (elements.length < 2) {
    // Fill up to 2 with defaults
    const needed = 2 - elements.length;
    return [...elements, ...DEFAULT_DECOR_ELEMENTS.slice(0, needed)];
  }

  if (elements.length > 6) {
    return elements.slice(0, 6);
  }

  return elements;
}

// --- Clamp opacity to allowed range ---

function clampOpacity(opacity: number): number {
  return Math.max(0.03, Math.min(0.15, opacity));
}

// --- Section Component ---

export const Section: React.FC<SectionProps> = ({
  variant,
  children,
  className = '',
  decorElements,
  id,
}) => {
  const resolvedDecor = useMemo(() => clampDecorElements(decorElements), [decorElements]);

  return (
    <section
      id={id}
      className={`relative overflow-hidden py-16 md:py-24 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {/* Layer 1: Solid background — handled by VARIANT_CLASSES on the section element */}

      {/* Layer 2: Semi-transparent texture/pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      >
        {variant === 'textured' ? (
          <svg
            className="h-full w-full"
            style={{ opacity: 0.05 }}
            aria-hidden="true"
          >
            <defs>
              <pattern id="texture-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#texture-pattern)" />
          </svg>
        ) : (
          <svg
            className="h-full w-full"
            style={{ opacity: 0.03 }}
            aria-hidden="true"
          >
            <defs>
              <pattern id="subtle-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#subtle-grid)" />
          </svg>
        )}
      </div>

      {/* Layer 3: Absolutely-positioned SVG decorative elements */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          {resolvedDecor.map((element, index) => {
            const DecorComponent = DECOR_COMPONENT_MAP[element.type];
            return (
              <div
                key={`${element.type}-${index}`}
                className={`absolute pointer-events-none ${element.className || ''}`}
                style={{
                  top: element.position.top,
                  left: element.position.left,
                  right: element.position.right,
                  bottom: element.position.bottom,
                }}
              >
                <DecorComponent
                  opacity={clampOpacity(element.opacity)}
                  size={element.size}
                />
              </div>
            );
          })}
        </Suspense>
      </div>

      {/* Content layer — higher z-index so it's above decorative elements */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

export default Section;
