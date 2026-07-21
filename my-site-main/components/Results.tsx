import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, ArrowRight, ShoppingBag, MapPin, Globe, Map, CheckCircle, Users, Clock, Award } from 'lucide-react';

const cases = [
    {
        title: 'Автосервис «АвтоПро»',
        platform: 'Яндекс Карты',
        icon: MapPin,
        color: 'from-red-500 to-orange-500',
        ratingBefore: 3.2,
        ratingAfter: 4.7,
        reviewsBefore: 8,
        reviewsAfter: 43,
        period: '3 недели',
        result: 'Количество звонков выросло на 85%',
        category: 'Авто',
    },
    {
        title: 'Кофейня «Brew Bar»',
        platform: 'Авито',
        icon: ShoppingBag,
        color: 'from-blue-500 to-[#2997ff]',
        ratingBefore: 3.8,
        ratingAfter: 4.9,
        reviewsBefore: 12,
        reviewsAfter: 52,
        period: '1 месяц',
        result: 'Продажи через Авито +120%',
        category: 'Общепит',
    },
    {
        title: 'Стоматология «SmileDent»',
        platform: 'Google Maps',
        icon: Globe,
        color: 'from-blue-500 to-cyan-500',
        ratingBefore: 4.0,
        ratingAfter: 4.8,
        reviewsBefore: 22,
        reviewsAfter: 67,
        period: '2 месяца',
        result: 'Новых пациентов +60% в месяц',
        category: 'Медицина',
    },
    {
        title: 'Салон красоты «Luxe»',
        platform: '2GIS',
        icon: Map,
        color: 'from-green-500 to-emerald-500',
        ratingBefore: 3.5,
        ratingAfter: 4.6,
        reviewsBefore: 5,
        reviewsAfter: 35,
        period: '2 недели',
        result: 'Запись через 2GIS выросла в 3 раза',
        category: 'Красота',
    },
    {
        title: 'Доставка еды «YumBox»',
        platform: 'Яндекс Карты',
        icon: MapPin,
        color: 'from-red-500 to-orange-500',
        ratingBefore: 3.9,
        ratingAfter: 4.8,
        reviewsBefore: 30,
        reviewsAfter: 80,
        period: '1 месяц',
        result: 'Заказов стало больше на 95%',
        category: 'Общепит',
    },
    {
        title: 'Фитнес-клуб «IronBody»',
        platform: 'Google Maps',
        icon: Globe,
        color: 'from-blue-500 to-cyan-500',
        ratingBefore: 3.6,
        ratingAfter: 4.7,
        reviewsBefore: 15,
        reviewsAfter: 55,
        period: '3 недели',
        result: 'Новых абонементов +70%',
        category: 'Спорт',
    },
];

const stats = [
    { label: 'Выполненных заказов', value: 850, suffix: '+', icon: CheckCircle },
    { label: 'Довольных клиентов', value: 320, suffix: '+', icon: Users },
    { label: 'Средний рост рейтинга', value: 1.3, suffix: '★', icon: Star },
    { label: 'Среднее время', value: 14, suffix: ' дней', icon: Clock },
];

function AnimatedNumber({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const animated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animated.current) {
                    animated.current = true;
                    const isFloat = target % 1 !== 0;
                    const steps = 60;
                    const increment = target / steps;
                    let current = 0;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            setValue(target);
                            clearInterval(timer);
                        } else {
                            setValue(isFloat ? Math.round(current * 10) / 10 : Math.round(current));
                        }
                    }, duration / steps);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <div ref={ref} className="text-3xl md:text-4xl font-bold dark:text-white">{value}{suffix}</div>;
}

const Results: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black pt-24 pb-12 px-4 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <Award size={14} /> Результаты
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] dark:text-white mb-4 tracking-tight">
                        Реальные кейсы <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-[#2997ff]">наших клиентов</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Посмотрите, как наши отзывы помогают бизнесам расти. Конкретные цифры, реальные результаты.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 text-center border border-slate-100 dark:border-white/10 shadow-lg">
                            <s.icon className="mx-auto mb-3 text-blue-500" size={24} />
                            <AnimatedNumber target={s.value} suffix={s.suffix} />
                            <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Cases Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {cases.map((c, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-lg hover:shadow-2xl transition-shadow group"
                        >
                            {/* Header */}
                            <div className={`bg-gradient-to-r ${c.color} p-5 relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-[40px]"></div>
                                <div className="flex items-center gap-2 text-white/80 text-xs font-bold mb-2">
                                    <c.icon size={14} /> {c.platform}
                                </div>
                                <h3 className="text-lg font-bold text-white">{c.title}</h3>
                                <span className="inline-block mt-2 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">{c.category}</span>
                            </div>

                            {/* Rating comparison */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Было</div>
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-amber-400 fill-amber-400" />
                                            <span className="text-xl font-bold text-slate-400">{c.ratingBefore}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">{c.reviewsBefore} отзывов</div>
                                    </div>

                                    <div className="flex-1 mx-4 relative">
                                        <div className="h-0.5 bg-slate-200 dark:bg-white/10 w-full"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            <TrendingUp size={10} className="inline mr-0.5" />{c.period}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Стало</div>
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-amber-400 fill-amber-400" />
                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{c.ratingAfter}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">{c.reviewsAfter} отзывов</div>
                                    </div>
                                </div>

                                {/* Result */}
                                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 text-center">
                                    <div className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1.5">
                                        <TrendingUp size={16} /> {c.result}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center bg-gradient-to-br from-blue-600 to-[#0051a2] rounded-3xl p-10 md:p-16 shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Хотите такие же результаты?</h2>
                    <p className="text-blue-100 mb-8 max-w-lg mx-auto">Рассчитайте стоимость продвижения для вашего бизнеса и начните получать отзывы уже сегодня</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/business-cabinet" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                            Заказать отзывы <ArrowRight size={18} />
                        </Link>
                        <Link to="/business" className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2">
                            Подробнее о сервисе
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;
