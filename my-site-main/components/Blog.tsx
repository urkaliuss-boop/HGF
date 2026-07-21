import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight, TrendingUp, Star, Shield } from 'lucide-react';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const BLOG_POSTS = [
    {
        id: 'how-to-remove-bad-reviews-avito',
        title: 'Как удалить негативный отзыв на Авито в 2026 году: подробная инструкция',
        excerpt: 'Полное руководство по работе с репутацией на Авито. Законные методы удаления накрученного негатива, общение с модерацией и перекрытие негативных отзывов позитивными.',
        date: '2026-01-15',
        readTime: '5 мин',
        category: 'Авито',
        icon: Star,
        color: 'from-[#0071e3] to-[#2997ff]'
    },
    {
        id: 'yandex-maps-rating-impact-revenue',
        title: 'Влияние рейтинга на Яндекс Картах на выручку локального бизнеса',
        excerpt: 'Исследование 2026 года: как падение рейтинга с 4.8 до 4.2 снижает конверсию в звонок на 45%. Реальные цифры и кейсы по исправлению ситуации.',
        date: '2026-01-10',
        readTime: '7 мин',
        category: 'Яндекс Карты',
        icon: TrendingUp,
        color: 'from-red-500 to-orange-500'
    },
    {
        id: 'serp-orm-basics',
        title: 'ORM и SERM: в чем разница и зачем это малому бизнесу?',
        excerpt: 'Управление репутацией в поисковых системах. Рассказываем простыми словами, как создать "подушку безопасности" из положительных упоминаний о вашем бренде в сети.',
        date: '2026-01-05',
        readTime: '6 мин',
        category: 'Управление репутацией',
        icon: Shield,
        color: 'from-blue-500 to-cyan-500'
    }
];

/** Helper component to call useScrollAnimation per item in a list */
const StaggerItem: React.FC<{ index: number; children: React.ReactNode; className?: string }> = ({ index, children, className }) => {
    const { ref, style } = useScrollAnimation({ delay: index * 75 });
    return (
        <div ref={ref as React.RefObject<HTMLDivElement>} style={style} className={className}>
            {children}
        </div>
    );
};

const Blog: React.FC = () => {
    const sectionAnim = useScrollAnimation({ threshold: 0.2 });

    return (
        <div className="min-h-screen bg-surface-primary dark:bg-surface-dark font-sans pt-24 pb-20">
            <Section
                variant="light"
                decorElements={[
                    { type: 'dots', position: { top: '8%', right: '4%' }, opacity: 0.05, size: '120px' },
                    { type: 'geometric', position: { bottom: '12%', left: '3%' }, opacity: 0.04, size: '100px' },
                    { type: 'lines', position: { top: '60%', right: '8%' }, opacity: 0.03, size: '80px' },
                ]}
            >
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <BookOpen size={14} /> База знаний
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-text-primary mb-4">
                        Статьи о репутации
                    </h1>
                    <p className="text-text-secondary max-w-2xl mx-auto text-lg">
                        Всё о том, как отзывы влияют на продажи, и как легально управлять своей репутацией в сети.
                    </p>
                </div>

                <div ref={sectionAnim.ref as React.RefObject<HTMLDivElement>} style={sectionAnim.style}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BLOG_POSTS.map((post, i) => (
                        <StaggerItem key={post.id} index={i} className={i === 0 ? 'md:col-span-2' : ''}>
                        <Link
                            to={`/blog/${post.id}`}
                            className={`group flex flex-col h-full`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <Card
                                variant="elevated"
                                accent="pattern"
                                className="flex flex-col h-full"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${post.color} rounded-2xl flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform`}>
                                        <post.icon size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-1">
                                            {post.category}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString('ru-RU')}</span>
                                            <span>•</span>
                                            <span>{post.readTime} чтения</span>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-3 group-hover:text-accent-primary transition-colors leading-tight">
                                    {post.title}
                                </h2>

                                <p className="text-sm text-text-secondary mb-6 flex-grow leading-relaxed">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center text-sm font-bold text-accent-primary gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-border-primary dark:border-border-secondary">
                                    Читать статью <ArrowRight size={16} />
                                </div>
                            </Card>
                        </Link>
                        </StaggerItem>
                    ))}
                </div>
                </div>
            </Section>
        </div>
    );
};

export default Blog;
