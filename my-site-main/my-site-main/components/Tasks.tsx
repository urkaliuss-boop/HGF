import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Clock, Briefcase, ChevronRight, AlertTriangle,
    Lock, Loader2, MapPin, ShoppingBag, Smartphone,
    MessageSquare, Share2, Hash, Star
} from 'lucide-react';
import { toast } from './Toast';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Все', 'Отзывы', 'Авито', 'Соцсети', 'Приложения', 'Другое'];

export const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'авито': return <ShoppingBag size={14} className="text-blue-500" />;
        case 'яндекс карты':
        case 'google maps':
        case '2гис': return <MapPin size={14} className="text-red-500" />;
        case 'приложения': return <Smartphone size={14} className="text-blue-500" />;
        case 'соцсети': return <Share2 size={14} className="text-sky-500" />;
        case 'отзывы': return <MessageSquare size={14} className="text-green-500" />;
        case 'все': return <Star size={14} className="text-amber-500" />;
        default: return <Hash size={14} className="text-slate-400" />;
    }
};

const TaskSkeleton = () => (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
                <div className="w-20 h-6 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                <div className="w-16 h-6 bg-slate-200 dark:bg-white/10 rounded-full"></div>
            </div>
            <div className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-xl"></div>
        </div>
        <div className="w-3/4 h-6 bg-slate-200 dark:bg-white/10 rounded mb-3"></div>
        <div className="w-full h-4 bg-slate-200 dark:bg-white/10 rounded mb-2"></div>
        <div className="w-5/6 h-4 bg-slate-200 dark:bg-white/10 rounded mb-6"></div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4">
            <div className="space-y-2">
                <div className="w-32 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
                <div className="w-24 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
            </div>
            <div className="w-24 h-10 bg-slate-200 dark:bg-white/10 rounded-full"></div>
        </div>
    </div>
);

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
        // Добавим небольшую задержку для плавности лоадеров
        setTimeout(() => setLoading(false), 600);
    };

    const filteredTasks = tasks.filter(task => {
        if (activeCategory !== 'Все' && task.category !== activeCategory) return false;
        const myStatus = userTaskStatus[task.id];
        if (myStatus === 'approved' || myStatus === 'paid') return false;
        if (task.is_one_time && myStatus) return false;
        return true;
    });

    const handleTakeTask = async (task: any) => {
        if (!session) return toast.error('Сначала войдите в аккаунт');
        if (userTaskStatus[task.id]) return toast.error('Вы уже выполняете это задание.');

        setProcessingTaskId(task.id);

        try {
            const { count: activeCount, error: countError } = await supabase
                .from('task_submissions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .in('status', ['in_progress', 'pending']);

            if (countError) {
                toast.error('Ошибка проверки ограничений.');
                setProcessingTaskId(null);
                return;
            }

            if (activeCount !== null && activeCount >= 2) {
                toast.error('Ограничение! Не больше 2 заданий одновременно.');
                setProcessingTaskId(null);
                return;
            }

            const { data: freshTask, error: fetchError } = await supabase
                .from('tasks')
                .select('remaining_count')
                .eq('id', task.id)
                .single();

            if (fetchError || !freshTask || freshTask.remaining_count <= 0) {
                toast.error('Места на это задание уже закончились.');
                fetchTasks(session.user.id);
                setProcessingTaskId(null);
                return;
            }

            const { error: updateError } = await supabase
                .from('tasks')
                .update({ remaining_count: freshTask.remaining_count - 1 })
                .eq('id', task.id);

            if (updateError) {
                toast.error('Ошибка обновления счетчика.');
                setProcessingTaskId(null);
                return;
            }

            const { error: insertError } = await supabase.from('task_submissions').insert({
                user_id: session.user.id,
                task_id: task.id,
                status: 'in_progress',
                deadline: new Date(Date.now() + (task.execution_time_hours || 72) * 3600000)
            });

            if (insertError) {
                toast.error('Ошибка создания заявки');
                setProcessingTaskId(null);
            } else {
                toast.success('Задание взято в работу!');
                setTimeout(() => {
                    window.location.href = '/cabinet';
                }, 1000);
            }
        } catch (err) {
            toast.error('Произошла непредвиденная ошибка');
            setProcessingTaskId(null);
        }
    };

    return (
        <div className="w-full pt-32 px-4 pb-12 max-w-5xl mx-auto min-h-[100dvh]">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 overflow-x-auto pb-4 scrollbar-hide"
            >
                <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300
                            ${activeCategory === cat
                                    ? 'bg-[#0071e3] text-white shadow-glow-sm transform scale-105'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-[#1c1c1e] dark:text-slate-400 dark:hover:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5'
                                }
                        `}
                        >
                            {getCategoryIcon(cat)}
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="grid gap-5">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <TaskSkeleton key={i} />)
                ) : filteredTasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white dark:bg-[#1c1c1e] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 shadow-sm"
                    >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase size={24} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">В категории "{activeCategory}" пока нет доступных заданий</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="group bg-white dark:bg-[#1c1c1e] p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all duration-500 hover:shadow-card-hover relative overflow-hidden"
                            >
                                {/* Premium glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/5">
                                            {getCategoryIcon(task.category)}
                                            {task.category}
                                        </span>
                                        {task.remaining_count < 5 && (
                                            <span className="px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1 border border-orange-100 dark:border-orange-500/20">
                                                <AlertTriangle size={12} /> Мало мест
                                            </span>
                                        )}
                                        {task.is_one_time && (
                                            <span className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 border border-slate-100 dark:border-white/5">
                                                <Lock size={12} /> 1 раз
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center px-4 py-1.5 bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] rounded-xl font-bold text-lg md:text-xl border border-[#0071e3]/20">
                                        +{task.price} ₽
                                    </div>
                                </div>

                                <h3 className="text-xl md:text-2xl font-bold text-[#1d1d1f] dark:text-white mb-3 leading-tight relative z-10 group-hover:text-[#0071e3] transition-colors">
                                    {task.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-3xl relative z-10">
                                    {task.description}
                                </p>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 dark:border-white/5 pt-5 relative z-10 gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                                <Clock size={14} className="text-[#0071e3] dark:text-[#2997ff]" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Время</span>
                                                <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">{task.execution_time_hours || 72} часа</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                                <Briefcase size={14} className="text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Осталось мест</span>
                                                <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">{task.remaining_count}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {(() => {
                                        const status = userTaskStatus[task.id];
                                        if (status === 'in_progress') {
                                            return (
                                                <button disabled className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-50 dark:bg-white/5 text-[#0071e3] font-bold text-sm cursor-not-allowed border border-[#0071e3]/20">
                                                    Выполняется
                                                </button>
                                            );
                                        }
                                        if (status === 'pending') {
                                            return (
                                                <button disabled className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 font-bold text-sm cursor-not-allowed border border-amber-200 dark:border-amber-500/30">
                                                    На проверке
                                                </button>
                                            );
                                        }
                                        return (
                                            <button
                                                onClick={() => handleTakeTask(task)}
                                                disabled={processingTaskId === task.id}
                                                className="w-full sm:w-auto pl-6 pr-5 py-3 rounded-full bg-[#0071e3] hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-glow-sm hover:shadow-glow active:scale-[0.98] flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {processingTaskId === task.id ? <Loader2 className="animate-spin" size={18} /> : <>Взять задание <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" /></>}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}