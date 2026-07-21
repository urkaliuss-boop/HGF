import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, TrendingUp, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './RealPlatformIcons';

// Данные по городам
const CITIES: Record<string, { name: string, region: string, population: string }> = {
    'moskva': { name: 'Москве', region: 'Москва', population: '13 млн' },
    'spb': { name: 'Санкт-Петербурге', region: 'СПб', population: '5.6 млн' },
    'novosibirsk': { name: 'Новосибирске', region: 'Новосибирск', population: '1.6 млн' },
    'ekaterinburg': { name: 'Екатеринбурге', region: 'Екатеринбург', population: '1.5 млн' },
    'kazan': { name: 'Казани', region: 'Казань', population: '1.3 млн' },
    'nizhniy-novgorod': { name: 'Нижнем Новгороде', region: 'Нижний Новгород', population: '1.2 млн' },
    'chelyabinsk': { name: 'Челябинске', region: 'Челябинск', population: '1.1 млн' },
    'samara': { name: 'Самаре', region: 'Самара', population: '1.1 млн' },
    'omsk': { name: 'Омске', region: 'Омск', population: '1.1 млн' },
    'rostov': { name: 'Ростове-на-Дону', region: 'Ростов-на-Дону', population: '1.1 млн' },
    'ufa': { name: 'Уфе', region: 'Уфа', population: '1.1 млн' },
    'krasnoyarsk': { name: 'Красноярске', region: 'Красноярск', population: '1.1 млн' },
    'perm': { name: 'Перми', region: 'Пермь', population: '1 млн' },
    'voronezh': { name: 'Воронеже', region: 'Воронеж', population: '1 млн' },
    'volgograd': { name: 'Волгограде', region: 'Волгоград', population: '1 млн' },
    'krasnodar': { name: 'Краснодаре', region: 'Краснодар', population: '1 млн' },
    'tyumen': { name: 'Тюмени', region: 'Тюмень', population: '850 тыс' },
    'saratov': { name: 'Саратове', region: 'Саратов', population: '830 тыс' },
    'tolyatti': { name: 'Тольятти', region: 'Тольятти', population: '680 тыс' },
    'izhevsk': { name: 'Ижевске', region: 'Ижевск', population: '650 тыс' },
    'barnaul': { name: 'Барнауле', region: 'Барнаул', population: '630 тыс' },
    'vladivostok': { name: 'Владивостоке', region: 'Владивосток', population: '600 тыс' },
    'irkutsk': { name: 'Иркутске', region: 'Иркутск', population: '620 тыс' },
    'habarovsk': { name: 'Хабаровске', region: 'Хабаровск', population: '610 тыс' },
    'orenburg': { name: 'Оренбурге', region: 'Оренбург', population: '570 тыс' },
    'tomsk': { name: 'Томске', region: 'Томск', population: '570 тыс' },
    'kemerovo': { name: 'Кемерове', region: 'Кемерово', population: '550 тыс' },
    'ryazan': { name: 'Рязани', region: 'Рязань', population: '530 тыс' },
    'astrakhan': { name: 'Астрахани', region: 'Астрахань', population: '520 тыс' },
    'naberezhnye-chelny': { name: 'Набережных Челнах', region: 'Набережные Челны', population: '530 тыс' },
    'penza': { name: 'Пензе', region: 'Пенза', population: '510 тыс' },
    'lipetsk': { name: 'Липецке', region: 'Липецк', population: '500 тыс' },
    'kirov': { name: 'Кирове', region: 'Киров', population: '490 тыс' },
    'kaliningrad': { name: 'Калининграде', region: 'Калининград', population: '490 тыс' },
    'tula': { name: 'Туле', region: 'Тула', population: '470 тыс' },
    'cheboksary': { name: 'Чебоксарах', region: 'Чебоксары', population: '490 тыс' },
    'stavropol': { name: 'Ставрополе', region: 'Ставрополь', population: '450 тыс' },
    'sochi': { name: 'Сочи', region: 'Сочи', population: '440 тыс' },
    'minsk': { name: 'Минске', region: 'Минск', population: '2 млн' },
};

// Данные по площадкам
const PLATFORMS: Record<string, { name: string, fullName: string, icon: React.ComponentType<any>, description: string }> = {
    'avito': {
        name: 'Авито',
        fullName: 'Авито',
        icon: AvitoIcon,
        description: 'крупнейшая доска объявлений в России'
    },
    'yandex': {
        name: 'Яндекс Карты',
        fullName: 'Яндекс Картах',
        icon: YandexIcon,
        description: 'популярный картографический сервис'
    },
    '2gis': {
        name: '2ГИС',
        fullName: '2ГИС',
        icon: TwoGisIcon,
        description: 'точный справочник организаций'
    },
    'google': {
        name: 'Google Maps',
        fullName: 'Google Maps',
        icon: GoogleMapsIcon,
        description: 'глобальная карточная платформа'
    },
};

