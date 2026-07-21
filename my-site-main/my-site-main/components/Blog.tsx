import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight, TrendingUp, Star, Shield } from 'lucide-react';

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

const Blog: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black font-sans pt-24 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <BookOpen size={14} /> База знаний
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] dark:text-white mb-4">
                        Статьи о репутации
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        Всё о том, как отзывы влияют на продажи, и как легально управлять своей репутацией в сети.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BLOG_POSTS.map((post, i) => (
                        <Link
                            to={`/blog/${post.id}`}
                            key={post.id}
                            className="group bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-glow-sm transition-all flex flex-col h-full animate-fade-in-up relative overflow-hidden"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className={`w-14 h-14 bg-gradient-to-br ${post.color} rounded-2xl flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-500 group-hover:shadow-glow-sm`}>
                                    <post.icon size={26} />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-[#0071e3] uppercase tracking-widest mb-1">
                                        {post.category}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString('ru-RU')}</span>
                                        <span>•</span>
                                        <span>{post.readTime} чтения</span>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mb-4 group-hover:text-[#0071e3] transition-colors leading-tight relative z-10">
                                {post.title}
                            </h2>

                            <p className="text-sm text-slate-500 mb-8 flex-grow leading-relaxed relative z-10">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between text-sm font-bold text-[#0071e3] mt-auto pt-5 border-t border-slate-100 dark:border-white/5 relative z-10">
                                <span>Читать статью</span> 
                                <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
