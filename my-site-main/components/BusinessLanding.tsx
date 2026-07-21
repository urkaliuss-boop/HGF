import React from 'react';
import { Link } from 'react-router-dom';
import {
    Star, TrendingUp, ArrowRight, Shield, Clock, Users,
    CheckCircle, Zap, MessageCircle, Eye, Award, ChevronRight,
    Sparkles, BarChart3, ShoppingBag, MapPin, Globe, Map
} from 'lucide-react';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './RealPlatformIcons';
import ROICalculator from './ROICalculator';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { BrandIcon } from './ui/BrandIcon';
import type { DecorativeElement } from './ui/Section';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/** Helper component to apply stagger animation to individual items in a list */
const StaggerItem: React.FC<{ index: number; children: React.ReactNode; className?: string }> = ({ index, children, className }) => {
    const anim = useScrollAnimation({ delay: index * 75 });
    return (
        <div ref={anim.ref as React.RefObject<HTMLDivElement>} style={anim.style} className={className}>
            {children}
        </div>
    );
};


const advantages = [
    {
        icon: Shield,
        title: 'Гарантия публикации',
        desc: 'Если отзыв удалён — переделываем бесплатно. Ваш бюджет защищён.',
        color: 'blue-500',
    },
    {
        icon: Users,
        title: 'Реальные аккаунты',
        desc: 'Отзывы от живых людей с историей активности. Никаких ботов.',
        color: 'blue-500',
    },
    {
        icon: Clock,
        title: 'Естественный график',
        desc: 'Публикуем 1-2 отзыва в неделю. Алгоритмы не заподозрят.',
        color: 'orange-500',
    },
    {
        icon: MessageCircle,
        title: 'Уникальные тексты',
        desc: 'Каждый отзыв пишется индивидуально. С ключевыми словами для SEO.',
        color: 'green-500',
    },
    {
        icon: Eye,
        title: 'Полная прозрачность',
        desc: 'Отслеживайте статус каждого отзыва в личном кабинете 24/7.',
        color: 'pink-500',
    },
    {
        icon: Zap,
        title: 'Быстрый результат',
        desc: 'Первые отзывы — через 24 часа. Полный пакет — за 2-4 недели.',
        color: 'amber-500',
    },
];

const steps = [
    {
        num: '01',
        title: 'Оставьте заявку',
        desc: 'Выберите площадку и пакет отзывов. Укажите ссылку на карточку.',
        icon: Sparkles,
        color: 'blue-500',
    },
    {
        num: '02',
        title: 'Мы всё настроим',
        desc: 'Назначим исполнителей. Составим расписание публикации.',
        icon: BarChart3,
        color: 'indigo-500',
    },
    {
        num: '03',
        title: 'Получайте рост',
        desc: 'Отзывы публикуются по графику. Рейтинг растёт на автомате.',
        icon: TrendingUp,
        color: 'green-500',
    },
];

const miniCases = [
    { platform: 'Авито', icon: AvitoIcon, brandKey: 'avito' as const, before: 3.2, after: 4.7, reviews: 35, result: '+85% звонков' },
    { platform: 'Яндекс Карты', icon: YandexIcon, brandKey: 'yandex' as const, before: 3.8, after: 4.9, reviews: 40, result: '+120% клиентов' },
    { platform: 'Google Maps', icon: GoogleMapsIcon, brandKey: 'google' as const, before: 4.0, after: 4.8, reviews: 45, result: '+60% пациентов' },
    { platform: '2GIS', icon: TwoGisIcon, brandKey: '2gis' as const, before: 3.5, after: 4.6, reviews: 30, result: '3x записей' },
];

