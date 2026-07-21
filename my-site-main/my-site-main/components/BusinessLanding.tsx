import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Shield, Clock, Users,
    CheckCircle, Zap, Eye,
    ShoppingBag, MapPin, Globe, Map
} from 'lucide-react';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './RealPlatformIcons';
import ROICalculator from './ROICalculator';

// Define animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const advantages = [
    {
        icon: Shield,
        title: 'Гарантия публикации',
        desc: 'Если отзыв удалён модерацией — переделываем за свой счет.',
    },
    {
        icon: Users,
        title: 'Реальные аккаунты',
        desc: 'Прогретые профили с историей активности и покупками.',
    },
    {
        icon: Clock,
        title: 'Естественный график',
        desc: 'Публикуем с правильными интервалами. Алгоритмы не заподозрят.',
    },
    {
        icon: Zap,
        title: 'Быстрый старт',
        desc: 'Запуск в работу и первые результаты уже через 24 часа.',
    },
];

const miniCases = [
    { platform: 'Авито', icon: AvitoIcon, before: 3.2, after: 4.7, reviews: 35 },
    { platform: 'Яндекс Карты', icon: YandexIcon, before: 3.8, after: 4.9, reviews: 40 },
    { platform: 'Google Maps', icon: GoogleMapsIcon, before: 4.0, after: 4.8, reviews: 45 },
    { platform: '2GIS', icon: TwoGisIcon, before: 3.5, after: 4.6, reviews: 30 },
];

const faqItems = [
    {
        q: 'Это безопасно для моей карточки?',
        a: 'Да. Мы используем только реальные аккаунты с историей, публикуем отзывы с естественной периодичностью.',
    },
    {
        q: 'Что если отзыв удалят?',
        a: 'Мы предоставляем гарантию от удаления. Если отзыв будет удалён — переделаем его бесплатно.',
    },
    {
        q: 'Как быстро появятся первые отзывы?',
        a: 'Первые отзывы обычно появляются в течение 24 часов после модерации площадки.',
    },
    {
        q: 'Могу ли я контролировать текст отзывов?',
        a: 'Да, вы можете оставить ТЗ с ключевыми словами и пожеланиями по тональности.',
    },
];

