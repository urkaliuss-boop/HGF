import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Small delay to let the initial animation finish
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto sm:max-w-2xl z-[100] animate-fade-in-up">
            <div className="bg-white/80 dark:bg-black/70 backdrop-blur-xl p-4 sm:pr-4 sm:pl-6 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-[#1d1d1f] dark:text-white mb-1 flex items-center gap-1.5">
                        <Cookie size={14} className="text-amber-500" /> Использование Cookies и Anti-Fraud
                    </h4>
                    <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                        Мы используем файлы cookie и системы цифровых отпечатков платформы для аналитики, сохранения сессий и защиты от мошенничества. Продолжая работу, вы соглашаетесь с <Link to="/privacy" className="text-[#0A84FF] hover:underline hover:text-[#0071E3] font-medium transition-colors">Политикой конфиденциальности</Link>.
                    </p>
                </div>
                <button
                    onClick={handleAccept}
                    className="shrink-0 w-full sm:w-auto px-6 py-2.5 bg-[#1d1d1f] dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all rounded-2xl text-xs font-bold shadow-lg"
                >
                    Понятно, согласен
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
