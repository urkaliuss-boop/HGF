import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Clock, Briefcase, ChevronRight, AlertTriangle,
    Lock, Loader2, MapPin, ShoppingBag, Smartphone,
    MessageSquare, Share2, Hash, Star, Inbox
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from './Toast';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const CATEGORIES = ['Все', 'Отзывы', 'Авито', 'Соцсети', 'Приложения', 'Другое'];

const CATEGORY_COLORS: Record<string, string> = {
    'Отзывы': 'var(--accent-primary)',    // синий
    'Авито': '#f97316',                    // оранжевый
    'Соцсети': '#06b6d4',                  // голубой
    'Приложения': '#22c55e',               // зелёный
};

const CATEGORY_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
    'Все': { icon: Star, color: 'amber-500' },
    'Отзывы': { icon: MessageSquare, color: 'blue-500' },
    'Авито': { icon: ShoppingBag, color: 'orange-500' },
    'Соцсети': { icon: Share2, color: 'cyan-500' },
    'Приложения': { icon: Smartphone, color: 'green-500' },
    'Другое': { icon: Hash, color: 'gray-500' },
};

export const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'авито': return <ShoppingBag size={12} className="text-amber-500" />;
        case 'яндекс карты':
        case 'google maps':
        case '2гис': return <MapPin size={12} className="text-red-500" />;
        case 'приложения': return <Smartphone size={12} className="text-blue-500" />;
        case 'соцсети': return <Share2 size={12} className="text-sky-500" />;
        case 'отзывы': return <MessageSquare size={12} className="text-green-500" />;
        case 'все': return <Star size={12} className="text-amber-500" />;
        default: return <Hash size={12} className="text-text-muted" />;
    }
};

