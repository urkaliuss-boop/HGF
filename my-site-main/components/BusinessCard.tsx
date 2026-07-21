import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap, TrendingUp, Crown, MessageCircle, ChevronLeft } from 'lucide-react';

const CATEGORIES = ['Авито', 'Яндекс Карты', 'Google Maps', '2ГИС', 'Другое'];

const PRICING_DATA: Record<string, {
    title: string;
    subtitle: string;
    packages: Array<{
        name: string;
        price: string;
        desc: string;
        icon: React.ElementType;
        iconColors: string;
        isHit?: boolean;
        features: Array<{ text: React.ReactNode; isZap?: boolean }>;
    }>
}> = {
    'Авито': {
        title: "Прайс-лист: Управление репутацией",
        subtitle: "на Авито под ключ",
        packages: [
            {
                name: "Пакет «Старт»",
                price: "2 000 ₽",
                desc: "Идеально для прогрева новых профилей и разового поднятия рейтинга.",
                icon: Star,
                iconColors: "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white",
                features: [
                    { text: <><strong className="dark:text-white">5 отзывов</strong> от реальных людей</> },
                    { text: "Написание естественных текстов (без шаблонов)" },
                    { text: "Безопасный график (1 отзыв в 2–3 дня)" },
                    { text: "Гарантия от удаления (переделываем бесплатно)" }
                ]
            },
            {
                name: "Уверенный рост",
                price: "4 000 ₽",
                desc: "Оптимальный вариант для стабильного перекрытия конкурентов.",
                icon: TrendingUp,
                iconColors: "bg-gradient-to-br from-[#0071e3] to-[#2997ff] text-white shadow-lg",
                isHit: true,
                features: [
                    { text: "Всё из пакета «Старт»", isZap: false },
                    { text: <><strong className="text-white">10 отзывов + 1 в подарок</strong> (11 шт.)</>, isZap: false },
                    { text: <><strong className="text-white">Включен «Белый шум»:</strong> пустые диалоги для защиты от теневого бана</>, isZap: true },
                    { text: "Добавление в «Избранное» (рост выдачи)", isZap: false }
                ]
            },
            {
                name: "Лидер ниши",
                price: "7 500 ₽",
                desc: "Для агрессивного захвата топа в конкурентных нишах (ремонт, стройка).",
                icon: Crown,
                iconColors: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                features: [
                    { text: <><strong className="dark:text-white">20 отзывов</strong> (Выгода 500 ₽)</> },
                    { text: "Комплексная имитация активности (звонки, сбросы, подписки)" },
                    { text: "Выделенный менеджер (полный контроль)" }
                ]
            }
        ]
    },
    'Яндекс Карты': {
        title: "Продвижение на картах:",
        subtitle: "Яндекс Карты под ключ",
        packages: [
            {
                name: "Пакет «Базовый»",
                price: "3 500 ₽",
                desc: "Для новых карточек или поддержания текущего рейтинга.",
                icon: Star,
                iconColors: "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white",
                features: [
                    { text: <><strong className="dark:text-white">5 отзывов</strong> с прокачанных аккаунтов (3+ уровень)</> },
                    { text: "Учет строгой модерации Яндекса" },
                    { text: "Построение маршрутов перед отзывом" },
                    { text: "Гарантия публикации 100%" }
                ]
            },
            {
                name: "Региональный Топ",
                price: "6 500 ₽",
                desc: "Для быстрого вывода карточки в топ по городу и району.",
                icon: TrendingUp,
                iconColors: "bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg",
                isHit: true,
                features: [
                    { text: "Всё из пакета «Базовый»", isZap: false },
                    { text: <><strong className="text-white">10 отзывов (с фото и чеками)</strong></>, isZap: false },
                    { text: <><strong className="text-white">Имитация посещений:</strong> поиск конкурентов, клики по телефону</>, isZap: true },
                    { text: "Естественный тайминг (1-2 отзыва в неделю)", isZap: false }
                ]
            },
            {
                name: "Агрессивный рост",
                price: "12 000 ₽",
                desc: "Для высококонкурентных гео-запросов (рестораны, клиники, автосервисы).",
                icon: Crown,
                iconColors: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                features: [
                    { text: <><strong className="dark:text-white">20 отзывов</strong> высшего траста</> },
                    { text: "Сценарии посещений из разных районов города" },
                    { text: "Вопросы и ответы в карточке организации" }
                ]
            }
        ]
    },
    'Google Maps': {
        title: "Продвижение в поиске:",
        subtitle: "Google Maps Local SEO",
        packages: [
            {
                name: "Local Старт",
                price: "3 000 ₽",
                desc: "Безопасное появление в выдаче Google Maps.",
                icon: Star,
                iconColors: "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white",
                features: [
                    { text: <><strong className="dark:text-white">5 отзывов</strong> (Local Guides 4+ уровня)</> },
                    { text: "Отзывы с английских и русских IP/устройств" },
                    { text: "Вхождение ключевых слов в текст отзыва" },
                    { text: "Пожизненная гарантия от списания" }
                ]
            },
            {
                name: "Google Топ",
                price: "5 500 ₽",
                desc: "Увеличение показов карточки на 30-50% в органике.",
                icon: TrendingUp,
                iconColors: "bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-lg",
                isHit: true,
                features: [
                    { text: "Всё из пакета «Local Старт»", isZap: false },
                    { text: <><strong className="text-white">10 отзывов (геотаргетинг)</strong></>, isZap: false },
                    { text: <><strong className="text-white">Поведенческие факторы:</strong> прокладка маршрута, просмотр фото</>, isZap: true },
                    { text: "Ускорение индексации", isZap: false }
                ]
            },
            {
                name: "Монополист Google",
                price: "9 900 ₽",
                desc: "Максимальный охват в Google для сетей и крупных гео.",
                icon: Crown,
                iconColors: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                features: [
                    { text: <><strong className="dark:text-white">20 отзывов</strong> от премиум-аккаунтов</> },
                    { text: "Отзывы с реальными фото клиента/заведения" },
                    { text: "Массовые клики на 'Позвонить' и 'Сайт'" }
                ]
            }
        ]
    },
    '2ГИС': {
        title: "Продвижение в справочнике:",
        subtitle: "2ГИС под ключ",
        packages: [
            {
                name: "База 2ГИС",
                price: "2 500 ₽",
                desc: "Первые безопасные отзывы.",
                icon: Star,
                iconColors: "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white",
                features: [
                    { text: <><strong className="dark:text-white">5 отзывов</strong></> },
                    { text: "Реальные пользователи" },
                    { text: "Гарантия публикации" }
                ]
            },
            {
                name: "Рейтинг 5.0",
                price: "4 500 ₽",
                desc: "Для перекрытия негатива и выхода в топ рубрики.",
                icon: TrendingUp,
                iconColors: "bg-gradient-to-br from-[#9dc828] to-[#7aa41d] text-white shadow-lg",
                isHit: true,
                features: [
                    { text: "Всё из пакета «База»", isZap: false },
                    { text: <><strong className="text-white">10 отзывов</strong></>, isZap: false },
                    { text: <><strong className="text-white">Имитация поиска:</strong> поиск по рубрике, переход в карточку</>, isZap: true }
                ]
            },
            {
                name: "Максимум",
                price: "8 000 ₽",
                desc: "Интенсивный рост рейтинга.",
                icon: Crown,
                iconColors: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                features: [
                    { text: <><strong className="dark:text-white">20 отзывов</strong></> },
                    { text: "Сценарии сложного поведения" },
                    { text: "Выделенный менеджер" }
                ]
            }
        ]
    },
    'Другое': {
        title: "Индивидуальное продвижение:",
        subtitle: "Отзовики, AppStore, Google Play",
        packages: [
            {
                name: "Консультация",
                price: "Бесплатно",
                desc: "Обсуждение проекта и подбор площадок.",
                icon: MessageCircle,
                iconColors: "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white",
                features: [
                    { text: "Анализ текущей репутации" },
                    { text: "Выбор стратегии" }
                ]
            },
            {
                name: "Кастомный тариф",
                price: "от 5 000 ₽",
                desc: "Соберем пакет под ваши нужды (Zoon, ПроДокторов и др.).",
                icon: TrendingUp,
                iconColors: "bg-gradient-to-br from-slate-700 to-black text-white shadow-lg",
                isHit: true,
                features: [
                    { text: "Любые площадки" },
                    { text: "Индивидуальные сценарии" },
                    { text: <><strong className="text-white">Сложные тех. задания</strong></>, isZap: true }
                ]
            },
            {
                name: "VIP Сопровождение",
                price: "от 20 000 ₽",
                desc: "Полный аутсорс ORM (управления репутацией).",
                icon: Crown,
                iconColors: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
                features: [
                    { text: "Мониторинг сети 24/7" },
                    { text: "Вытеснение негатива из поиска" },
                    { text: "Отчетность каждую неделю" }
                ]
            }
        ]
    }
};

