import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, TrendingUp, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './RealPlatformIcons';
import { Section } from './ui/Section';
import type { DecorativeElement } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { BrandIcon } from './ui/BrandIcon';
import type { BrandIconProps } from './ui/BrandIcon';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

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

// Маппинг platform slug → BrandIcon brand prop
const PLATFORM_TO_BRAND: Record<string, BrandIconProps['brand']> = {
    'avito': 'avito',
    'yandex': 'yandex',
    '2gis': '2gis',
    'google': 'google',
};

// Иконки для преимуществ (Lucide)
const BENEFIT_ICONS = [CheckCircle2, ShieldCheck, TrendingUp, Star] as const;
const BENEFIT_COLORS = ['green-500', 'blue-500', 'violet-500', 'amber-500'] as const;

// Декоративные элементы для hero (dark section)
const HERO_DECOR: DecorativeElement[] = [
    { type: 'blob', position: { top: '5%', right: '5%' }, opacity: 0.08, size: '180px' },
    { type: 'geometric', position: { bottom: '10%', left: '3%' }, opacity: 0.06, size: '120px' },
    { type: 'dots', position: { top: '60%', right: '10%' }, opacity: 0.05, size: '100px' },
    { type: 'blob', position: { bottom: '5%', right: '20%' }, opacity: 0.04, size: '140px' },
];

// Декоративные элементы для секции преимуществ (light section)
const BENEFITS_DECOR: DecorativeElement[] = [
    { type: 'dots', position: { top: '8%', left: '4%' }, opacity: 0.04, size: '100px' },
    { type: 'lines', position: { bottom: '10%', right: '5%' }, opacity: 0.03, size: '80px' },
];

// Декоративные элементы для CTA (accent section)
const CTA_DECOR: DecorativeElement[] = [
    { type: 'blob', position: { top: '10%', left: '5%' }, opacity: 0.06, size: '150px' },
    { type: 'geometric', position: { bottom: '15%', right: '8%' }, opacity: 0.05, size: '100px' },
];

// Экспортируемые данные для использования в sitemap и других компонентах
export const SEO_CITIES = CITIES;
export const SEO_PLATFORMS = PLATFORMS;

/** Helper component for stagger animation in .map() — hooks require stable component */
const StaggerItem: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
    const anim = useScrollAnimation({ delay: index * 75 });
    return (
        <div ref={anim.ref as React.RefObject<HTMLDivElement>} style={anim.style}>
            {children}
        </div>
    );
};

