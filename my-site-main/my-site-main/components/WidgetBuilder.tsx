import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Check, ExternalLink, Code2, AlertCircle } from 'lucide-react';

interface WidgetBuilderProps {
    userId: string;
}

const WidgetBuilder: React.FC<WidgetBuilderProps> = ({ userId }) => {
    const [copied, setCopied] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [domain, setDomain] = useState('');
    const [setupDone, setSetupDone] = useState(false);
    const [stats, setStats] = useState({ rating: 4.8, reviews: 124, platform: 'Яндекс Карты' });

    // In a real app, this would fetch the user's connected business profile stats
    useEffect(() => {
        // Mock data fetch
        setStats({ rating: 4.9, reviews: 86, platform: 'Яндекс Карты' });
    }, [userId]);

    const widgetCode = `<div id="noxiss-widget"></div>
<script src="${window.location.origin}/widget.js" data-user="${userId}" data-theme="${theme}"></script>`;

    const copyCode = () => {
        navigator.clipboard.writeText(widgetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-lg mb-8">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white mb-2 flex items-center gap-2">
                    <Code2 className="text-blue-500" /> Виджет для сайта
                </h3>
                <p className="text-sm text-slate-500">
                    Установите виджет с вашим рейтингом на свой сайт. Это повышает доверие посетителей и увеличивает конверсию в заказ до 15%.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Setup */}
                <div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Тема виджета
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="theme"
                                    value="light"
                                    checked={theme === 'light'}
                                    onChange={() => setTheme('light')}
                                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Светлая</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="theme"
                                    value="dark"
                                    checked={theme === 'dark'}
                                    onChange={() => setTheme('dark')}
                                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Темная</span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                            HTML-код для вставки
                            <span className="text-xs font-normal text-slate-400">(Вставьте перед {'</body>'})</span>
                        </label>
                        <div className="relative">
                            <pre className="bg-slate-50 dark:bg-black/40 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-300 overflow-x-auto border border-slate-200 dark:border-white/10 font-mono">
                                {widgetCode}
                            </pre>
                            <button
                                onClick={copyCode}
                                className="absolute top-2 right-2 p-2 bg-white dark:bg-black rounded-lg shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-500/20">
                        <AlertCircle className="text-blue-500 shrink-0" size={20} />
                        <div className="text-xs text-blue-800 dark:text-blue-300">
                            Виджет содержит скрытую ссылку на профиль вашей компании.
                            Пользователи, перешедшие по ней и заказавшие наши услуги, станут вашими рефералами (вы получите 10% от их оплат).
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                        Предпросмотр
                    </label>
                    <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 flex items-center justify-center min-h-[250px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZTElM0QlM0QxMyIgZmlsbC1vcGFjaXR5PSIwLjQiLz4KPC9zdmc+')]">

                        {/* THE ACTUAL WIDGET PREVIEW */}
                        <div className={`${theme === 'dark' ? 'bg-[#1c1c1e] border-white/10' : 'bg-white border-slate-100'} border shadow-xl rounded-2xl p-4 w-64 hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -z-10"></div>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-lg">
                                    {stats.rating}
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                        Наш рейтинг
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        На основе {stats.reviews} отзывов
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pb-1">
                                <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {stats.platform}
                                </span>
                                <div className="flex text-amber-400">
                                    {'★'.repeat(Math.round(stats.rating))}
                                    {'☆'.repeat(5 - Math.round(stats.rating))}
                                </div>
                            </div>

                            {/* Hover overlay explaining referral link */}
                            <div className="absolute inset-0 bg-blue-600/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <ExternalLink className="text-white mb-2" size={24} />
                                <span className="text-white text-xs font-bold text-center px-4">
                                    Подтверждено Noxiss
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetBuilder;
