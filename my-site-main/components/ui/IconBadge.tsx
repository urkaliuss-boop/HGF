import React from 'react';
import type { LucideIcon } from 'lucide-react';

// --- Types ---

export interface IconBadgeProps {
  icon: LucideIcon;
  color: string;           // Tailwind color class (e.g., 'blue-500')
  size?: 'sm' | 'md' | 'lg';
  animation?: 'pulse' | 'rotate' | 'bounce' | 'none';
  className?: string;
}

// --- Size configuration ---

const sizeConfig: Record<'sm' | 'md' | 'lg', { badge: number; icon: number }> = {
  sm: { badge: 32, icon: 16 },
  md: { badge: 48, icon: 24 },
  lg: { badge: 64, icon: 32 },
};

// --- Tailwind color → hex mapping ---

const TAILWIND_COLORS: Record<string, string> = {
  // Slate
  'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b',
  'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b',
  'slate-900': '#0f172a',
  // Gray
  'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280',
  'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937',
  'gray-900': '#111827',
  // Red
  'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca',
  'red-300': '#fca5a5', 'red-400': '#f87171', 'red-500': '#ef4444',
  'red-600': '#dc2626', 'red-700': '#b91c1c', 'red-800': '#991b1b',
  'red-900': '#7f1d1d',
  // Orange
  'orange-50': '#fff7ed', 'orange-100': '#ffedd5', 'orange-200': '#fed7aa',
  'orange-300': '#fdba74', 'orange-400': '#fb923c', 'orange-500': '#f97316',
  'orange-600': '#ea580c', 'orange-700': '#c2410c', 'orange-800': '#9a3412',
  'orange-900': '#7c2d12',
  // Amber
  'amber-50': '#fffbeb', 'amber-100': '#fef3c7', 'amber-200': '#fde68a',
  'amber-300': '#fcd34d', 'amber-400': '#fbbf24', 'amber-500': '#f59e0b',
  'amber-600': '#d97706', 'amber-700': '#b45309', 'amber-800': '#92400e',
  'amber-900': '#78350f',
  // Yellow
  'yellow-50': '#fefce8', 'yellow-100': '#fef9c3', 'yellow-200': '#fef08a',
  'yellow-300': '#fde047', 'yellow-400': '#facc15', 'yellow-500': '#eab308',
  'yellow-600': '#ca8a04', 'yellow-700': '#a16207', 'yellow-800': '#854d0e',
  'yellow-900': '#713f12',
  // Green
  'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0',
  'green-300': '#86efac', 'green-400': '#4ade80', 'green-500': '#22c55e',
  'green-600': '#16a34a', 'green-700': '#15803d', 'green-800': '#166534',
  'green-900': '#14532d',
  // Emerald
  'emerald-50': '#ecfdf5', 'emerald-100': '#d1fae5', 'emerald-200': '#a7f3d0',
  'emerald-300': '#6ee7b7', 'emerald-400': '#34d399', 'emerald-500': '#10b981',
  'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065f46',
  'emerald-900': '#064e3b',
  // Teal
  'teal-50': '#f0fdfa', 'teal-100': '#ccfbf1', 'teal-200': '#99f6e4',
  'teal-300': '#5eead4', 'teal-400': '#2dd4bf', 'teal-500': '#14b8a6',
  'teal-600': '#0d9488', 'teal-700': '#0f766e', 'teal-800': '#115e59',
  'teal-900': '#134e4a',
  // Cyan
  'cyan-50': '#ecfeff', 'cyan-100': '#cffafe', 'cyan-200': '#a5f3fc',
  'cyan-300': '#67e8f9', 'cyan-400': '#22d3ee', 'cyan-500': '#06b6d4',
  'cyan-600': '#0891b2', 'cyan-700': '#0e7490', 'cyan-800': '#155e75',
  'cyan-900': '#164e63',
  // Blue
  'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe',
  'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6',
  'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af',
  'blue-900': '#1e3a8a',
  // Indigo
  'indigo-50': '#eef2ff', 'indigo-100': '#e0e7ff', 'indigo-200': '#c7d2fe',
  'indigo-300': '#a5b4fc', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1',
  'indigo-600': '#4f46e5', 'indigo-700': '#4338ca', 'indigo-800': '#3730a3',
  'indigo-900': '#312e81',
  // Violet
  'violet-50': '#f5f3ff', 'violet-100': '#ede9fe', 'violet-200': '#ddd6fe',
  'violet-300': '#c4b5fd', 'violet-400': '#a78bfa', 'violet-500': '#8b5cf6',
  'violet-600': '#7c3aed', 'violet-700': '#6d28d9', 'violet-800': '#5b21b6',
  'violet-900': '#4c1d95',
  // Purple
  'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff',
  'purple-300': '#d8b4fe', 'purple-400': '#c084fc', 'purple-500': '#a855f7',
  'purple-600': '#9333ea', 'purple-700': '#7e22ce', 'purple-800': '#6b21a8',
  'purple-900': '#581c87',
  // Fuchsia
  'fuchsia-50': '#fdf4ff', 'fuchsia-100': '#fae8ff', 'fuchsia-200': '#f5d0fe',
  'fuchsia-300': '#f0abfc', 'fuchsia-400': '#e879f9', 'fuchsia-500': '#d946ef',
  'fuchsia-600': '#c026d3', 'fuchsia-700': '#a21caf', 'fuchsia-800': '#86198f',
  'fuchsia-900': '#701a75',
  // Pink
  'pink-50': '#fdf2f8', 'pink-100': '#fce7f3', 'pink-200': '#fbcfe8',
  'pink-300': '#f9a8d4', 'pink-400': '#f472b6', 'pink-500': '#ec4899',
  'pink-600': '#db2777', 'pink-700': '#be185d', 'pink-800': '#9d174d',
  'pink-900': '#831843',
  // Rose
  'rose-50': '#fff1f2', 'rose-100': '#ffe4e6', 'rose-200': '#fecdd3',
  'rose-300': '#fda4af', 'rose-400': '#fb7185', 'rose-500': '#f43f5e',
  'rose-600': '#e11d48', 'rose-700': '#be123c', 'rose-800': '#9f1239',
  'rose-900': '#881337',
};