// Преимущества
const BENEFITS = [
    { title: 'Живые авторы', desc: 'Отзывы пишут реальные люди с уникальных аккаунтов' },
    { title: 'Гарантия от удаления', desc: 'Если отзыв удалят — бесплатная замена' },
    { title: 'Быстрый старт', desc: 'Первые отзывы появятся в течение 24 часов' },
    { title: 'Поддержка 24/7', desc: 'Персональный менеджер для каждого заказа' },
];

// Экспортируемые данные для использования в sitemap и других компонентах
export const SEO_CITIES = CITIES;
export const SEO_PLATFORMS = PLATFORMS;

const CityLanding: React.FC = () => {
    const { platform, city } = useParams<{ platform: string; city: string }>();

    const cityData = city ? CITIES[city] : null;
    const platformData = platform ? PLATFORMS[platform] : null;

    if (!cityData || !platformData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-[#1d1d1f] dark:text-white">Страница не найдена</h1>
                    <Link to="/" className="text-blue-500 hover:underline">На главную</Link>
                </div>
            </div>
        );
    }

    const title = `Купить отзывы на ${platformData.fullName} в ${cityData.name}`;
    const pageTitle = `Отзывы на ${platformData.fullName} в ${cityData.name}`;

    // Устанавливаем title через useEffect и внедряем JSON-LD микроразметку
    React.useEffect(() => {
        document.title = `${title} — NOXISS.WORK`;
        // Meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', `${title} от живых людей с гарантией. Быстрый старт, от 150₽ за отзыв. NOXISS.WORK — сервис управления репутацией в ${cityData.name}.`);

        // JSON-LD Schema
        let schemaScript = document.getElementById('jsonld-citylanding');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.setAttribute('type', 'application/ld+json');
            schemaScript.setAttribute('id', 'jsonld-citylanding');
            document.head.appendChild(schemaScript);
        }
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `Продвижение и отзывы на ${platformData.name} в г. ${cityData.region}`,
            "image": "https://noxiss-work.ru/og-image.png",
            "description": `Качественные отзывы и продвижение на ${platformData.fullName} в ${cityData.name} от живых людей с гарантией от удаления.`,
            "brand": {
                "@type": "Brand",
                "name": "NOXISS WORK"
            },
            "offers": {
                "@type": "Offer",
                "price": "150",
                "priceCurrency": "RUB",
                "availability": "https://schema.org/InStock",
                "url": window.location.href
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "120",
                "bestRating": "5"
            }
        };
        schemaScript.innerHTML = JSON.stringify(schemaData);

        return () => {
            const script = document.getElementById('jsonld-citylanding');
            if (script) script.remove();
        };
    }, [title, cityData, platformData]);

    return (
        <main className="min-h-screen bg-[#F5F5F7] dark:bg-black font-sans pt-28 pb-20 overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0071e3]/10 via-[#0071e3]/5 to-transparent pointer-events-none -z-10"></div>
            
            {/* Hero */}
            <section className="px-4 mb-16 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-[#0071e3] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-[#0071e3]/20 shadow-sm">
                        <MapPin size={14} /> {cityData.region}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-[#1d1d1f] dark:text-white mb-6 leading-tight flex flex-col md:flex-row items-center justify-center gap-3 animate-fade-in drop-shadow-sm">
                        <platformData.icon className="w-12 h-12 text-[#0071e3] shrink-0" /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d1d1f] to-slate-600 dark:from-white dark:to-slate-300">{pageTitle}</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
                        Закажите качественные отзывы на {platformData.fullName} в {cityData.name} от реальных людей.
                        Повысьте рейтинг и привлеките до <span className="text-[#0071e3] font-bold">45% больше клиентов</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/business-prices"
                            className="px-8 py-4 bg-[#0071e3] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <TrendingUp size={18} /> Заказать отзывы <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/business"
                            className="px-8 py-4 bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white font-bold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#2c2c2e] transition-all"
                        >
                            Подробнее о сервисе
                        </Link>
                    </div>
                </div>
            </section>

            {/* Преимущества */}
            <section className="px-4 mb-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1d1d1f] dark:text-white mb-10">
                        Почему выбирают <span className="text-blue-500">NOXISS.WORK</span> в {cityData.name}?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {BENEFITS.map((b, i) => (
                            <div key={i} className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-slate-200 dark:border-white/10 flex gap-4 items-start shadow-sm">
                                <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={22} />
                                <div>
                                    <h3 className="font-bold text-[#1d1d1f] dark:text-white mb-1">{b.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Как это работает */}
            <section className="px-4 mb-16 bg-slate-50 dark:bg-[#1c1c1e]/50 py-16 border-y border-slate-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1d1d1f] dark:text-white mb-10">
                        Как заказать отзывы на {platformData.name}?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Оставляете заявку', desc: `Указываете ссылку на ${platformData.name} и количество отзывов` },
                            { step: '02', title: 'Авторы пишут', desc: 'Реальные люди пишут уникальные отзывы с живых аккаунтов' },
                            { step: '03', title: 'Рейтинг растёт', desc: `Ваш рейтинг на ${platformData.fullName} начинает расти в течение 24ч` },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl font-black text-blue-500/20 dark:text-blue-500/10 mb-3">{s.step}</div>
                                <h3 className="font-bold text-[#1d1d1f] dark:text-white mb-2">{s.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Статистика */}
            <section className="px-4 mb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { value: '50K+', label: 'Отзывов написано' },
                            { value: '4.9', label: 'Средний рейтинг', icon: <Star size={16} className="text-amber-400 fill-amber-400 inline" /> },
                            { value: '98%', label: 'Остаются навсегда' },
                            { value: cityData.population, label: `Жителей в ${cityData.region}` },
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
                                <div className="text-2xl md:text-3xl font-black text-[#1d1d1f] dark:text-white mb-1">
                                    {s.value} {s.icon}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEO FAQ */}
            <section className="px-4 mb-16">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1d1d1f] dark:text-white mb-10">
                        Частые вопросы об отзывах на {platformData.name}
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: `Сколько стоит один отзыв на ${platformData.name}?`, a: `Стоимость одного отзыва на ${platformData.fullName} начинается от 150₽. Цена зависит от объёма текста и сложности задания.` },
                            { q: `Не удалят ли отзывы на ${platformData.fullName}?`, a: `Наши авторы пишут уникальные отзывы с прокачанных аккаунтов, поэтому процент удаления минимален (менее 2%). Если отзыв удалят — бесплатная замена.` },
                            { q: `Как быстро появятся отзывы в ${cityData.name}?`, a: `Первые отзывы появляются в течение 24 часов после оплаты. Мы равномерно распределяем их, чтобы выглядело естественно.` },
                            { q: `Можно ли заказать отзывы с фото/видео?`, a: `Да, мы принимаем заказы на отзывы с фотографиями и видео. Это стоит дороже, но значительно повышает доверие.` },
                            { q: `Работаете ли вы с бизнесом в ${cityData.name}?`, a: `Да! ${cityData.region} — один из наших ключевых регионов. У нас более 100 активных авторов в вашем городе.` },
                        ].map((faq, i) => (
                            <details key={i} className="group border-b border-slate-200 dark:border-white/10">
                                <summary className="flex items-center justify-between py-5 cursor-pointer text-left font-semibold text-[#1d1d1f] dark:text-white hover:text-blue-500 transition-colors">
                                    {faq.q}
                                    <ArrowRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                                </summary>
                                <p className="pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4">
                <div className="max-w-3xl mx-auto bg-slate-900 dark:bg-[#1c1c1e] text-white border border-slate-800 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
                    <ShieldCheck size={40} className="mx-auto mb-4 text-blue-500" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        Готовы улучшить репутацию в {cityData.name}?
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                        Начните получать положительные отзывы на {platformData.fullName} уже сегодня. От 150₽ за отзыв с гарантией.
                    </p>
                    <Link
                        to="/business-prices"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#0071e3] text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-xl"
                    >
                        Заказать отзывы <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Внутренняя перелинковка — другие города */}
            <section className="px-4 mt-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-white mb-4">
                        Отзывы на {platformData.name} в других городах
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(CITIES)
                            .filter(([slug]) => slug !== city)
                            .slice(0, 20)
                            .map(([slug, c]) => (
                                <Link
                                    key={slug}
                                    to={`/otzyvy/${platform}/${slug}`}
                                    className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
                                >
                                    {c.region}
                                </Link>
                            ))}
                    </div>

                    <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white mb-4 mt-8">
                        Другие площадки в {cityData.region}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(PLATFORMS)
                            .filter(([slug]) => slug !== platform)
                            .map(([slug, p]) => (
                                <Link
                                    key={slug}
                                    to={`/otzyvy/${slug}/${city}`}
                                    className="px-4 py-2 text-sm bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5"
                                >
                                    <p.icon size={14} className="text-slate-400" /> {p.name}
                                </Link>
                            ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CityLanding;