const CityLanding: React.FC = () => {
    const { platform, city } = useParams<{ platform: string; city: string }>();

    const cityData = city ? CITIES[city] : null;
    const platformData = platform ? PLATFORMS[platform] : null;

    if (!cityData || !platformData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-text-primary">Страница не найдена</h1>
                    <Link to="/" className="text-accent-primary hover:underline">На главную</Link>
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

    const brandKey = platform ? PLATFORM_TO_BRAND[platform] : undefined;

    const heroAnim = useScrollAnimation({ threshold: 0.1 });
    const benefitsAnim = useScrollAnimation({ delay: 100 });
    const howItWorksAnim = useScrollAnimation({ delay: 50 });
    const statsAnim = useScrollAnimation({ delay: 50 });
    const faqAnim = useScrollAnimation({ delay: 50 });
    const ctaAnim = useScrollAnimation({ delay: 100 });

    return (
        <main className="min-h-screen bg-surface-primary font-sans">
            {/* Hero — dark Section with blob + geometric decorElements */}
            <Section variant="dark" decorElements={HERO_DECOR} className="pt-28">
                <div ref={heroAnim.ref as React.RefObject<HTMLDivElement>} style={heroAnim.style} className="max-w-4xl mx-auto text-center">
                    {brandKey && (
                        <div className="mb-4">
                            <BrandIcon brand={brandKey} size={32} withLabel />
                        </div>
                    )}
                    <div className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        <MapPin size={14} /> {cityData.region}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight flex items-center justify-center gap-3 animate-fade-in">
                        <platformData.icon className="w-10 h-10 text-accent-primary shrink-0" /> {pageTitle}
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
                        Закажите качественные отзывы на {platformData.fullName} в {cityData.name} от реальных людей.
                        Повысьте рейтинг и привлеките до 45% больше клиентов.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/business-prices"
                            className="px-8 py-4 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl shadow-lg shadow-accent-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <TrendingUp size={18} /> Заказать отзывы <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/business"
                            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/15 transition-all"
                        >
                            Подробнее о сервисе
                        </Link>
                    </div>
                </div>
            </Section>

            {/* Преимущества — light Section with bordered Cards + IconBadge */}
            <Section variant="light" decorElements={BENEFITS_DECOR}>
                <div ref={benefitsAnim.ref as React.RefObject<HTMLDivElement>} style={benefitsAnim.style} className="max-w-5xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary mb-10">
                        Почему выбирают <span className="text-accent-primary">NOXISS.WORK</span> в {cityData.name}?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {BENEFITS.map((b, i) => (
                            <StaggerItem key={i} index={i}>
                                <Card variant="bordered" accent="corner" hoverable>
                                    <div className="flex gap-4 items-start">
                                        <IconBadge
                                            icon={BENEFIT_ICONS[i]}
                                            color={BENEFIT_COLORS[i]}
                                            size="md"
                                        />
                                        <div>
                                            <h3 className="font-bold text-text-primary mb-1">{b.title}</h3>
                                            <p className="text-sm text-text-secondary">{b.desc}</p>
                                        </div>
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Как это работает */}
            <section className="px-4 mb-16 bg-surface-secondary py-16 border-y border-border-primary dark:border-border-secondary">
                <div ref={howItWorksAnim.ref as React.RefObject<HTMLDivElement>} style={howItWorksAnim.style} className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary mb-10">
                        Как заказать отзывы на {platformData.name}?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Оставляете заявку', desc: `Указываете ссылку на ${platformData.name} и количество отзывов` },
                            { step: '02', title: 'Авторы пишут', desc: 'Реальные люди пишут уникальные отзывы с живых аккаунтов' },
                            { step: '03', title: 'Рейтинг растёт', desc: `Ваш рейтинг на ${platformData.fullName} начинает расти в течение 24ч` },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl font-black text-accent-primary/20 mb-3">{s.step}</div>
                                <h3 className="font-bold text-text-primary mb-2">{s.title}</h3>
                                <p className="text-sm text-text-secondary">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Статистика */}
            <section className="px-4 mb-16">
                <div ref={statsAnim.ref as React.RefObject<HTMLDivElement>} style={statsAnim.style} className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { value: '50K+', label: 'Отзывов написано' },
                            { value: '4.9', label: 'Средний рейтинг', icon: <Star size={16} className="text-amber-400 fill-amber-400 inline" /> },
                            { value: '98%', label: 'Остаются навсегда' },
                            { value: cityData.population, label: `Жителей в ${cityData.region}` },
                        ].map((s, i) => (
                            <div key={i} className="bg-surface-secondary rounded-2xl p-5 border border-border-primary dark:border-border-secondary text-center shadow-sm">
                                <div className="text-2xl md:text-3xl font-black text-text-primary mb-1">
                                    {s.value} {s.icon}
                                </div>
                                <div className="text-xs text-text-muted">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEO FAQ */}
            <section className="px-4 mb-16">
                <div ref={faqAnim.ref as React.RefObject<HTMLDivElement>} style={faqAnim.style} className="max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary mb-10">
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
                            <details key={i} className="group border-b border-border-primary dark:border-border-secondary">
                                <summary className="flex items-center justify-between py-5 cursor-pointer text-left font-semibold text-text-primary hover:text-accent-primary transition-colors">
                                    {faq.q}
                                    <ArrowRight size={16} className="text-text-muted group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                                </summary>
                                <p className="pb-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA — accent Section with glass Card */}
            <Section variant="accent" decorElements={CTA_DECOR}>
                <div ref={ctaAnim.ref as React.RefObject<HTMLDivElement>} style={ctaAnim.style} className="max-w-3xl mx-auto">
                    <Card variant="glass" hoverable={false}>
                        <div className="text-center py-4 md:py-8">
                            <ShieldCheck size={40} className="mx-auto mb-4 text-accent-primary" />
                            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                                Готовы улучшить репутацию в {cityData.name}?
                            </h2>
                            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
                                Начните получать положительные отзывы на {platformData.fullName} уже сегодня. От 150₽ за отзыв с гарантией.
                            </p>
                            <Link
                                to="/business-prices"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-primary/90 transition-all shadow-xl"
                            >
                                Заказать отзывы <ArrowRight size={18} />
                            </Link>
                        </div>
                    </Card>
                </div>
            </Section>

            {/* Внутренняя перелинковка — другие города */}
            <section className="px-4 mt-16">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-lg font-bold text-text-primary mb-4">
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
                                    className="px-3 py-1.5 text-xs bg-surface-secondary text-text-secondary rounded-full hover:bg-accent-primary/10 hover:text-accent-primary transition-colors"
                                >
                                    {c.region}
                                </Link>
                            ))}
                    </div>

                    <h3 className="text-lg font-bold text-text-primary mb-4 mt-8">
                        Другие площадки в {cityData.region}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(PLATFORMS)
                            .filter(([slug]) => slug !== platform)
                            .map(([slug, p]) => (
                                <Link
                                    key={slug}
                                    to={`/otzyvy/${slug}/${city}`}
                                    className="px-4 py-2 text-sm bg-surface-secondary text-text-secondary rounded-full hover:bg-accent-primary/10 hover:text-accent-primary transition-colors font-medium flex items-center gap-1.5"
                                >
                                    <p.icon size={14} className="text-text-muted" /> {p.name}
                                </Link>
                            ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CityLanding;
