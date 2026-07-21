/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './App.tsx',
        './index.tsx',
        './components/**/*.{ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                background: {
                    DEFAULT: '#fafafa',
                    dark: '#09090b',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    dark: '#18181b',
                },
                primary: {
                    400: '#38bdf8',
                    500: '#0071E3',
                    600: '#0077ED',
                    700: '#005bb5',
                },
                foreground: {
                    DEFAULT: '#18181b',
                    muted: '#71717a',
                },
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
                'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.32)',
                'glow': '0 0 24px rgba(0, 113, 227, 0.3)',
                'glow-sm': '0 0 12px rgba(0, 113, 227, 0.2)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.04)',
                'card-hover': '0 2px 8px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.08)',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-12px) rotate(1deg)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
            },
        },
    },
    plugins: [],
};