const faqItems = [
    {
        q: 'Это безопасно для моей карточки?',
        a: 'Да. Мы используем только реальные аккаунты с историей, публикуем отзывы с естественной периодичностью и имитируем реальное поведение пользователей (маршруты, время на странице).',
    },
    {
        q: 'Что если отзыв удалят?',
        a: 'Мы предоставляем гарантию от удаления. Если отзыв будет удалён модерацией — переделаем его бесплатно.',
    },
    {
        q: 'Как быстро появятся первые отзывы?',
        a: 'Первые 2-3 отзыва обычно появляются в течение 24 часов. Мы не публикуем всё скопом — распределяем равномерно, чтобы выглядело естественно. 10 отзывов занимают 3-5 дней.',
    },
    {
        q: 'Могу ли я контролировать текст отзывов?',
        a: 'Да, вы можете оставить инструкции: что упомянуть, какие ключевые слова использовать, какой тон. Или мы составим тексты сами.',
    },
    {
        q: 'Какая минимальная сумма заказа?',
        a: 'Минимальный пакет — от 2000₽ (5 отзывов на Авито). Для крупных заказов действуют скидки до 25%.',
    },
    {
        q: 'Как зачисляется оплата?',
        a: 'Вы пополняете баланс в личном кабинете через карту или СБП. Средства списываются при создании заказа.',
    },
    {
        q: 'Сколько стоит один отзыв?',
        a: 'Стоимость начинается от 150₽ за текстовый отзыв. Отзывы с фото — от 250₽, с видео — от 400₽. Чем больше заказ, тем выгоднее цена за единицу.',
    },
    {
        q: 'На каких площадках вы работаете?',
        a: 'Авито, Яндекс Карты, 2ГИС, Google Maps, Флагма, Otzovik, Irecommend и другие. Если вашей площадки нет в списке — напишите, мы добавим.',
    },
    {
        q: 'Это законно?',
        a: 'Написание отзывов — это услуга копирайтинга. Люди описывают опыт использования ваших товаров/услуг. Это стандартная практика SERM (Search Engine Reputation Management).',
    },
    {
        q: 'Можно ли заказать негативные отзывы конкурентам?',
        a: 'Нет. Мы работаем только с позитивными и нейтральными отзывами. Наша цель — помочь бизнесу расти, а не вредить другим.',
    },
    {
        q: 'Как начать?',
        a: 'Зарегистрируйтесь, перейдите в бизнес-кабинет, пополните баланс и создайте первый заказ. Весь процесс занимает 5 минут.',
    },
];

// --- Decor element presets ---

const heroDecor: DecorativeElement[] = [
    { type: 'blob', position: { top: '5%', right: '3%' }, opacity: 0.08, size: '180px' },
    { type: 'geometric', position: { bottom: '10%', left: '5%' }, opacity: 0.06, size: '120px' },
    { type: 'dots', position: { top: '60%', right: '8%' }, opacity: 0.05, size: '100px' },
    { type: 'lines', position: { bottom: '30%', right: '15%' }, opacity: 0.04, size: '80px' },
];

const stepsDecor: DecorativeElement[] = [
    { type: 'geometric', position: { top: '10%', left: '3%' }, opacity: 0.05, size: '100px' },
    { type: 'lines', position: { bottom: '15%', right: '5%' }, opacity: 0.04, size: '90px' },
    { type: 'dots', position: { top: '50%', right: '2%' }, opacity: 0.04, size: '80px' },
];

const advantagesDecor: DecorativeElement[] = [
    { type: 'dots', position: { top: '8%', right: '4%' }, opacity: 0.05, size: '110px' },
    { type: 'geometric', position: { bottom: '12%', left: '3%' }, opacity: 0.04, size: '90px' },
    { type: 'grid', position: { top: '40%', left: '8%' }, opacity: 0.03, size: '80px' },
];

const casesDecor: DecorativeElement[] = [
    { type: 'blob', position: { top: '5%', left: '3%' }, opacity: 0.06, size: '140px' },
    { type: 'geometric', position: { bottom: '10%', right: '5%' }, opacity: 0.05, size: '100px' },
    { type: 'dots', position: { top: '50%', right: '3%' }, opacity: 0.04, size: '90px' },
];

const faqDecor: DecorativeElement[] = [
    { type: 'dots', position: { top: '10%', right: '5%' }, opacity: 0.04, size: '100px' },
    { type: 'lines', position: { bottom: '15%', left: '3%' }, opacity: 0.03, size: '80px' },
];

const ctaDecor: DecorativeElement[] = [
    { type: 'blob', position: { top: '10%', right: '5%' }, opacity: 0.08, size: '150px' },
    { type: 'geometric', position: { bottom: '15%', left: '5%' }, opacity: 0.06, size: '100px' },
];

