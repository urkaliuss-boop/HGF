import React from 'react';

// --- Types ---

export interface BrandIconProps {
  brand: 'avito' | 'yandex' | '2gis' | 'google';
  size?: number;           // 24-32px
  withLabel?: boolean;
  className?: string;
}

// --- Brand metadata ---

const BRAND_LABELS: Record<BrandIconProps['brand'], string> = {
  avito: 'Авито',
  yandex: 'Яндекс',
  '2gis': '2ГИС',
  google: 'Google',
};

// --- SVG Icons ---

function AvitoSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="7.5" cy="7.5" r="4.5" fill="#97CF26" />
      <circle cx="16.5" cy="7.5" r="4.5" fill="#00AAFF" />
      <circle cx="7.5" cy="16.5" r="4.5" fill="#8B5CF6" />
      <circle cx="16.5" cy="16.5" r="4.5" fill="#FF6163" />
    </svg>
  );
}

function YandexSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="11" fill="#FC3F1D" />
      <path
        d="M13.5 7H12.2C10.7 7 9.8 7.9 9.8 9.2C9.8 10.7 10.4 11.4 11.8 12.3L12.9 13L9.7 18H11.5L14.3 13.5L13.1 12.6C11.9 11.8 11.4 11.3 11.4 9.9C11.4 8.8 12 8.2 13 8.2H13.5V18H15V7H13.5Z"
        fill="white"
      />
    </svg>
  );
}

function TwoGisSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="5" fill="#5CB813" />
      <path
        d="M8 10.5C8 8.6 9.6 7 11.5 7H13V8.5H11.5C10.4 8.5 9.5 9.4 9.5 10.5C9.5 11.3 10 11.9 10.7 12.2L8.5 14.5V15H13V13.5H10.8L12.5 11.7C12.8 11.4 13 10.9 13 10.5C13 10.1 12.9 9.7 12.6 9.4"
        fill="white"
      />
      <text
        x="15"
        y="17"
        fill="white"
        fontSize="7"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
      >
        G
      </text>
    </svg>
  );
}

function GoogleSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// --- SVG component map ---

const BRAND_SVG: Record<BrandIconProps['brand'], React.FC<{ size: number }>> = {
  avito: AvitoSvg,
  yandex: YandexSvg,
  '2gis': TwoGisSvg,
  google: GoogleSvg,
};

// --- BrandIcon component ---

export function BrandIcon({
  brand,
  size = 28,
  withLabel = false,
  className = '',
}: BrandIconProps) {
  // Clamp size to 24-32px range
  const clampedSize = Math.min(32, Math.max(24, size));
  const label = BRAND_LABELS[brand];
  const SvgComponent = BRAND_SVG[brand];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="img"
      aria-label={label}
    >
      <SvgComponent size={clampedSize} />
      {withLabel && (
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
    </span>
  );
}

export default BrandIcon;
