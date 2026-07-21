import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

// Avito colored circles logo
export const AvitoIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="7.5" cy="7.5" r="5" fill="#FF5E5B" />
        <circle cx="16.5" cy="7.5" r="5" fill="#7FD13B" />
        <circle cx="7.5" cy="16.5" r="5" fill="#8E44AD" />
        <circle cx="16.5" cy="16.5" r="5" fill="#00AAFF" />
    </svg>
);

// Yandex Maps logo: Red location pin with Cyrillic 'Я' inside a white circle
export const YandexIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C8.13 2 5 5.13 5 9C5 13.5 12 22 12 22C12 22 19 13.5 19 9C19 5.13 15.87 2 12 2Z" fill="#F23030" />
        <circle cx="12" cy="8.8" r="4.2" fill="white" />
        {/* Mirror letter R (Cyrillic Я) */}
        <path d="M13.2 6.5H12C11.1 6.5 10.6 7.1 10.6 7.9C10.6 8.7 11.1 9.2 12 9.2H13.2M13.2 6.5V11.2M13.2 9.2L11 11.2" stroke="#F23030" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Google Maps logo: Stylized colorful pin
export const GoogleMapsIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M19.5 9.5C19.5 14.5 12 21.5 12 21.5C12 21.5 4.5 14.5 4.5 9.5C4.5 5.3 7.8 2 12 2C16.2 2 19.5 5.3 19.5 9.5Z" fill="#EA4335" />
        <path d="M12 21.5C12 21.5 4.5 14.5 4.5 9.5C4.5 8.2 4.8 7 5.5 6L12 13V21.5Z" fill="#4285F4" />
        <path d="M12 2C14.8 2 17.2 3.5 18.5 5.8L12 13V2" fill="#FBBC05" />
        <path d="M4.5 9.5C4.5 8.2 4.8 7 5.5 6L12 2V13L4.5 9.5Z" fill="#34A853" />
        <circle cx="12" cy="7.5" r="2.5" fill="white" />
    </svg>
);

// 2GIS logo: Green background rounded square with white pin and green '2'
export const TwoGisIcon: React.FC<IconProps> = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="24" height="24" rx="5.5" fill="#5CB813" />
        <path d="M12 4C8.8 4 6.2 6.6 6.2 9.8C6.2 14.2 12 19.8 12 19.8C12 19.8 17.8 14.2 17.8 9.8C17.8 6.6 15.2 4 12 4Z" fill="white" />
        <path d="M10 9C10 7.9 10.9 7 12 7C13.1 7 14 7.9 14 9C14 9.8 13.4 10.4 12.6 10.8L10.5 12V13H14V14H9V12L11.5 10.5C12.3 10.1 12.5 9.7 12.5 9.2C12.5 8.7 12.1 8.3 11.5 8.3C10.9 8.3 10.5 8.7 10.5 9.2H10Z" fill="#5CB813" />
    </svg>
);
