import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, ArrowRight, Send } from 'lucide-react';
import { toast } from './Toast';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './RealPlatformIcons';
import { motion } from 'framer-motion';

const platforms = [
    { name: 'Авито', icon: AvitoIcon, color: 'from-[#ff5e5b] to-[#00aaff]', pricePerReview: 400, avgConversion: 2.5 },
    { name: 'Яндекс Карты', icon: YandexIcon, color: 'from-[#f23030] to-[#ff6b6b]', pricePerReview: 700, avgConversion: 3.0 },
    { name: 'Google Maps', icon: GoogleMapsIcon, color: 'from-[#ea4335] to-[#4285f4]', pricePerReview: 300, avgConversion: 2.0 },
    { name: '2GIS', icon: TwoGisIcon, color: 'from-[#5cb813] to-[#82db34]', pricePerReview: 500, avgConversion: 2.8 },
];

const ROICalculator: React.FC = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(0);
    const [currentRating, setCurrentRating] = useState(3.5);
    const [reviewCount, setReviewCount] = useState(20);
    const [existingReviews, setExistingReviews] = useState(10);

    const calc = useMemo(() => {
        const platform = platforms[selectedPlatform];

        // Discount tiers
        let discount = 0;
        if (reviewCount >= 50) discount = 0.25;
        else if (reviewCount >= 30) discount = 0.15;
        else if (reviewCount >= 10) discount = 0.10;

        const totalCost = Math.round(platform.pricePerReview * reviewCount * (1 - discount));
        const costPerReview = Math.round(totalCost / reviewCount);

        // New rating projection: weighted average
        const newReviewRating = 5.0;
        const totalReviewsAfter = existingReviews + reviewCount;
        const projectedRating = Math.min(5.0,
            ((currentRating * existingReviews) + (newReviewRating * reviewCount)) / totalReviewsAfter
        );
        const ratingIncrease = projectedRating - currentRating;

        // ROI estimation: each 0.1 star increase ~ X% more customers
        const conversionBoost = ratingIncrease * platform.avgConversion * 10;

        // Avg revenue per customer assumption: 2000₽, 100 visitors/month
        const estimatedExtraRevenue = Math.round(conversionBoost / 100 * 100 * 2000);
        const roi = totalCost > 0 ? Math.round((estimatedExtraRevenue / totalCost) * 100) : 0;

        return {
            totalCost,
            costPerReview,
            projectedRating: Math.round(projectedRating * 10) / 10,
            ratingIncrease: Math.round(ratingIncrease * 10) / 10,
            conversionBoost: Math.round(conversionBoost),
            estimatedExtraRevenue,
            roi,
            discount: Math.round(discount * 100),
            totalReviewsAfter,
        };
    }, [selectedPlatform, currentRating, reviewCount, existingReviews]);

    const shareROICalculation = () => {
        const storedRef = localStorage.getItem('referral_code') || '';
        const refParam = storedRef ? `?ref=${storedRef}` : '';
        const shareUrl = `${window.location.origin}${refParam}`;
        const shareText = `Я рассчитал окупаемость на Noxiss.work: поднятие рейтинга на ${platforms[selectedPlatform].name} на +${calc.ratingIncrease} увеличит количество клиентов на +${calc.conversionBoost}% и принесет +${calc.estimatedExtraRevenue.toLocaleString('ru-RU')} ₽ доп. выручки в месяц! Рассчитайте окупаемость для своего бизнеса:`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        toast.success('Ссылка и текст скопированы!');
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    };

    const platform = platforms[selectedPlatform];

    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
                        Рассчитайте стоимость <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">продвижения</span>
                    </h2>
                    <p className="text-zinc-500 max-w-xl">Узнайте, сколько стоит поднять рейтинг и как это повлияет на ваш бизнес</p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Controls */}
                    <div className="lg:col-span-3 bg-white dark:bg-zinc-800/60 rounded-2xl p-6 md:p-8 border border-zinc-100 dark:border-zinc-700/50 shadow-card">
                        {/* Platform selector */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 block">Площадка</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {platforms.map((p, i) => (
                                    <button
                                        key={p.name}
                                        onClick={() => setSelectedPlatform(i)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-[0.98] ${selectedPlatform === i
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                                            }`}
                                    >
                                        <p.icon size={16} /> {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Current rating */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Текущий рейтинг</label>
                                <span className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1"><Star size={16} className="text-amber-400 fill-amber-400" /> {currentRating}</span>
                            </div>
                            <input
                                type="range"
                                min="1.0"
                                max="4.9"
                                step="0.1"
                                value={currentRating}
                                onChange={e => setCurrentRating(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                <span>1.0</span><span>4.9</span>
                            </div>
                        </div>

                        {/* Existing reviews */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Отзывов сейчас</label>
                                <span className="text-lg font-bold text-zinc-900 dark:text-white">{existingReviews}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                step="1"
                                value={existingReviews}
                                onChange={e => setExistingReviews(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                <span>0</span><span>200</span>
                            </div>
                        </div>

                        {/* New reviews count */}
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Заказать отзывов</label>
                                <span className="text-lg font-bold text-zinc-900 dark:text-white">{reviewCount} шт.</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="1"
                                value={reviewCount}
                                onChange={e => setReviewCount(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                                <span>5</span><span>100</span>
                            </div>
                        </div>

                        {calc.discount > 0 && (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-2 rounded-xl text-center">
                                Скидка {calc.discount}% за объём!
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Price card */}
                        <div className="bg-white dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl p-6 shadow-card relative overflow-hidden">
                            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Стоимость</div>
                            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{calc.totalCost.toLocaleString('ru-RU')} ₽</div>
                            <div className="text-sm text-zinc-400">{calc.costPerReview}₽ за отзыв</div>
                        </div>

                        {/* Rating projection */}
                        <div className="bg-white dark:bg-zinc-800/60 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-700/50 shadow-card">
                            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Прогноз рейтинга</div>
                            <div className="flex items-end gap-4">
                                <div className="text-center">
                                    <div className="text-sm text-zinc-400 mb-1">Сейчас</div>
                                    <div className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-1"><Star size={18} className="text-amber-400 fill-amber-400" /> {currentRating}</div>
                                </div>
                                <div className="text-2xl text-zinc-300 mb-1">&rarr;</div>
                                <div className="text-center">
                                    <div className="text-sm text-emerald-500 mb-1 font-semibold">+{calc.ratingIncrease}</div>
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Star size={18} className="text-amber-400 fill-amber-400" /> {calc.projectedRating}</div>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-zinc-400">Всего отзывов: {calc.totalReviewsAfter}</div>
                        </div>

                        {/* ROI */}
                        <div className="bg-white dark:bg-zinc-800/60 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-700/50 shadow-card">
                            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1"><TrendingUp size={12} /> Ожидаемый ROI</div>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">+{calc.conversionBoost}%</div>
                            <div className="text-sm text-zinc-500">Рост количества клиентов</div>
                            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700/50">
                                <div className="text-xs text-zinc-400">Доп. выручка / мес (оценка)</div>
                                <div className="text-xl font-bold text-zinc-900 dark:text-white">+{calc.estimatedExtraRevenue.toLocaleString('ru-RU')} ₽</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/business-prices"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-glow active:scale-[0.98] transition-all text-base"
                            >
                                Заказать сейчас <ArrowRight size={18} />
                            </Link>
                            <button
                                onClick={shareROICalculation}
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold rounded-xl transition-all text-base border border-zinc-200 dark:border-zinc-700 active:scale-[0.98]"
                            >
                                <Send size={18} className="text-emerald-500" /> Поделиться результатом
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ROICalculator;
