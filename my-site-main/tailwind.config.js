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
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                background: '#F5F5F7',
                surface: {
                    primary: 'var(--surface-primary)',
                    secondary: 'var(--surface-secondary)',
                    accent: 'var(--surface-accent)',
                    dark: 'var(--surface-dark)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                accent: {
                    primary: 'var(--accent-primary)',
                    secondary: 'var(--accent-secondary)',
                    success: 'var(--accent-success)',
                    warning: 'var(--accent-warning)',
                },
                primary: { 500: '#0071E3', 600: '#0077ED' },
            },
            boxShadow: {
                apple: '0 4px 24px rgba(0, 0, 0, 0.06)',
                card: 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
                glow: '0 0 20px rgba(0, 113, 227, 0.3)',
                'glow-blue': 'var(--glow-blue, 0 0 40px rgba(0,113,227,0.3))',
                'glow-purple': 'var(--glow-purple, 0 0 40px rgba(88,86,214,0.3))',
            },
            borderRadius: {
                container: 'var(--radius-container)',
                card: 'var(--radius-card)',
                button: 'var(--radius-button)',
                badge: 'var(--radius-badge)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            transitionTimingFunction: {
                'out-expo': 'var(--ease-out-expo)',
            },
            transitionDuration: {
                micro: 'var(--duration-micro)',
                scroll: 'var(--duration-scroll)',
                theme: 'var(--duration-theme)',
            },
        },
    },
    plugins: [],
};