const BusinessLanding: React.FC = () => {
    const [openFaq, setOpenFaq] = React.useState<number | null>(null);

    const heroAnim = useScrollAnimation({ threshold: 0.1 });
    const stepsAnim = useScrollAnimation({ threshold: 0.15 });
    const advantagesAnim = useScrollAnimation({ threshold: 0.15 });
    const casesAnim = useScrollAnimation({ threshold: 0.15 });
    const faqAnim = useScrollAnimation({ threshold: 0.15 });
    const ctaAnim = useScrollAnimation({ threshold: 0.2 });

    return (
        <div className="min-h-screen bg-surface-primary dark:bg-surface-dark font-sans">

            {/* HERO — Section variant="dark" with decorElements and BrandIcon */}
            <Section variant="dark" decorElements={heroDecor} className="pt-32 pb-24">
                <div ref={heroAnim.ref as React.RefObject<HTMLDivElement>} style={heroAnim.style} className="max-w-4xl mx-auto text-center">
                    {/* Brand icons row */}
                    <div className="flex justify-center gap-4 mb-6">
                        <BrandIcon brand="avito" size={28} />
                        <BrandIcon brand="yandex" size={28} />
                        <BrandIcon brand="google" size={28} />
                        <BrandIcon brand="2gis" size={28} />
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full shadow-sm border border-white/10 mb-8 text-xs font-bold uppercase tracking-wider text-white/70">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Принимаем заказы
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                        Поднимите рейтинг<br />
                        <span className="text-accent-primary">на любой площадке</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Живые отзывы от реальных людей. Гарантия публикации.
                        Авито, Яндекс Карты, Google Maps, 2GIS — под ключ.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link
                            to="/business-cabinet"
                            className="px-8 py-4 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-full font-bold text-base transition-all shadow-lg shadow-accent-primary/25 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Заказать отзывы <ArrowRight size={18} />
                        </Link>
                        <a
                            href="#calculator"
                            className="px-8 py-4 bg-white/10 text-white rounded-full font-bold text-base hover:bg-white/15 transition-all border border-white/20 flex items-center justify-center gap-2"
                        >
                            Рассчитать стоимость ↓
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-6 justify-center text-sm text-white/60">
                        <div className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-500" /> 850+ выполненных заказов</div>
                        <div className="flex items-center gap-1.5"><Star size={16} className="text-amber-400 fill-amber-400" /> Рейтинг 4.9</div>
                        <div className="flex items-center gap-1.5"><Shield size={16} className="text-accent-primary" /> Гарантия от удаления</div>
                    </div>
                </div>
            </Section>

            {/* PLATFORMS mini-badges */}
            <section className="py-6 border-y border-border-primary dark:border-border-secondary bg-surface-secondary/50 dark:bg-surface-dark/50 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 items-center">
                    {[
                        { name: 'Авито', icon: ShoppingBag },
                        { name: 'Яндекс Карты', icon: MapPin },
                        { name: 'Google Maps', icon: Globe },
                        { name: '2GIS', icon: Map },
                    ].map(p => (
                        <div key={p.name} className="flex items-center gap-2 text-text-secondary dark:text-text-muted text-sm font-medium">
                            <p.icon size={18} /> {p.name}
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS — Section variant="light" with Card variant="bordered" + IconBadge */}
            <Section variant="light" decorElements={stepsDecor}>
                <div ref={stepsAnim.ref as React.RefObject<HTMLDivElement>} style={stepsAnim.style} className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-white mb-3">Как это работает</h2>
                        <p className="text-text-secondary max-w-lg mx-auto">От заявки до роста рейтинга — 3 простых шага</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <StaggerItem key={i} index={i} className="relative">
                                <Card variant="bordered" className="h-full">
                                    <div className="text-5xl font-black text-border-primary dark:text-white/5 mb-4">{step.num}</div>
                                    <IconBadge icon={step.icon} color={step.color} size="md" className="mb-4" />
                                    <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-text-secondary">{step.desc}</p>
                                </Card>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ChevronRight size={24} className="text-text-muted dark:text-white/20" />
                                    </div>
                                )}
                            </StaggerItem>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ADVANTAGES — Section variant="textured" with Card variant="elevated" */}
            <Section variant="textured" decorElements={advantagesDecor}>
                <div ref={advantagesAnim.ref as React.RefObject<HTMLDivElement>} style={advantagesAnim.style} className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-white mb-3">Почему выбирают нас</h2>
                        <p className="text-text-secondary max-w-lg mx-auto">Мы не просто пишем отзывы — мы помогаем вашему бизнесу расти</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {advantages.map((a, i) => (
                            <StaggerItem key={i} index={i}>
                                <Card variant="elevated">
                                    <IconBadge icon={a.icon} color={a.color} size="md" className="mb-4" />
                                    <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">{a.title}</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">{a.desc}</p>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </div>
            </Section>

            {/* MINI CASES — Section variant="dark" with bento-grid: first case col-span-2 */}
            <Section variant="dark" decorElements={casesDecor}>
                <div ref={casesAnim.ref as React.RefObject<HTMLDivElement>} style={casesAnim.style} className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            <Award size={14} /> Кейсы
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Результаты наших клиентов</h2>
                    </div>
                    {/* Bento-grid: first card col-span-2, rest col-span-1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {miniCases.map((c, i) => (
                            <StaggerItem key={i} index={i} className={i === 0 ? 'lg:col-span-2' : ''}>
                                <Card
                                    variant="elevated"
                                    accent="corner"
                                    className="h-full"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <BrandIcon brand={c.brandKey} size={24} />
                                        <span className="text-sm font-bold text-white/80">{c.platform}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-center">
                                            <div className="text-[10px] text-white/50">Было</div>
                                            <div className="text-lg font-bold text-red-400">{c.before}★</div>
                                        </div>
                                        <ArrowRight size={14} className="text-white/30" />
                                        <div className="text-center">
                                            <div className="text-[10px] text-white/50">Стало</div>
                                            <div className="text-lg font-bold text-green-400">{c.after}★</div>
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-white/50">{c.reviews} отзывов</div>
                                    <div className="mt-2 bg-green-500/10 text-green-400 text-xs font-bold py-1.5 px-2 rounded-lg text-center">
                                        {c.result}
                                    </div>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                    <div className="text-center">
                        <Link to="/results" className="text-accent-primary font-bold text-sm hover:underline inline-flex items-center gap-1">
                            Все кейсы <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ROI CALCULATOR */}
            <div id="calculator">
                <ROICalculator />
            </div>

            {/* FAQ — Section variant="light" */}
            <Section variant="light" decorElements={faqDecor}>
                <div ref={faqAnim.ref as React.RefObject<HTMLDivElement>} style={faqAnim.style} className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary dark:text-white mb-12">Часто задаваемые вопросы</h2>
                    <div className="space-y-3">
                        {faqItems.map((item, i) => (
                            <div key={i} className="bg-surface-secondary dark:bg-surface-dark rounded-2xl border border-border-primary dark:border-border-secondary shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full text-left p-5 flex justify-between items-center gap-4"
                                >
                                    <span className="font-bold text-text-primary dark:text-white text-sm md:text-base">{item.q}</span>
                                    <span className={`text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''} text-text-muted shrink-0`}>+</span>
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-5 text-sm text-text-secondary dark:text-text-muted leading-relaxed border-t border-border-primary dark:border-border-secondary pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* SEO перелинковка — город × площадка */}
            <section className="py-12 px-4 border-t border-border-primary dark:border-border-secondary">
                <div className="max-w-5xl mx-auto">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Отзывы по городам</h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { platform: 'avito', city: 'moskva', label: 'Авито в Москве' },
                            { platform: 'avito', city: 'spb', label: 'Авито в СПб' },
                            { platform: 'yandex', city: 'moskva', label: 'Яндекс Карты в Москве' },
                            { platform: 'yandex', city: 'spb', label: 'Яндекс Карты в СПб' },
                            { platform: '2gis', city: 'moskva', label: '2ГИС в Москве' },
                            { platform: '2gis', city: 'novosibirsk', label: '2ГИС в Новосибирске' },
                            { platform: 'google', city: 'moskva', label: 'Google Maps в Москве' },
                            { platform: 'avito', city: 'kazan', label: 'Авито в Казани' },
                            { platform: 'avito', city: 'ekaterinburg', label: 'Авито в Екатеринбурге' },
                            { platform: 'yandex', city: 'krasnodar', label: 'Яндекс в Краснодаре' },
                            { platform: 'avito', city: 'sochi', label: 'Авито в Сочи' },
                            { platform: 'avito', city: 'minsk', label: 'Авито в Минске' },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                to={`/otzyvy/${link.platform}/${link.city}`}
                                className="px-3 py-1.5 text-xs bg-surface-accent dark:bg-white/5 text-text-secondary dark:text-text-muted rounded-full hover:bg-accent-primary/10 hover:text-accent-primary dark:hover:bg-accent-primary/10 dark:hover:text-accent-primary transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA — Section variant="accent" */}
            <Section variant="accent" decorElements={ctaDecor}>
                <div ref={ctaAnim.ref as React.RefObject<HTMLDivElement>} style={ctaAnim.style} className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">Готовы расти?</h2>
                    <p className="text-text-secondary text-lg mb-10 max-w-lg mx-auto">
                        Начните получать отзывы уже сегодня. Зарегистрируйтесь, пополните баланс и создайте первый заказ.
                    </p>
                    <Link
                        to="/business-cabinet"
                        className="inline-flex items-center gap-2 px-10 py-5 bg-accent-primary text-white font-bold rounded-full text-lg hover:bg-accent-primary/90 transition-all shadow-xl shadow-accent-primary/25 active:scale-95"
                    >
                        Начать сейчас <ArrowRight size={20} />
                    </Link>
                </div>
            </Section>
        </div>
    );
};

export default BusinessLanding;