const BusinessLanding: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] text-[#09090b] dark:text-zinc-100 font-sans selection:bg-[#0071e3] selection:text-white pt-20">
            
            {/* HERO SECTION - Left Aligned */}
            <section className="relative pt-16 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial="hidden" 
                        animate="visible" 
                        variants={staggerContainer}
                        className="max-w-2xl"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-8 border border-zinc-200 dark:border-zinc-700/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse"></span>
                            B2B Платформа
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-zinc-900 dark:text-white">
                            Рейтинг, который <br />
                            <span className="text-[#0071e3]">приводит клиентов.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-[28rem] leading-relaxed">
                            Управление репутацией на Авито, Яндекс Картах и 2GIS. Живые отзывы с гарантией от удаления.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/business-cabinet"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0071e3] text-white rounded-full font-medium transition-all hover:bg-[#005bb5] hover:scale-[0.98] active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                Начать работу
                            </Link>
                            <a
                                href="#calculator"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full font-medium transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-[0.98] active:scale-95"
                            >
                                Рассчитать ROI
                            </a>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> 850+ заказов</div>
                            <div className="flex items-center gap-2"><Shield size={16} className="text-[#0071e3]" /> Гарантия 30 дней</div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Visual - Abstract Representation of Growth */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="relative hidden lg:block h-[500px] w-full rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Glassmorphism elements representing rating cards */}
                        <div className="absolute top-1/4 left-1/4 w-64 p-6 rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-white/20 shadow-2xl z-20">
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                                <div className="flex gap-1 text-[#0071e3]">★★★★★</div>
                            </div>
                            <div className="w-3/4 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 mb-2"></div>
                            <div className="w-1/2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                        </div>
                        <div className="absolute bottom-1/3 right-1/4 w-56 p-5 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/10 shadow-xl z-10 translate-y-8 translate-x-8">
                            <div className="flex justify-between items-center mb-3">
                                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                                <div className="flex gap-1 text-[#0071e3]/60">★★★★★</div>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 mb-2"></div>
                        </div>
                        {/* Decorative gradient */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0071e3]/40 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-soft"></div>
                    </motion.div>
                </div>
            </section>

            {/* LOGO WALL */}
            <section className="py-10 border-y border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-xs font-semibold text-zinc-400 mb-8 uppercase tracking-widest">Работаем с площадками</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200"><ShoppingBag size={24} /> Авито</div>
                        <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200"><MapPin size={24} /> Яндекс Карты</div>
                        <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200"><Globe size={24} /> Google Maps</div>
                        <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200"><Map size={24} /> 2GIS</div>
                    </div>
                </div>
            </section>

            {/* BENTO GRID: How it works */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Процесс работы</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl">Полный цикл управления репутацией без вашего участия.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Bento cell 1: Wide */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}
                            whileHover={{ y: -8, transition: { type: "spring", stiffness: 100, damping: 20 } }}
                            className="md:col-span-2 rounded-[2rem] p-8 md:p-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-glow-sm transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-zinc-400 mb-4 tracking-widest uppercase">01</div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-[#0071e3] transition-colors">Аудит и стратегия</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-md text-lg leading-relaxed">Изучаем карточку вашей компании, анализируем конкурентов и составляем безопасный график публикаций.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] dark:opacity-5 group-hover:scale-110 group-hover:text-[#0071e3] transition-all duration-700">
                                <Eye size={240} />
                            </div>
                        </motion.div>

                        {/* Bento cell 2: Tall */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}
                            whileHover={{ y: -8, transition: { type: "spring", stiffness: 100, damping: 20 } }}
                            className="md:col-span-1 md:row-span-2 rounded-[2rem] p-8 md:p-10 bg-gradient-to-br from-[#0071e3] to-[#005bb5] text-white flex flex-col justify-between relative overflow-hidden shadow-lg shadow-blue-500/20 group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full mix-blend-overlay group-hover:bg-white/20 transition-colors duration-700"></div>
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-blue-200 mb-4 tracking-widest uppercase">02</div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">Написание и публикация</h3>
                                <p className="text-blue-100 mb-10 text-lg leading-relaxed">Наши копирайтеры создают уникальные тексты с учетом LSI-ключей для SEO-продвижения карточки.</p>
                                <ul className="space-y-4 text-sm text-blue-50">
                                    <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10"><CheckCircle size={18} className="text-white" /> Реальные аккаунты</li>
                                    <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10"><CheckCircle size={18} className="text-white" /> Естественные маршруты</li>
                                    <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10"><CheckCircle size={18} className="text-white" /> Разные IP и устройства</li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* Bento cell 3: Normal */}
                        <motion.div 
                            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}
                            whileHover={{ y: -8, transition: { type: "spring", stiffness: 100, damping: 20 } }}
                            className="md:col-span-2 rounded-[2rem] p-8 md:p-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-glow-sm transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-zinc-400 mb-4 tracking-widest uppercase">03</div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-[#0071e3] transition-colors">Рост метрик</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-md text-lg leading-relaxed">Вы получаете подробный отчет в личном кабинете. Рейтинг растет — увеличивается конверсия в лиды.</p>
                            </div>
                            <div className="mt-8 flex items-center justify-between text-sm font-medium relative z-10 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                                <span className="text-zinc-500 dark:text-zinc-400">Конверсия карточки</span>
                                <span className="text-green-500 dark:text-green-400 flex items-center gap-1.5 text-lg font-bold">+45% <ArrowRight size={18} className="-rotate-45" /></span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ADVANTAGES GRID */}
            <section className="py-24 md:py-32 px-6 bg-zinc-50/50 dark:bg-zinc-900/20 border-y border-zinc-100 dark:border-zinc-800/50">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Надежность в деталях</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">Мы не просто пишем отзывы — мы строим вашу репутацию системно.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {advantages.map((a, i) => (
                            <motion.div 
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }
                                }}
                                className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
                            >
                                <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-6">
                                    <a.icon size={20} className="text-[#0071e3]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{a.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{a.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MINI CASES */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Результаты клиентов</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Средний рост конверсии из просмотра в контакт составляет 45-60% после месяца работы.</p>
                        </div>
                        <Link to="/results" className="text-sm font-medium text-[#0071e3] hover:underline flex items-center gap-1.5 pb-2">
                            Все кейсы <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {miniCases.map((c, i) => (
                            <motion.div 
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.95 },
                                    visible: { opacity: 1, scale: 1, transition: { delay: i * 0.1, duration: 0.5 } }
                                }}
                                className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between h-[240px]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-700">
                                        <c.icon size={18} />
                                    </div>
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{c.platform}</span>
                                </div>
                                
                                <div>
                                    <div className="flex items-end justify-between mb-5">
                                        <div>
                                            <div className="text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Было</div>
                                            <div className="text-2xl font-bold text-zinc-400">{c.before}</div>
                                        </div>
                                        <ArrowRight size={20} className="text-zinc-300 dark:text-zinc-700 mb-2" />
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Стало</div>
                                            <div className="text-2xl font-bold text-[#0071e3]">{c.after}</div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <div className="text-xs text-zinc-500 font-medium">{c.reviews} отзывов опубликовано</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROI CALCULATOR */}
            <div id="calculator" className="pb-24">
                <ROICalculator />
            </div>

            {/* FAQ */}
            <section className="py-24 md:py-32 px-6 bg-zinc-50/50 dark:bg-zinc-900/20 border-y border-zinc-100 dark:border-zinc-800/50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">Частые вопросы</h2>
                    <div className="space-y-4">
                        {faqItems.map((item, i) => (
                            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full text-left p-6 flex justify-between items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <span className="font-semibold text-lg">{item.q}</span>
                                    <span className={`text-2xl transition-transform duration-300 text-zinc-400 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                                </button>
                                <div 
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {item.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEO LINKS */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {[
                            { platform: 'avito', city: 'moskva', label: 'Авито в Москве' },
                            { platform: 'avito', city: 'spb', label: 'Авито в СПб' },
                            { platform: 'yandex', city: 'moskva', label: 'Яндекс Карты в Москве' },
                            { platform: 'yandex', city: 'spb', label: 'Яндекс Карты в СПб' },
                            { platform: '2gis', city: 'moskva', label: '2ГИС в Москве' },
                            { platform: 'google', city: 'moskva', label: 'Google Maps в Москве' },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                to={`/otzyvy/${link.platform}/${link.city}`}
                                className="px-5 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 mb-12">
                <div className="max-w-5xl mx-auto text-center bg-zinc-900 dark:bg-zinc-800 rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0071e3]/30 via-transparent to-transparent pointer-events-none"></div>
                    
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10 tracking-tight">Готовы к росту?</h2>
                    <p className="text-zinc-400 text-xl mb-12 max-w-xl mx-auto relative z-10">
                        Оставьте конкурентов позади. Начните улучшать рейтинг уже сегодня.
                    </p>
                    <Link
                        to="/business-cabinet"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-white text-zinc-900 font-bold rounded-full text-lg transition-transform hover:scale-105 active:scale-95 relative z-10 shadow-2xl"
                    >
                        Начать работу <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default BusinessLanding;
