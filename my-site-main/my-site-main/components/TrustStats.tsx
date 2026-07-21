import React, { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ end, duration, prefix = '', suffix = '' }: { end: number, duration: number, prefix?: string, suffix?: string }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
            }
        });
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeProgress * end);
            setCount(currentCount);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(end);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration, isVisible]);

    return (
        <span ref={domRef}>
            {prefix}{count.toLocaleString('ru-RU')}{suffix}
        </span>
    );
};

export default function TrustStats() {
    return (
        <section className="py-16 bg-gradient-to-b from-transparent to-slate-50 dark:to-white/5 border-t border-slate-100 dark:border-white/5 relative z-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10">

                    <div className="p-6 md:p-0">
                        <div className="text-4xl md:text-5xl font-extrabold text-[#1d1d1f] dark:text-white mb-2 tracking-tight">
                            <AnimatedCounter end={24500} duration={2000} suffix="+" />
                        </div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Выполнено заданий
                        </div>
                    </div>

                    <div className="p-6 md:p-0">
                        <div className="text-4xl md:text-5xl font-extrabold text-[#0071e3] mb-2 tracking-tight drop-shadow-sm">
                            <AnimatedCounter end={1200} duration={2000} />
                        </div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Активных исполнителей
                        </div>
                    </div>

                    <div className="p-6 md:p-0">
                        <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#2997ff] mb-2 tracking-tight">
                            <AnimatedCounter end={500000} duration={2500} suffix=" ₽" />
                        </div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Выплачено пользователям
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
