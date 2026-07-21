import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { BLOG_POSTS } from './Blog';
import { ChevronLeft, Calendar, Clock, Share2, ArrowRight } from 'lucide-react';
import { Section } from './ui/Section';
import type { DecorativeElement } from './ui/Section';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Mock contents for the SEO articles
const postContents: Record<string, React.ReactNode> = {
    'how-to-remove-bad-reviews-avito': (
        <>
            <p className="lead text-xl text-text-secondary mb-8 leading-relaxed">
                Получили незаслуженный негативный отзыв на Авито? Это проблема, с которой сталкиваются 80% продавцов и компаний. В этой статье мы пошагово разберем, как законно удалить такой отзыв или свести его влияние к нулю.
            </p>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">1. Попытка удаления через техподдержку</h2>
            <p className="mb-4 text-text-secondary">
                Самый правильный и прямой путь — обжаловать отзыв. Авито обновили политику модерации, и сейчас шансы на удаление фейка выше, чем год назад.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-text-secondary">
                <li>Нажмите "Обжаловать отзыв" в личном кабинете.</li>
                <li>Если отзыв оставлен конкурентом — укажите на отсутствие фактов сделки (нет чека, переписки, звонков).</li>
                <li>Приложите скриншоты вашей системы учета, где видно, что клиента с таким именем/номером не было.</li>
            </ul>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">2. Диалог с недовольным клиентом</h2>
            <p className="mb-4 text-text-secondary">
                Если клиент реальный, попытайтесь решить проблему мирным путем. Предложите скидку, замену товара или полный возврат средств В ОБМЕН на удаление или изменение отзыва. Авито позволяет покупателю редактировать свой отзыв.
            </p>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">3. Метод перекрытия (ORM)</h2>
            <p className="mb-4 text-text-secondary">
                Если служба поддержки отказала, а автор отзыва игнорирует сообщения — единственный выход это перекрыть негатив позитивом. 1 негативный отзыв могут нейтрализовать 5-10 положительных.
            </p>
            <div className="bg-accent-primary/10 border-l-4 border-accent-primary p-6 rounded-r-2xl mb-8">
                <p className="text-accent-primary font-medium m-0">
                    Именно для решения таких задач существует наш сервис. Мы публикуем качественные отзывы от реальных людей, которые перекроют любой негатив и восстановят ваш рейтинг до 4.9.
                </p>
            </div>
        </>
    ),
    'yandex-maps-rating-impact-revenue': (
        <>
            <p className="lead text-xl text-text-secondary mb-8 leading-relaxed">
                Многие владельцы офлайн-бизнеса недооценивают влияние цифровой репутации. "Мы хорошо работаем, люди к нам и так придут". Но статистика Яндекс Карт за 2026 год говорит об обратном.
            </p>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">Цифры, которые заставят задуматься</h2>
            <p className="mb-4 text-text-secondary">
                Согласно исследованиям маркетологов, пользователи Карт принимают решение о визите за 3-5 секунд. При этом:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-text-secondary">
                <li>Компании с рейтингом ниже 4.0 теряют до <strong>45%</strong> потенциального трафика.</li>
                <li>Пользователи чаще нажимают на карточки с рейтингом от 4.7 до 4.9. Идеальная 5.0 часто вызывает подозрения.</li>
                <li>Только 5% пользователей читают отзывы дальше первой страницы.</li>
            </ul>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">Упущенная выгода</h2>
            <p className="mb-4 text-text-secondary">
                Представьте салон красоты. Ежемесячно его карточку находят 1000 человек. Конверсия в звонок при рейтинге 4.8 составляет около 8% (80 звонков). Если рейтинг падает до 4.2 из-за атаки конкурентов, конверсия рушится до 3% (30 звонков).
            </p>
            <p className="mb-6 text-text-secondary">
                Разница — 50 звонков. При конверсии в запись 50% и среднем чеке 3000 рублей, салон теряет <strong>75 000 рублей</strong> ежемесячно просто из-за плохих оценок.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl text-center mb-8 border border-red-100 dark:border-red-500/20">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Хотите узнать свои потери?</h3>
                <p className="text-red-600 dark:text-red-300 mb-6">Воспользуйтесь нашим бесплатным аудитором репутации на главной странице.</p>
                <Link to="/business" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                    Проверить свою компанию
                </Link>
            </div>
        </>
    ),
    'serp-orm-basics': (
        <>
            <p className="lead text-xl text-text-secondary mb-8 leading-relaxed">
                Вы ввели название своей компании в Google или Яндекс. Что вы там видите? Если помимо вашего сайта там есть сайты-отзовики с оценкой 2 звезд — у вас серьезные проблемы.
            </p>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">Что такое ORM?</h2>
            <p className="mb-4 text-text-secondary">
                ORM (Online Reputation Management) — это комплексная работа с имиджем бренда в сети. Она включает в себя ответы на негатив, стимулирование позитива от реальных клиентов и создание "информационного щита".
            </p>

            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mt-10 mb-4">Зачем нужен "Щит"?</h2>
            <p className="mb-4 text-text-secondary">
                Люди пишут негативные отзывы в 10 раз чаще, чем позитивные. Когда человек доволен — для него это норма, он просто уходит. Когда он недоволен — он хочет отомстить и идет писать отзыв.
            </p>
            <p className="mb-6 text-text-secondary">
                Создание щита означает, что вы <strong>заранее</strong> обеспечиваете себе подушку безопасности из хороших отзывов на всех ключевых площадках (Отзовик, IRecommend, Flamp, Zoon). Если "прилетит" гневный комментарий, он просто затеряется среди сотен хороших.
            </p>

            <div className="bg-surface-primary dark:bg-surface-dark p-8 rounded-3xl mb-8 border border-border-primary dark:border-border-secondary">
                <h3 className="text-xl font-bold text-text-primary dark:text-text-primary mb-4">Как мы помогаем с ORM:</h3>
                <ol className="list-decimal pl-5 space-y-3 text-text-secondary">
                    <li>Проводим аудит текущего состояния.</li>
                    <li>Подбираем площадки, где у вас просадка.</li>
                    <li>Пишем уникальные SEO-оптимизированные тексты.</li>
                    <li>Публикуем от лица реальных пользователей с прогретых аккаунтов.</li>
                </ol>
            </div>
        </>
    )
};

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = BLOG_POSTS.find(p => p.id === slug);
    const articleAnim = useScrollAnimation({ threshold: 0.2 });

    useEffect(() => {
        window.scrollTo(0, 0);

        if (post) {
            // Dynamic title & description update
            document.title = `${post.title} — NOXISS.WORK`;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', post.excerpt || `Информационная статья: ${post.title}. Узнайте подробнее на NOXISS.WORK.`);
            
            // Dynamic JSON-LD structured data injection
            let schemaScript = document.getElementById('jsonld-blogpost');
            if (!schemaScript) {
                schemaScript = document.createElement('script');
                schemaScript.setAttribute('type', 'application/ld+json');
                schemaScript.setAttribute('id', 'jsonld-blogpost');
                document.head.appendChild(schemaScript);
            }
            const schemaData = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "datePublished": post.date,
                "author": {
                    "@type": "Organization",
                    "name": "NOXISS WORK",
                    "url": "https://noxiss-work.ru"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "NOXISS WORK",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://noxiss-work.ru/favicon.svg"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": window.location.href
                }
            };
            schemaScript.innerHTML = JSON.stringify(schemaData);
        }

        return () => {
            const schemaScript = document.getElementById('jsonld-blogpost');
            if (schemaScript) schemaScript.remove();
        };
    }, [slug, post]);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const content = postContents[post.id];

    const articleDecorElements: DecorativeElement[] = [
        { type: 'dots', position: { top: '8%', right: '4%' }, opacity: 0.04, size: '100px' },
        { type: 'lines', position: { bottom: '12%', left: '3%' }, opacity: 0.03, size: '80px' },
    ];

    return (
        <div className="min-h-screen bg-surface-primary dark:bg-surface-dark font-sans pt-24 pb-20 select-text">

            <Section variant="light" decorElements={articleDecorElements} className="py-12 md:py-16">
                <div className="max-w-3xl mx-auto mb-8 px-4">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-primary font-medium text-sm transition-colors">
                        <ChevronLeft size={16} /> Назад к статьям
                    </Link>
                </div>

                <article className="max-w-3xl mx-auto bg-surface-primary dark:bg-surface-dark rounded-[3rem] p-8 md:p-14 border border-border-primary dark:border-border-secondary shadow-sm relative overflow-hidden animate-fade-in-up">
                    <div ref={articleAnim.ref as React.RefObject<HTMLDivElement>} style={articleAnim.style}>

                    {/* Header Decor */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${post.color} rounded-bl-full opacity-10 -z-10`}></div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-primary dark:bg-surface-dark text-accent-primary rounded-lg text-xs font-bold uppercase tracking-wider">
                            {post.category}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                            <Calendar size={14} /> {new Date(post.date).toLocaleDateString('ru-RU')}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                            <Clock size={14} /> {post.readTime}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-[-0.02em] leading-[1.1] text-text-primary dark:text-text-primary mb-10">
                        {post.title}
                    </h1>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-base prose-p:md:text-lg prose-headings:font-bold prose-a:text-accent-primary prose-li:marker:text-accent-primary">
                        {content}
                    </div>

                    {/* Share & Footer */}
                    <div className="mt-14 pt-8 border-t border-border-primary dark:border-border-secondary flex flex-col sm:flex-row justify-between items-center gap-6">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: post.title, url: window.location.href });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Ссылка скопирована!');
                                }
                            }}
                            className="flex items-center gap-2 text-text-secondary hover:text-accent-primary font-bold text-sm bg-surface-primary dark:bg-surface-dark py-2 px-4 rounded-xl transition-colors"
                        >
                            <Share2 size={16} /> Поделиться статьёй
                        </button>

                        <Link to="/business" className="inline-flex items-center gap-2 text-white bg-accent-primary hover:bg-accent-primary/90 font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-accent-primary/25 active:scale-95">
                            Улучшить рейтинг <ArrowRight size={18} />
                        </Link>
                    </div>
                    </div>
                </article>
            </Section>

        </div>
    );
};

export default BlogPost;