/** Wrapper component to apply stagger scroll animation per task card */
function StaggerCard({ children, index }: { children: React.ReactNode; index: number }) {
    const anim = useScrollAnimation({ delay: index * 75 });
    return (
        <div ref={anim.ref as React.RefObject<HTMLDivElement>} style={anim.style}>
            {children}
        </div>
    );
}

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Все');
    const [session, setSession] = useState<any>(null);
    const [processingTaskId, setProcessingTaskId] = useState<number | null>(null);

    // Состояние статусов пользователя
    const [userTaskStatus, setUserTaskStatus] = useState<Record<number, string>>({});

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            fetchTasks(session?.user?.id);
        });
    }, []);

    const fetchTasks = async (userId?: string) => {
        setLoading(true);
        // Берем только задания, где count > 0
        const { data: tasksData, error } = await supabase
            .from('tasks')
            .select('*')
            .gt('remaining_count', 0)
            .order('created_at', { ascending: false });

        if (error) console.error(error);

        if (userId && tasksData) {
            const { data: submissions } = await supabase
                .from('task_submissions')
                .select('task_id, status')
                .eq('user_id', userId)
                .in('status', ['in_progress', 'pending', 'approved', 'paid']);

            if (submissions) {
                const statusMap: Record<number, string> = {};
                submissions.forEach(s => {
                    statusMap[s.task_id] = s.status;
                });
                setUserTaskStatus(statusMap);
            }
        }
        if (tasksData) setTasks(tasksData);
        setLoading(false);
    };

    const filteredTasks = tasks.filter(task => {
        if (activeCategory !== 'Все' && task.category !== activeCategory) return false;

        const myStatus = userTaskStatus[task.id];

        // Скрываем, если уже выполнено/оплачено
        if (myStatus === 'approved' || myStatus === 'paid') return false;

        // Скрываем одноразовые, если они уже в работе или выполнены
        if (task.is_one_time && myStatus) return false;

        return true;
    });

    const handleTakeTask = async (task: any) => {
        if (!session) return toast.error('Сначала войдите в аккаунт');
        if (userTaskStatus[task.id]) return toast.error('Вы уже выполняете это задание.');

        setProcessingTaskId(task.id);

        try {
            // --- 0. ЗАЩИТА ОТ АБУЗА (НОВОЕ) ---
            // Проверяем, сколько у пользователя активных заданий (в работе или на проверке)
            const { count: activeCount, error: countError } = await supabase
                .from('task_submissions')
                .select('*', { count: 'exact', head: true }) // head: true значит не качаем данные, только считаем
                .eq('user_id', session.user.id)
                .in('status', ['in_progress', 'pending']);

            if (countError) {
                console.error(countError);
                toast.error('Ошибка проверки ограничений.');
                setProcessingTaskId(null);
                return;
            }

            // ЛИМИТ: 2 задания
            if (activeCount !== null && activeCount >= 2) {
                toast.error('Ограничение! Вы не можете взять больше 2 заданий одновременно. Сначала сдайте отчет по текущим.');
                setProcessingTaskId(null);
                return;
            }

            // --- 1. ПРОВЕРКА НАЛИЧИЯ МЕСТ ---
            const { data: freshTask, error: fetchError } = await supabase
                .from('tasks')
                .select('remaining_count')
                .eq('id', task.id)
                .single();

            if (fetchError || !freshTask) {
                toast.error('Ошибка проверки задания.');
                setProcessingTaskId(null);
                return;
            }

            if (freshTask.remaining_count <= 0) {
                toast.error('К сожалению, все места на это задание уже закончились.');
                fetchTasks(session.user.id);
                setProcessingTaskId(null);
                return;
            }

            // --- 2. СПИСАНИЕ МЕСТА ---
            const { error: updateError } = await supabase
                .from('tasks')
                .update({ remaining_count: freshTask.remaining_count - 1 })
                .eq('id', task.id);

            if (updateError) {
                console.error(updateError);
                toast.error('Ошибка обновления счетчика. Попробуйте позже.');
                setProcessingTaskId(null);
                return;
            }

            // --- 3. ВЫДАЧА ЗАДАНИЯ ---
            const { error: insertError } = await supabase.from('task_submissions').insert({
                user_id: session.user.id,
                task_id: task.id,
                status: 'in_progress',
                deadline: new Date(Date.now() + (task.execution_time_hours || 72) * 3600000)
            });

            if (insertError) {
                toast.error('Ошибка создания заявки: ' + insertError.message);
                setProcessingTaskId(null);
            } else {
                toast.success('Задание успешно взято в работу!');
                setTimeout(() => {
                    window.location.href = '/cabinet';
                }, 1000);
            }

        } catch (err) {
            console.error(err);
            toast.error('Произошла непредвиденная ошибка');
            setProcessingTaskId(null);
        }
    };

    if (loading) return <div className="pt-40 text-center text-text-muted flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="w-full pt-32 px-4 pb-12 max-w-5xl mx-auto">

            {/* Категории */}
            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2">
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat;
                        const catInfo = CATEGORY_ICON_MAP[cat] || { icon: Hash, color: 'gray-500' };
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                                ${isActive
                                        ? 'bg-surface-dark text-white dark:bg-white dark:text-black shadow-lg scale-105 border-2 border-accent-primary'
                                        : 'bg-surface-primary text-text-secondary hover:bg-surface-secondary dark:bg-surface-dark dark:text-text-muted dark:hover:bg-surface-secondary border-2 border-transparent'
                                    }
                            `}
                            >
                                <IconBadge icon={catInfo.icon} color={catInfo.color} size="sm" animation={isActive ? 'pulse' : 'none'} />
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Список заданий */}
            <Section variant="light" decorElements={[
                { type: 'dots', position: { top: '8%', right: '4%' }, opacity: 0.05, size: '110px' },
                { type: 'geometric', position: { bottom: '12%', left: '3%' }, opacity: 0.04, size: '90px' },
                { type: 'lines', position: { top: '60%', right: '2%' }, opacity: 0.03, size: '80px' },
            ]} className="py-0 md:py-0">
                <div className="grid gap-4">
                    {filteredTasks.length === 0 ? (
                        <Section variant="accent" decorElements={[
                            { type: 'dots', position: { top: '10%', right: '5%' }, opacity: 0.06, size: '100px' },
                            { type: 'geometric', position: { bottom: '10%', left: '5%' }, opacity: 0.05, size: '80px' },
                        ]} className="py-12 md:py-16 rounded-3xl">
                            <div className="text-center flex flex-col items-center gap-4">
                                <IconBadge icon={Inbox} color="blue-400" size="lg" animation="bounce" />
                                <h3 className="text-xl font-bold text-text-primary">
                                    Нет доступных заданий
                                </h3>
                                <p className="text-text-secondary max-w-md">
                                    В категории «{activeCategory}» пока нет доступных заданий. Попробуйте выбрать другую категорию или загляните позже.
                                </p>
                            </div>
                        </Section>
                    ) : (
                        filteredTasks.map((task, index) => (
                            <StaggerCard key={task.id} index={index}>
                                <Card
                                    variant="elevated"
                                    accent="line"
                                    accentColor={CATEGORY_COLORS[task.category] || 'var(--accent-primary)'}
                                    className="group relative overflow-hidden"
                                >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-primary dark:bg-surface-secondary text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted">
                                            {getCategoryIcon(task.category)}
                                            {task.category}
                                        </span>
                                        {task.remaining_count < 5 && (
                                            <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                <AlertTriangle size={10} /> Мало мест
                                            </span>
                                        )}
                                        {task.is_one_time && (
                                            <span className="px-3 py-1 rounded-full bg-surface-primary dark:bg-surface-secondary/20 text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted flex items-center gap-1">
                                                <Lock size={10} /> 1 раз
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl font-bold text-lg border border-green-500/20">
                                        +{task.price} ₽
                                    </div>
                                </div>

                                <h3 className="text-xl md:text-2xl font-bold text-text-primary dark:text-white mb-2 leading-tight relative z-10">
                                    {task.title}
                                </h3>
                                <p className="text-text-secondary dark:text-text-muted text-sm mb-6 line-clamp-2 relative z-10">
                                    {task.description}
                                </p>

                                <div className="flex items-center justify-between border-t border-border-primary dark:border-border-secondary pt-4 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                                            <Clock size={14} className="text-accent-primary" />
                                            <span>{task.execution_time_hours || 72} часа на выполнение</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                                            <Briefcase size={14} className="text-text-secondary" />
                                            <span>Осталось: <span className="text-text-primary dark:text-white font-bold">{task.remaining_count}</span></span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const status = userTaskStatus[task.id];
                                        if (status === 'in_progress') {
                                            return (
                                                <button disabled className="px-6 py-3 rounded-full bg-surface-primary dark:bg-white/5 text-accent-primary font-bold text-sm cursor-not-allowed border border-accent-primary/30 dark:border-accent-primary/30">
                                                    Выполняется
                                                </button>
                                            );
                                        }
                                        if (status === 'pending') {
                                            return (
                                                <button disabled className="px-6 py-3 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 font-bold text-sm cursor-not-allowed border border-amber-200 dark:border-amber-500/30">
                                                    На проверке
                                                </button>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={() => handleTakeTask(task)}
                                                disabled={processingTaskId === task.id}
                                                className="pl-6 pr-5 py-3 rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold text-sm transition-all shadow-lg shadow-accent-primary/30 flex items-center gap-2 group-hover:gap-3 disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {processingTaskId === task.id ? 'Обработка...' : <>Взять <ChevronRight size={16} /></>}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </Card>
                            </StaggerCard>
                        ))
                    )}
                </div>
            </Section>
        </div>
    );
}