const BusinessCard = () => {
    const [activeCategory, setActiveCategory] = useState<string>('Авито');
    const [sliderValue, setSliderValue] = useState<number>(10);
    const currentData = PRICING_DATA[activeCategory] || PRICING_DATA['Авито'];

    // Calculator Logic
    const getBasePrice = (category: string) => {
        switch (category) {
            case 'Яндекс Карты': return 700;
            case 'Google Maps': return 600;
            case '2ГИС': return 500;
            case 'Авито': return 400;
            default: return 500;
        }
    };

    const basePrice = getBasePrice(activeCategory);
    let discount = 0;
    if (sliderValue >= 50) discount = 0.25;
    else if (sliderValue >= 20) discount = 0.15;
    else if (sliderValue >= 10) discount = 0.10;

    const totalPrice = Math.floor(basePrice * sliderValue * (1 - discount));
    const oldPrice = basePrice * sliderValue;

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black pt-24 pb-12 px-4 font-sans">

            {/* Кнопка Назад */}
            <div className="max-w-6xl mx-auto mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0071e3] transition-colors font-medium text-sm">
                    <ChevronLeft size={16} /> Назад на главную
                </Link>
            </div>

            {/* Классический ползунок категорий */}
            <div className="max-w-6xl mx-auto mb-10 overflow-x-auto pb-2 scrollbar-hide flex justify-center">
                <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                                ${activeCategory === cat
                                    ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black shadow-lg transform scale-105'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-[#1c1c1e] dark:text-slate-400 dark:hover:bg-[#2c2c2e]'
                                }
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Заголовок */}
            <div className="text-center max-w-3xl mx-auto mb-16 px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-bold uppercase tracking-wider mb-4 border border-[#0071e3]/20">
                    Для бизнеса
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] dark:text-white mb-6 leading-tight transition-all duration-300">
                    {currentData.title} <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#2997ff]">
                        {currentData.subtitle}
                    </span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Безопасное поднятие рейтинга живыми людьми. Гарантия от списаний для {activeCategory}.
                </p>
            </div>

            {/* Сетка тарифов */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start relative z-10">
                {currentData.packages.map((pkg, idx) => {
                    const Icon = pkg.icon;
                    const isHit = pkg.isHit;

                    if (isHit) {
                        return (
                            <div key={idx} className="bg-[#1c1c1e] dark:bg-[#151517] rounded-3xl p-8 border-2 border-[#0071e3] shadow-2xl shadow-blue-500/20 relative transform md:-translate-y-4 z-20">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-[#2997ff] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg whitespace-nowrap">
                                    Хит продаж
                                </div>

                                <div className="mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${pkg.iconColors}`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">{pkg.price}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-2">{pkg.desc}</p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {pkg.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3 text-sm text-white">
                                            {feature.isZap ? (
                                                <Zap size={18} className="text-yellow-400 shrink-0 mt-0.5 fill-yellow-400" />
                                            ) : (
                                                <Check size={18} className="text-[#0071e3] shrink-0 mt-0.5" />
                                            )}
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/business-cabinet" className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#2997ff] text-white font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30">
                                    Выбрать этот тариф
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 relative group">
                            <div className="mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${pkg.iconColors}`}>
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white">{pkg.name}</h3>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-[#1d1d1f] dark:text-white">{pkg.price}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">{pkg.desc}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {pkg.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                        <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                                        <span>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/business-cabinet" className="block w-full py-4 rounded-xl bg-slate-100 dark:bg-white/10 text-[#1d1d1f] dark:text-white font-bold text-center hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                                Заказать
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* ИНТЕРАКТИВНЫЙ КАЛЬКУЛЯТОР */}
            <div className="max-w-4xl mx-auto mt-20 relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#1d1d1f] dark:text-white mb-4">Свой объем? Рассчитайте стоимость</h2>
                    <p className="text-slate-500 dark:text-slate-400">Чем больше заданий, тем выгоднее цена за одно выполнение.</p>
                </div>

                <div className="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 w-full relative">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Количество заданий</span>
                                <span className="text-4xl font-black text-[#0071e3]">{sliderValue} шт.</span>
                            </div>

                            <div className="relative pt-4 pb-8">
                                <input
                                    type="range"
                                    min="5"
                                    max="100"
                                    step="5"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(Number(e.target.value))}
                                    className="w-full h-3 rounded-full appearance-none bg-slate-200 dark:bg-black/50 outline-none cursor-pointer slider-thumb-premium"
                                    style={{
                                        background: `linear-gradient(to right, #0071e3 ${(sliderValue - 5) / 95 * 100}%, rgba(148, 163, 184, 0.2) ${(sliderValue - 5) / 95 * 100}%)`
                                    }}
                                />
                                <div className="absolute left-0 -bottom-2 text-xs text-slate-400 font-bold">5 шт.</div>
                                <div className="absolute right-0 -bottom-2 text-xs text-slate-400 font-bold">100 шт.</div>
                            </div>

                            <div className="flex gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold shrink-0">
                                    <TrendingUp size={14} />
                                    Скидка {discount * 100}%
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold">
                                    {basePrice}₽ за 1 шт.
                                </span>
                            </div>
                        </div>

                        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-black/40 p-8 rounded-3xl border border-slate-200 dark:border-white/5 text-center shrink-0">
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">Итоговая стоимость</div>
                            <div className="text-5xl font-black text-[#1d1d1f] dark:text-white mb-2">{totalPrice.toLocaleString('ru-RU')} ₽</div>
                            {discount > 0 && (
                                <div className="text-sm text-slate-400 line-through decoration-red-500/50 mb-6 font-bold">{oldPrice.toLocaleString('ru-RU')} ₽</div>
                            )}
                            {discount === 0 && <div className="h-5 mb-6"></div>}

                            <a href="https://t.me/m/LOfp28FYYTRi" target="_blank" rel="noreferrer" className="block w-full py-4 rounded-xl bg-[#0071e3] hover:bg-blue-600 text-white font-bold text-center transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                                Заказать объем
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Call to Action */}
            <div className="max-w-4xl mx-auto mt-16 text-center">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-100 to-white dark:from-[#1c1c1e] dark:to-black border border-slate-200 dark:border-white/10 shadow-lg">
                    <h3 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-4">Индивидуальный заказ?</h3>
                    <p className="text-slate-500 mb-6 max-w-lg mx-auto">
                        Не нашли подходящую услугу для {activeCategory}? Напишите нам, мы подготовим персонализированное предложение для вашего бизнеса.
                    </p>
                    <a href="https://t.me/m/LOfp28FYYTRi" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#0071e3] dark:text-blue-400 font-bold hover:underline text-lg">
                        <MessageCircle size={20} />
                        Написать менеджеру в Telegram
                    </a>
                </div>
            </div>

        </div>
    );
};

export default BusinessCard;