/**
 * Resolves a Tailwind color class string (e.g., 'blue-500') to a hex color.
 * Falls back to the raw string if it looks like a hex/rgb/hsl value.
 */
function resolveColor(color: string): string {
  if (TAILWIND_COLORS[color]) {
    return TAILWIND_COLORS[color];
  }
  // If it already looks like a CSS color value, return as-is
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
    return color;
  }
  // Fallback: use CSS variable for accent
  return 'var(--accent-primary)';
}

/**
 * Converts a hex color to an rgba string with specified opacity.
 */
function hexToRgba(hex: string, opacity: number): string {
  // Handle CSS variables and non-hex values
  if (!hex.startsWith('#')) {
    return hex;
  }

  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// --- CSS Keyframes (injected once) ---

const KEYFRAMES_ID = 'icon-badge-keyframes';

function ensureKeyframes(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes icon-badge-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes icon-badge-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes icon-badge-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(style);
}

// --- Animation config ---

const animationStyles: Record<string, string> = {
  pulse: 'icon-badge-pulse 2s ease-in-out infinite',
  rotate: 'icon-badge-rotate 4s linear infinite',
  bounce: 'icon-badge-bounce 1.5s ease-in-out infinite',
  none: 'none',
};

// --- IconBadge component ---

export function IconBadge({
  icon: Icon,
  color,
  size = 'md',
  animation = 'none',
  className = '',
}: IconBadgeProps) {
  // Inject keyframes on first render
  React.useEffect(() => {
    ensureKeyframes();
  }, []);

  const { badge, icon: iconSize } = sizeConfig[size];
  const resolvedHex = resolveColor(color);
  const bgColor = resolvedHex.startsWith('#')
    ? hexToRgba(resolvedHex, 0.12)
    : resolvedHex;

  const badgeStyle: React.CSSProperties = {
    width: badge,
    height: badge,
    backgroundColor: bgColor,
    animation: animationStyles[animation] || 'none',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl ${className}`}
      style={badgeStyle}
      aria-hidden="true"
    >
      <Icon
        size={iconSize}
        style={{ color: resolvedHex }}
        strokeWidth={2}
      />
    </div>
  );
}

export default IconBadge;
