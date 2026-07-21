import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import PromoSystem from './PromoSystem';
import AdminStatsEditor from './AdminStatsEditor';
import { toast } from './Toast';

import {
    LogOut, Wallet, BarChart3, Briefcase, PlusCircle, CreditCard,
    Smartphone, Globe, Link as LinkIcon, Edit, Trash2, X,
    ExternalLink, Image as ImageIcon, AlertTriangle, Users,
    History, CheckCircle, Landmark, Play, Clock, Send, Calendar, FileText,
    Upload, Check, Construction, Building, Bell, Copy, Lock, Mail, Key, Loader2, ArrowRight,
    Flame, Rocket, Sprout, Zap
} from 'lucide-react';
import ReferralModal from './ReferralModal';
import AchievementModal from './AchievementModal';

const BANK_LIST = ['Сбербанк', 'Т-Банк (Тинькофф)', 'Альфа-Банк', 'ВТБ', 'Озон Банк', 'Райффайзен', 'Газпромбанк', 'Совкомбанк', 'Промсвязьбанк', 'Росбанк'];

const getUserLevelInfo = (completedTasks: number, role: string) => {
    if (role === 'admin') return { name: 'Администратор', bonus: 0, nextLevelNeeded: 0, progress: 100 };
    if (completedTasks >= 20) return { name: 'Легенда', bonus: 0.15, nextLevelNeeded: 20, progress: 100 };
    if (completedTasks >= 10) return { name: 'Опытный', bonus: 0.10, nextLevelNeeded: 20, progress: (completedTasks - 10) / 10 * 100 };
    if (completedTasks >= 5) return { name: 'Продвинутый', bonus: 0.05, nextLevelNeeded: 10, progress: (completedTasks - 5) / 5 * 100 };
    return { name: 'Новичок', bonus: 0, nextLevelNeeded: 5, progress: completedTasks / 5 * 100 };
};

const translateStatus = (status: string) => {
    switch (status) {
        case 'paid': return 'Оплачено';
        case 'pending': return 'На проверке';
        case 'in_progress': return 'В работе';
        case 'rejected': return 'Отказано';
        case 'cancelled': return 'Отменено';
        case 'approved': return 'Принято';
        default: return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
        case 'approved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
        case 'rejected':
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
        case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
        default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
    }
};

const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export default function Dashboard() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Auth Form State
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [isLoginView, setIsLoginView] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);

    // Уведомления
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Вывод средств
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState<'sbp' | 'card' | 'lolz' | 'yoomoney'>('sbp');
    const [requisites, setRequisites] = useState('');
    const [bankName, setBankName] = useState(BANK_LIST[0]);
    const [isWithdrawalSubmitting, setIsWithdrawalSubmitting] = useState(false);

    // Данные
    const [myAllTasks, setMyAllTasks] = useState<any[]>([]);
    const [myWithdrawals, setMyWithdrawals] = useState<any[]>([]);

    // Модалки
    const [viewTask, setViewTask] = useState<any>(null);
    const [viewSubmission, setViewSubmission] = useState<any>(null);
    const [reportModalId, setReportModalId] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState(1);

    // Форма отчета
    const [reportCategory, setReportCategory] = useState('');
    const [reportUsername, setReportUsername] = useState('');
    const [reportProof, setReportProof] = useState('');
    const [reportReviewLink, setReportReviewLink] = useState('');
    const [reportText, setReportText] = useState('');
    const [uploading, setUploading] = useState(false);

    // Статистика
    const [earnings30Days, setEarnings30Days] = useState(0);
    const [levelInfo, setLevelInfo] = useState({ name: 'Новичок', bonus: 0, nextLevelNeeded: 5, progress: 0 });
    const [completedTasksCount, setCompletedTasksCount] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);

    // Админка
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
    const [topReferrers, setTopReferrers] = useState<any[]>([]);
    const [processingId, setProcessingId] = useState<string | number | null>(null);

    const sharePayoutProof = (amount: number) => {
        const storedRef = localStorage.getItem('referral_code') || '';
        const refParam = storedRef ? `?ref=${storedRef}` : '';
        const shareUrl = `${window.location.origin}${refParam}`;
        const shareText = `Я вывел ещё ${amount} ₽ с Noxiss.work! Сервис реально платит за простые отзывы на Авито, Яндекс Картах и 2ГИС. Регистрируйся и зарабатывай вместе со мной по ссылке:`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        toast.success('Ссылка и текст скопированы!');
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    };

    // Админка: Редактирование задач
    const [editingTask, setEditingTask] = useState<any>(null);
    const [adminTasks, setAdminTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskPrice, setNewTaskPrice] = useState('');
    const [newTaskCount, setNewTaskCount] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('Отзывы');
    const [newTaskLink, setNewTaskLink] = useState('');
    const [newTaskHours, setNewTaskHours] = useState('72');
    const [isOneTime, setIsOneTime] = useState(false);

    // Админка: Ручной баланс
    const [adminTargetEmail, setAdminTargetEmail] = useState('');
    const [adminAddAmount, setAdminAddAmount] = useState('');
    const [adminReason, setAdminReason] = useState('');
    const [adminOperationType, setAdminOperationType] = useState<'add' | 'subtract'>('add');

    useEffect(() => {
        // Проверка сессии при загрузке
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) initData(session.user.id);
            else setLoading(false);
        });

        // Слушатель изменений авторизации (вход/выход)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                setLoading(true);
                initData(session.user.id);
            } else {
                setLoading(false);
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const initData = (userId: string) => { fetchProfile(userId); };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            if (isLoginView) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: authEmail,
                    password: authPassword,
                });
                if (error) throw error;
                // Успешный вход обработается в onAuthStateChange
            } else {
                const { error } = await supabase.auth.signUp({
                    email: authEmail,
                    password: authPassword,
                });
                if (error) throw error;
                toast.success('Регистрация успешна! Проверьте почту.');
                setIsLoginView(true);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error) throw error;
            setProfile(data);
            if (data) {
                await Promise.allSettled([
                    fetchMyWithdrawals(userId),
                    fetchMyTasks(userId, data.role),
                    fetchNotifications(userId)
                ]);
                if (data.role === 'admin') {
                    await Promise.allSettled([
                        fetchSubmissions(),
                        fetchAllWithdrawals(),
                        fetchAdminTasks(),
                        fetchMaintenanceStatus(),
                        fetchTopReferrers()
                    ]);
                }
            }
        } catch (e: any) {
            console.error("Critical Error loading profile:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async (userId: string) => {
        const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const markNotificationsRead = async () => {
        if (!session?.user || unreadCount === 0) return;
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
        setUnreadCount(0);
        fetchNotifications(session.user.id);
    };

    const clearAllNotifications = async () => {
        if (!session?.user) return;
        const { error } = await supabase.from('notifications').delete().eq('user_id', session.user.id);
        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
            toast.success('Уведомления очищены');
        } else {
            toast.error('Ошибка очистки');
        }
    };

    const fetchMyTasks = async (userId: string, role: string) => {
        const { data } = await supabase.from('task_submissions').select('*, tasks(*)')
            .eq('user_id', userId).order('created_at', { ascending: false });
        if (data) {
            setMyAllTasks(data);
            const completed = data.filter(t => t.status === 'approved').length;
            setCompletedTasksCount(completed);
            const info = getUserLevelInfo(completed, role || 'user');
            setLevelInfo(info);
            // Считаем заработок за 30 дней
            const date30DaysAgo = new Date();
            date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
            const sum = data
                .filter(t => t.status === 'approved' && new Date(t.created_at) >= date30DaysAgo)
                .reduce((acc, t) => acc + (t.tasks?.price || 0), 0);
            setEarnings30Days(sum);

            // Calculate total earned for achievements
            const allTimeSum = data.filter(t => t.status === 'approved').reduce((acc, t) => acc + (t.tasks?.price || 0), 0);
            setTotalEarned(allTimeSum);
        }
    };

    const fetchMyWithdrawals = async (userId: string) => {
        const { data } = await supabase.from('withdrawals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setMyWithdrawals(data);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;
            if (!session?.user) return;
            setUploading(true);
            const file = event.target.files[0];
            const compressImage = (file: File): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const maxWidth = 1200;
                        let width = img.width;
                        let height = img.height;
                        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                        canvas.width = width; canvas.height = height;
                        ctx?.drawImage(img, 0, 0, width, height);
                        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Compression failed')); }, 'image/jpeg', 0.7);
                    };
                    img.onerror = reject;
                });
            };
            const compressedBlob = await compressImage(file);
            const filePath = `${session.user.id}/${Math.random()}.jpg`;
            const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, compressedBlob);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath);
            setReportProof(publicUrl);
            toast.success('Скриншот загружен!');
        } catch (error: any) {
            toast.error('Ошибка: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const createWithdrawal = async () => {
        if (isWithdrawalSubmitting) return;
        if (!session?.user) return;
        if (!profile || Number(withdrawAmount) > profile.balance || Number(withdrawAmount) < 40) return toast.error('Ошибка суммы (мин 40р)');
        if (requisites.length < 5) return toast.error('Укажите реквизиты');

        setIsWithdrawalSubmitting(true);
        try {
            const amount = Number(withdrawAmount);
            let detailsStr = '';
            if (withdrawMethod === 'sbp') detailsStr = `СБП (${bankName}): ${requisites}`;
            else if (withdrawMethod === 'card') detailsStr = `Карта: ${requisites}`;
            else if (withdrawMethod === 'lolz') detailsStr = `Lolz: ${requisites}`;
            else if (withdrawMethod === 'yoomoney') detailsStr = `ЮMoney: ${requisites}`;

            // Читаем актуальный баланс из БД (защита от race condition)
            const { data: freshProfile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
            if (!freshProfile || freshProfile.balance < amount) {
                toast.error('Недостаточно средств'); return;
            }

            const { error } = await supabase.from('withdrawals').insert({ user_id: session.user.id, amount: amount, details: detailsStr });
            if (!error) {
                await supabase.from('profiles').update({ balance: freshProfile.balance - amount }).eq('id', session.user.id);
                toast.success('Заявка создана!');
                setWithdrawAmount(''); setRequisites('');
                fetchProfile(session.user.id);
            } else toast.error(error.message);
        } finally {
            setIsWithdrawalSubmitting(false);
        }
    };

    const cancelMyWithdrawal = async (wd: any) => {
        if (!session?.user) return;
        if (!confirm('Отменить заявку? Средства вернутся на баланс.')) return;
        const { error } = await supabase.from('withdrawals').update({ status: 'cancelled' }).eq('id', wd.id);
        if (!error) {
            // Читаем актуальный баланс из БД (защита от race condition)
            const { data: freshProfile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
            const currentBalance = freshProfile ? Number(freshProfile.balance) : Number(profile.balance);
            const newBalance = currentBalance + Number(wd.amount);
            await supabase.from('profiles').update({ balance: newBalance }).eq('id', session.user.id);
            setProfile({ ...profile, balance: newBalance });
            fetchMyWithdrawals(session.user.id);
            toast.success('Заявка отменена');
        } else { toast.error(error.message); }
    };

    // --- ADMIN FUNCTIONS ---
    const fetchTopReferrers = async () => { const { data } = await supabase.from('profiles').select('*').gt('referral_earnings', 0).order('referral_earnings', { ascending: false }).limit(20); setTopReferrers(data || []); };
    const adminAddMoney = async () => {
        if (!adminTargetEmail || !adminAddAmount || !adminReason) return toast.error('Заполните все поля');
        const { data: user } = await supabase.from('profiles').select('id, balance').eq('email', adminTargetEmail).single();
        if (!user) return toast.error('Юзер не найден');
        const change = adminOperationType === 'add' ? Number(adminAddAmount) : -Number(adminAddAmount);
        const { error } = await supabase.from('profiles').update({ balance: Number(user.balance) + change }).eq('id', user.id);
        if (!error) { toast.success(`Баланс обновлен: ${adminOperationType === 'add' ? '+' : '-'}${adminAddAmount}₽`); setAdminAddAmount(''); setAdminReason(''); setAdminTargetEmail(''); } else toast.error(error.message);
    };

    const adminReviewTask = async (isApproved: boolean) => {
        if (!viewSubmission) return;

        const subId = viewSubmission.id;
        const { data: currentSub } = await supabase.from('task_submissions').select('status').eq('id', subId).single();
        if (!currentSub || currentSub.status !== 'pending') {
            toast.error('Это задание уже было обработано!');
            setProcessingId(null);
            setViewSubmission(null);
            fetchSubmissions();
            return;
        }

        setProcessingId(subId);
        const userId = viewSubmission.user_id;
        const basePrice = viewSubmission.tasks.price;
        const taskId = viewSubmission.task_id;
        let rejectionReason = null;
        let finalPrice = 0;
        if (!isApproved) { rejectionReason = prompt("Укажите причину отказа:"); if (rejectionReason === null) { setProcessingId(null); return; } }
        else {
            const { count } = await supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'approved');
            const userLvl = getUserLevelInfo(count || 0, 'user');
            finalPrice = (basePrice * reviewCount) * (1 + userLvl.bonus);
            finalPrice = Math.floor(finalPrice);
        }
        if (isApproved) {
            await supabase.from('task_submissions').update({ status: 'approved' }).eq('id', subId);
            const { data: user } = await supabase.from('profiles').select('balance').eq('id', userId).single();
            if (user) await supabase.from('profiles').update({ balance: user.balance + finalPrice }).eq('id', userId);

            // Auto-update business order progress
            const { data: taskData } = await supabase.from('tasks').select('business_order_id').eq('id', taskId).single();
            if (taskData?.business_order_id) {
                const { data: order } = await supabase.from('business_orders').select('completed_count, review_count').eq('id', taskData.business_order_id).single();
                if (order) {
                    const newCount = (order.completed_count || 0) + reviewCount;
                    const newStatus = newCount >= order.review_count ? 'completed' : 'active';
                    await supabase.from('business_orders').update({ completed_count: newCount, status: newStatus }).eq('id', taskData.business_order_id);
                }
            }

            toast.success(`Оплачено: ${finalPrice}₽`);
        } else {
            await supabase.from('task_submissions').update({ status: 'rejected', rejection_reason: rejectionReason }).eq('id', subId);
            const { data: task } = await supabase.from('tasks').select('remaining_count').eq('id', taskId).single();
            if (task) await supabase.from('tasks').update({ remaining_count: task.remaining_count + 1 }).eq('id', taskId);
            toast.info('Отклонено');
        }
        setProcessingId(null); setViewSubmission(null); setReviewCount(1); fetchSubmissions();
    };

    const fetchSubmissions = async () => { const { data } = await supabase.from('task_submissions').select('*, tasks(title, price, id), profiles(email)').eq('status', 'pending').order('created_at', { ascending: false }); if (data) setSubmissions(data); };
    const fetchAllWithdrawals = async () => { const { data } = await supabase.from('withdrawals').select('*, profiles(email)').eq('status', 'pending').order('created_at', { ascending: false }); if (data) setAllWithdrawals(data); };
    const fetchAdminTasks = async () => { const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }); if (data) setAdminTasks(data); };
    const fetchMaintenanceStatus = async () => { const { data } = await supabase.from('app_settings').select('value').eq('key', 'maintenance_mode').single(); if (data) setMaintenanceMode(data.value === 'true'); };
    const toggleMaintenance = async () => { if (!confirm('Сменить режим тех. работ?')) return; const newVal = !maintenanceMode; await supabase.from('app_settings').update({ value: String(newVal) }).eq('key', 'maintenance_mode'); setMaintenanceMode(newVal); toast.success('Режим обновлен'); };

    const saveTask = async () => {
        const taskData = {
            title: newTaskTitle,
            description: newTaskDesc,
            price: Number(newTaskPrice),
            total_count: Number(newTaskCount),
            category: newTaskCategory,
            link: newTaskLink,
            execution_time_hours: Number(newTaskHours),
            is_one_time: isOneTime
        };
        if (editingTask) await supabase.from('tasks').update(taskData).eq('id', editingTask.id);
        else await supabase.from('tasks').insert({ ...taskData, remaining_count: Number(newTaskCount) });
        toast.success('Сохранено');
        setEditingTask(null); fetchAdminTasks();
    };

    const deleteTask = async (id: number) => { if (confirm('Удалить?')) { await supabase.from('tasks').delete().eq('id', id); fetchAdminTasks(); } };
    const adminProcessWithdrawal = async (wdId: number, userId: string, amount: number, action: 'paid' | 'rejected') => { let reason = null; if (action === 'rejected') { reason = prompt("Причина отказа:"); if (reason === null) return; } await supabase.from('withdrawals').update({ status: action, rejection_reason: reason }).eq('id', wdId); if (action === 'rejected') { const { data: user } = await supabase.from('profiles').select('balance').eq('id', userId).single(); if (user) await supabase.from('profiles').update({ balance: user.balance + amount }).eq('id', userId); } toast.success('Обработано'); fetchAllWithdrawals(); };

    const submitReport = async () => {
        if (!reportModalId) return;
        if (!session?.user) return;
        if (!reportProof) return toast.error('Прикрепите скриншот!');

        // НОВАЯ ПРОВЕРКА ДЛЯ ОТЗЫВОВ
        if (reportCategory === 'Отзывы' && !reportReviewLink) {
            return toast.error('Укажите ссылку на отзыв!');
        }

        const { error } = await supabase.from('task_submissions').update({ status: 'pending', review_username: reportUsername, proof_link: reportProof, review_link: reportReviewLink, report: reportText }).eq('id', reportModalId);
        if (!error) {
            toast.success('Отправлено'); setReportModalId(null); setReportProof(''); setReportUsername(''); setReportText(''); setReportReviewLink('');
            fetchMyTasks(session.user.id, profile.role);
        }
    };

    const startEditTask = (t: any) => {
        setEditingTask(t);
        setNewTaskTitle(t.title);
        setNewTaskDesc(t.description);
        setNewTaskPrice(t.price);
        setNewTaskCount(t.total_count);
        setNewTaskCategory(t.category || 'Отзывы');
        setNewTaskLink(t.link);
        setNewTaskHours(t.execution_time_hours);
        setIsOneTime(t.is_one_time || false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => { setEditingTask(null); setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskPrice(''); setNewTaskCount(''); setNewTaskCategory('Отзывы'); setNewTaskLink(''); setNewTaskHours('72'); setIsOneTime(false); };
    const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Скопировано!'); };

    if (loading) return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[#F5F5F7] dark:bg-black">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[#0071e3]" size={32} />
                <span className="text-sm text-[#86868b] font-medium">Загрузка кабинета...</span>
            </div>
        </div>
    );

    // --- LOGIN / REGISTER FORM ---
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
                <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0071e3] to-[#2997ff]"></div>

                    <h2 className="text-3xl font-bold text-center mb-2 dark:text-white">
                        {isLoginView ? 'Вход' : 'Регистрация'}
                    </h2>
                    <p className="text-center text-slate-500 mb-8 text-sm">
                        {isLoginView ? 'С возвращением! Войдите для доступа.' : 'Создайте аккаунт, чтобы начать зарабатывать.'}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={authEmail}
                                    onChange={(e) => setAuthEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-colors dark:text-white"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Пароль</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={authPassword}
                                    onChange={(e) => setAuthPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 transition-colors dark:text-white"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-4 bg-[#0071e3] hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {authLoading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Войти' : 'Создать аккаунт')}
                            {!authLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="text-sm text-slate-500 hover:text-blue-500 transition-colors"
                        >
                            {isLoginView ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 text-center">
                        <Link to="/business-cabinet" className="text-xs font-bold text-slate-400 hover:text-[#0071e3] transition-colors">
                            Вы владелец бизнеса? <span className="text-[#0071e3]">Кабинет заказчика →</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- DASHBOARD ---

    const activeTasks = myAllTasks.filter(t => ['in_progress', 'pending'].includes(t.status));

    return (
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm border border-slate-100 dark:border-white/5 relative z-20 gap-4">
                <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-[#0071e3] to-[#42a1ff] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
                        {profile?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base md:text-lg font-bold dark:text-white leading-tight truncate">{profile?.email}</h1>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-full dark:text-slate-400 font-medium inline-block mt-1">ID: {session?.user?.id?.slice(0, 8)}</span>
                    </div>
                    <div className="flex md:hidden gap-2">
                        <button onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }} className="p-2.5 bg-slate-100 dark:bg-white/10 rounded-full relative">
                            <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1c1c1e]"></span>}
                        </button>
                        <button onClick={() => supabase.auth.signOut()} className="p-2.5 bg-red-500/10 text-red-500 rounded-full"><LogOut size={18} /></button>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <div className="relative">
                        <button onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }} className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition relative">
                            <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                            {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#1c1c1e]"></span>}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 top-14 w-80 bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-fade-in-up">
                                <div className="p-3 border-b border-slate-100 dark:border-white/5 font-bold dark:text-white flex justify-between">
                                    <span>Уведомления</span>
                                    <span className="text-xs text-slate-400 font-normal cursor-pointer hover:text-blue-500" onClick={clearAllNotifications}>Очистить</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? <div className="p-6 text-center text-slate-400 text-sm">Нет новых уведомлений</div> : notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-slate-50 dark:border-white/5 text-sm ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                            <div className="flex justify-between mb-1"><span className={`font-bold text-xs ${n.type === 'success' ? 'text-green-600' : n.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>{n.title}</span><span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span></div>
                                            <p className="text-slate-700 dark:text-slate-300 leading-snug">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={() => supabase.auth.signOut()} className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl text-xs font-bold transition flex items-center gap-2"><LogOut size={16} /> Выйти</button>
                </div>
            </div>

            {/* NOTIFICATIONS MOBILE */}
            {showNotifications && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
                    <div className="absolute top-20 left-4 right-4 bg-white dark:bg-[#2c2c2e] rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 font-bold dark:text-white flex justify-between"><span>Уведомления</span><span className="text-xs text-slate-400 font-normal" onClick={clearAllNotifications}>Очистить</span></div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Пусто</div> : notifications.map(n => (
                                <div key={n.id} className="p-4 border-b border-slate-50 dark:border-white/5 text-sm"><p className="font-bold dark:text-white">{n.title}</p><p className="text-slate-500 dark:text-slate-400">{n.message}</p></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ACHIEVEMENTS MODAL */}
            <AchievementModal userId={session.user.id} earnedTotal={totalEarned} onClose={() => { }} />

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium uppercase tracking-wide"><Wallet size={14} /> Баланс</div>
                    <div className="text-3xl font-bold dark:text-white break-words leading-none">{profile?.balance || 0} ₽</div>
                </div>
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium uppercase tracking-wide"><BarChart3 size={14} /> Доход (30д)</div>
                    <div className="text-3xl font-bold text-green-500 break-words leading-none">+{earnings30Days} ₽</div>
                </div>
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-[#2997ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium uppercase tracking-wide"><CheckCircle size={14} /> Статус</div>
                            <div className="text-xl font-bold text-[#0071e3] break-words flex items-center gap-1.5">
                                {levelInfo.name === 'Легенда' && <Zap size={18} className="text-amber-500 fill-amber-500 animate-pulse" />}
                                {levelInfo.name === 'Опытный' && <Flame size={18} className="text-orange-500 fill-orange-500" />}
                                {levelInfo.name === 'Продвинутый' && <Rocket size={18} className="text-blue-500" />}
                                {levelInfo.name === 'Новичок' && <Sprout size={18} className="text-green-500" />}
                                <span>{levelInfo.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Бонус: <span className="text-green-500 font-bold">+{levelInfo.bonus * 100}%</span></div>
                        </div>
                    </div>

                    {/* GAMIFICATION PROGRESS BAR */}
                    {profile?.role !== 'admin' && levelInfo.name !== 'Легенда' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Прогресс ранга</span>
                                <span className="text-[10px] font-bold text-[#0071e3]">{completedTasksCount} / {levelInfo.nextLevelNeeded}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-black/50 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full shadow-[0_0_10px_rgba(0,113,227,0.3)] transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, Math.max(0, levelInfo.progress))}%` }}
                                ></div>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1.5 text-right">
                                Осталось заданий: <span className="text-slate-600 dark:text-slate-300 font-bold">{Math.max(0, levelInfo.nextLevelNeeded - completedTasksCount)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* VIRAL REFERRAL BANNER */}
            <div className="bg-gradient-to-r from-[#0071e3] to-[#1c1c1e] text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
                <div className="space-y-2 relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                        <Users size={20} className="text-blue-300" />
                        Зарабатывайте на рекомендациях
                    </h3>
                    <p className="text-sm text-slate-300 max-w-xl">
                        Приглашайте бизнес-партнеров и получайте <strong className="text-white font-bold">10% от их рекламного бюджета пожизненно</strong>, а также 5% от дохода привлеченных воркеров.
                    </p>
                </div>
                <button
                    onClick={() => setIsRefModalOpen(true)}
                    className="px-6 py-3.5 bg-white text-[#0071e3] hover:bg-slate-100 font-bold rounded-2xl text-xs whitespace-nowrap active:scale-95 transition-all shadow-md shrink-0 relative z-10"
                >
                    Получить ссылку партнера
                </button>
            </div>

            {/* PROMO */}
            <PromoSystem userRole={profile?.role} onBalanceUpdate={() => fetchProfile(session?.user?.id)} />

            {/* ACTIVE TASKS */}
            {activeTasks.length > 0 && (
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white"><Play size={18} className="text-[#0071e3]" /> Мои задания</h2>
                    <div className="space-y-3">
                        {activeTasks.map(task => (
                            <div key={task.id} className="p-4 rounded-2xl bg-white dark:bg-[#252527] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start gap-3 shadow-sm">
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-sm md:text-base dark:text-white pr-2 leading-tight">{task.tasks?.title}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>{translateStatus(task.status)}</span>
                                    </div>
                                    <div className="flex gap-3 text-[10px] md:text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(task.created_at).toLocaleDateString()}</span>
                                        {task.tasks?.is_one_time && <span className="flex items-center gap-1 text-slate-500 font-bold bg-slate-100 dark:bg-slate-900/20 px-1.5 rounded"><Lock size={10} /> 1 раз</span>}
                                    </div>
                                </div>
                                <div className="w-full md:w-auto flex gap-2 pt-2 md:pt-0">
                                    <button onClick={() => setViewTask(task)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-white/10 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 text-xs flex items-center justify-center gap-1"><FileText size={14} /> ТЗ</button>
                                    {task.status === 'in_progress' && (
                                        <button onClick={() => { setReportModalId(task.id); setReportCategory(task.tasks?.category || ''); setReportReviewLink(''); }} className="flex-1 px-4 py-2.5 bg-[#0071e3] hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg shadow-blue-500/20"><Send size={14} /> Сдать</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* WITHDRAWAL & HISTORY */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white"><Briefcase size={18} className="text-[#0071e3]" /> Вывод средств</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 dark:bg-black/40 rounded-xl">
                            <button onClick={() => setWithdrawMethod('sbp')} className={`py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${withdrawMethod === 'sbp' ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] shadow-sm' : 'text-slate-500'}`}><Smartphone size={16} /> СБП</button>
                            <button onClick={() => setWithdrawMethod('card')} className={`py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${withdrawMethod === 'card' ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] shadow-sm' : 'text-slate-500'}`}><CreditCard size={16} /> Карта</button>
                            <button onClick={() => setWithdrawMethod('lolz')} className={`py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${withdrawMethod === 'lolz' ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] shadow-sm' : 'text-slate-500'}`}><Globe size={16} /> Lolz</button>
                            <button onClick={() => setWithdrawMethod('yoomoney')} className={`py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${withdrawMethod === 'yoomoney' ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] shadow-sm' : 'text-slate-500'}`}><Wallet size={16} /> ЮM</button>
                        </div>
                        {withdrawMethod === 'sbp' && (
                            <div className="relative">
                                <select className="w-full p-3.5 pl-10 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none text-sm dark:text-white appearance-none" value={bankName} onChange={e => setBankName(e.target.value)}>{BANK_LIST.map(bank => (<option key={bank} value={bank}>{bank}</option>))}</select>
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Landmark size={18} /></div>
                            </div>
                        )}
                        <div className="relative"><input type="text" placeholder={withdrawMethod === 'sbp' ? 'Номер телефона' : 'Реквизиты'} className="w-full p-3.5 pl-10 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none text-sm dark:text-white" value={requisites} onChange={e => setRequisites(e.target.value)} /><div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><CreditCard size={18} /></div></div>
                        <div className="relative"><input type="number" placeholder="0" className="w-full p-3.5 pl-4 pr-10 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none font-bold text-lg dark:text-white" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} /><div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₽</div></div>
                        <button onClick={createWithdrawal} disabled={isWithdrawalSubmitting} className={`w-full py-3.5 bg-[#0071e3] hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform ${isWithdrawalSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>Вывести</button>
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 dark:text-white flex gap-2"><History size={18} /> История</h3>
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                        {myWithdrawals.map(w => (
                            <div key={w.id} className="relative p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group">
                                <div className="flex justify-between items-start mb-1"><div><p className="font-bold dark:text-white">{w.amount} ₽</p><p className="text-[10px] text-slate-400">{new Date(w.created_at).toLocaleDateString()}</p></div><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(w.status)}`}>{translateStatus(w.status)}</span></div>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{w.details}</p>
                                {w.status === 'rejected' && w.rejection_reason && (<div className="mt-2 flex items-start gap-1 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-1.5 rounded border border-red-100 dark:border-red-500/20"><AlertTriangle size={12} className="flex-shrink-0 mt-0.5" /><span>Причина: {w.rejection_reason}</span></div>)}
                                {w.status === 'pending' && (<button onClick={() => cancelMyWithdrawal(w)} className="absolute top-3 right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-500 p-1.5 rounded-full"><X size={14} /></button>)}
                                {w.status === 'paid' && (
                                    <button
                                        onClick={() => sharePayoutProof(w.amount)}
                                        className="mt-2 w-full py-1.5 bg-[#34c759] hover:bg-green-600 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm shadow-green-500/10"
                                    >
                                        <Send size={10} /> Поделиться выплатой
                                    </button>
                                )}
                            </div>
                        ))}
                        {myWithdrawals.length === 0 && <p className="text-slate-500 text-xs text-center py-10">История пуста</p>}
                    </div>
                </div>
            </div>

            {/* MODAL: VIEW TASK / INSTRUCTIONS */}
            {viewTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setViewTask(null)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20"><X size={20} className="dark:text-white" /></button>

                        <div className="mb-6">
                            <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-100 dark:bg-blue-500/20 px-2 py-1 rounded mb-2 inline-block">Задание #{viewTask.id}</span>
                            <h2 className="text-2xl md:text-3xl font-bold dark:text-white mb-4 leading-tight">{viewTask.tasks?.title}</h2>

                            <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-100 dark:border-white/5 text-sm md:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {viewTask.tasks?.description}
                            </div>
                        </div>

                        {viewTask.tasks?.link && (
                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ссылка для выполнения</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-slate-100 dark:bg-white/5 p-4 rounded-xl text-blue-600 dark:text-blue-400 font-mono text-xs md:text-sm truncate border border-slate-200 dark:border-white/10 select-all">
                                        {viewTask.tasks.link}
                                    </div>
                                    <button onClick={() => copyToClipboard(viewTask.tasks.link)} className="p-4 bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-600/30 transition shadow-sm" title="Копировать">
                                        <Copy size={20} />
                                    </button>
                                    <a href={ensureAbsoluteUrl(viewTask.tasks.link)} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-200 dark:bg-white/10 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition shadow-sm" title="Перейти">
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                            {viewTask.status === 'in_progress' && (
                                <button onClick={() => { setReportModalId(viewTask.id); setReportCategory(viewTask.tasks?.category || ''); setReportReviewLink(''); setViewTask(null); }} className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 text-lg active:scale-95 transition-transform">
                                    Сдать отчет
                                </button>
                            )}
                            <button onClick={() => setViewTask(null)} className="px-6 py-4 bg-slate-100 dark:bg-white/5 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition">
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reportModalId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#2c2c2e] w-full max-w-lg rounded-3xl p-6 relative border border-slate-200 dark:border-white/10 shadow-2xl">
                        <button onClick={() => setReportModalId(null)} className="absolute top-4 right-4 bg-slate-100 dark:bg-white/10 p-2 rounded-full"><X size={20} className="dark:text-white" /></button>
                        <h3 className="text-xl font-bold dark:text-white mb-4">Сдача отчета</h3>
                        <div className="space-y-4">
                            <input className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-black/30 outline-none dark:text-white" placeholder="Никнейм / Аккаунт" value={reportUsername} onChange={e => setReportUsername(e.target.value)} />

                            {/* ПОЛЕ ДЛЯ ССЫЛКИ НА ОТЗЫВ (ТОЛЬКО ЕСЛИ КАТЕГОРИЯ - ОТЗЫВЫ) */}
                            {reportCategory === 'Отзывы' && (
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-black/30 outline-none dark:text-white"
                                        placeholder="Ссылка на ваш отзыв (обязательно)"
                                        value={reportReviewLink}
                                        onChange={e => setReportReviewLink(e.target.value)}
                                    />
                                </div>
                            )}

                            <label className={`w-full flex items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${reportProof ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600' : 'border-slate-300 dark:border-white/20 text-slate-500 hover:border-blue-500'}`}>
                                {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div> : <Upload size={24} />}
                                <span className="text-sm font-bold">{reportProof ? 'Скриншот загружен' : 'Загрузить скриншот'}</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                            {reportCategory !== 'Соцсети' && <textarea className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-black/30 outline-none dark:text-white min-h-[100px]" placeholder="Комментарий..." value={reportText} onChange={e => setReportText(e.target.value)} />}
                            <button onClick={submitReport} className="w-full py-3.5 bg-[#0071e3] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20">Отправить</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADMIN PANEL --- */}
            {profile?.role === 'admin' && (
                <div className="border-t-4 border-amber-500 pt-8 mt-8 bg-white dark:bg-[#1c1c1e] p-6 sm:p-8 rounded-3xl shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Админ-панель</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Link to="/admin/users" className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20">
                                <Users size={18} /> Юзеры
                            </Link>
                            <button onClick={toggleMaintenance} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-sm flex justify-center items-center gap-2 ${maintenanceMode ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Construction size={18} /> {maintenanceMode ? 'Tech: ON' : 'Tech: OFF'}
                            </button>
                        </div>
                    </div>

                    <AdminStatsEditor />

                    <div className="grid lg:grid-cols-2 gap-8 mt-8">
                        {/* CREATE TASK */}
                        <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white">{editingTask ? 'Редактирование' : 'Новое задание'}</h3>{editingTask && <button onClick={cancelEdit} className="text-xs text-red-500">Отмена</button>}</div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Заголовок" className="admin-input" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                                <textarea placeholder="Описание" className="admin-input h-20" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} />
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Цена" className="admin-input" value={newTaskPrice} onChange={e => setNewTaskPrice(e.target.value)} />
                                    <input type="number" placeholder="Кол-во" className="admin-input" value={newTaskCount} onChange={e => setNewTaskCount(e.target.value)} />
                                </div>
                                <div className="flex gap-2">
                                    <select className="admin-input" value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)}><option>Отзывы</option><option>Соцсети</option><option>Приложения</option><option>Авито</option></select>
                                    <input type="text" placeholder="Ссылка" className="admin-input" value={newTaskLink} onChange={e => setNewTaskLink(e.target.value)} />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-3 rounded-xl cursor-pointer" onClick={() => setIsOneTime(!isOneTime)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${isOneTime ? 'bg-blue-600 border-blue-600' : 'border-slate-400'}`}>
                                        {isOneTime && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm dark:text-white select-none">Одноразовое выполнение (исчезнет после проверки)</span>
                                </div>
                                <button onClick={saveTask} className="w-full py-3 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl font-bold">Сохранить</button>
                            </div>
                        </div>

                        {/* TASK LIST (FIXED) */}
                        <div className="bg-slate-50 dark:bg-black/20 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 max-h-[400px] overflow-y-auto">
                            <h3 className="font-bold mb-4 dark:text-white">Все задания ({adminTasks.length})</h3>
                            <div className="space-y-2">
                                {adminTasks.map(t => (
                                    <div key={t.id} className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-sm dark:text-white leading-tight line-clamp-2">{t.title}</p>
                                            <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/10 px-1.5 rounded whitespace-nowrap dark:text-slate-300">ID: {t.id}</span>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <span className="font-bold text-green-600">{t.price} ₽</span> <span className="mx-1">|</span> Ост: <span className="font-bold dark:text-white">{t.remaining_count}</span>
                                                {t.is_one_time && <span className="text-[10px] bg-slate-100 dark:bg-slate-900/30 text-slate-600 px-1 rounded">1 раз</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); startEditTask(t); }} className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition" title="Редактировать"><Edit size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Удалить"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SUBMISSIONS & WITHDRAWALS - SEPARATED BLOCKS FOR VISIBILITY */}
                    <div className="grid lg:grid-cols-2 gap-8 mt-8">
                        {/* SUBMISSIONS */}
                        <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <h3 className="font-bold mb-4 dark:text-white">Отчеты ({submissions.length})</h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {submissions.length === 0 && <p className="text-sm text-slate-400">Нет отчетов</p>}
                                {submissions.map(sub => (
                                    <div key={sub.id} className="p-3 border rounded-xl bg-white dark:bg-white/5 dark:border-white/10 flex justify-between items-center">
                                        <div className="min-w-0 pr-2">
                                            <div className="font-bold text-xs text-blue-600 truncate">{sub.tasks?.title}</div>
                                            <div className="text-[10px] text-slate-500 truncate">{sub.profiles?.email}</div>
                                        </div>
                                        <button onClick={() => setViewSubmission(sub)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold whitespace-nowrap">Проверить</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* WITHDRAWALS - EXPLICIT BLOCK */}
                        <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                            <h3 className="font-bold mb-4 dark:text-white">Выводы ({allWithdrawals.length})</h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {allWithdrawals.length === 0 && <p className="text-sm text-slate-400">Нет заявок</p>}
                                {allWithdrawals.map(wd => (
                                    <div key={wd.id} className="p-3 border rounded-xl bg-amber-50 dark:bg-amber-900/10 dark:border-white/10 flex justify-between items-center">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="font-bold text-sm dark:text-white">{wd.amount} ₽</div>
                                            <div className="text-[10px] text-slate-500">{wd.profiles?.email}</div>
                                            <div className="text-[10px] text-slate-400 break-all whitespace-normal select-all bg-white dark:bg-white/10 p-1 rounded mt-1">
                                                {wd.details}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => adminProcessWithdrawal(wd.id, wd.user_id, wd.amount, 'paid')} className="p-2 bg-slate-900 dark:bg-white dark:text-black text-white rounded-lg"><Check size={14} /></button>
                                            <button onClick={() => adminProcessWithdrawal(wd.id, wd.user_id, wd.amount, 'rejected')} className="p-2 bg-red-500 text-white rounded-lg"><X size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADMIN SUBMISSION CHECK MODAL */}
            {viewSubmission && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-lg p-6 rounded-3xl relative border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setViewSubmission(null)} className="absolute top-4 right-4 bg-slate-100 dark:bg-white/10 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition"><X size={20} className="dark:text-white" /></button>

                        <h3 className="font-bold mb-4 dark:text-white text-xl">Проверка задания</h3>

                        <div className="bg-slate-50 dark:bg-black/30 p-4 rounded-xl space-y-4 text-sm dark:text-slate-300 mb-6 border border-slate-200 dark:border-white/5">

                            {/* Исполнитель */}
                            <div>
                                <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Исполнитель</span>
                                <div className="font-mono bg-white dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5 select-all text-slate-700 dark:text-slate-200">
                                    {viewSubmission.review_username || 'Не указан'}
                                </div>
                            </div>

                            {/* Текстовый отчет */}
                            {viewSubmission.report && (
                                <div>
                                    <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Комментарий / Отчет</span>
                                    <div className="bg-white dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5 whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200">
                                        {viewSubmission.report}
                                    </div>
                                </div>
                            )}

                            {/* Ссылка на проверку (С ИСПРАВЛЕНИЕМ) */}
                            {viewSubmission.review_link && (
                                <div>
                                    <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Ссылка на проверку</span>
                                    <div className="flex gap-2 items-stretch">
                                        <a
                                            href={ensureAbsoluteUrl(viewSubmission.review_link)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg border border-blue-100 dark:border-blue-500/20 text-xs font-mono break-all hover:underline flex items-center gap-2 group transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                        >
                                            <ExternalLink size={14} className="flex-shrink-0" />
                                            {viewSubmission.review_link}
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(viewSubmission.review_link)}
                                            className="px-3 bg-slate-200 dark:bg-white/10 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition flex items-center justify-center"
                                            title="Скопировать"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Скриншот */}
                            {viewSubmission.proof_link && (
                                <div>
                                    <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Скриншот</span>
                                    <a
                                        href={ensureAbsoluteUrl(viewSubmission.proof_link)}
                                        target="_blank"
                                        className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 text-blue-600 dark:text-blue-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition"
                                    >
                                        <ImageIcon size={18} />
                                        <span>Открыть изображение</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Множитель оплаты */}
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 5].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setReviewCount(n)}
                                    className={`flex-1 py-2 rounded-xl border font-bold text-xs transition-all ${reviewCount === n ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'dark:text-white border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                >
                                    x{n}
                                </button>
                            ))}
                        </div>

                        <div className="text-center mb-6 bg-slate-50 dark:bg-white/5 py-3 rounded-xl">
                            <span className="text-slate-500 text-xs uppercase font-bold mr-2">К оплате:</span>
                            <span className="text-green-500 font-bold text-xl">{(viewSubmission.tasks.price * reviewCount).toFixed(0)} ₽</span>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => adminReviewTask(true)} className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all">
                                Оплатить
                            </button>
                            <button onClick={() => adminReviewTask(false)} className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                Отказать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{` .admin-input { width: 100%; padding: 12px; border-radius: 12px; background-color: #f1f5f9; border: none; outline: none; font-size: 14px; } .dark .admin-input { background-color: rgba(255,255,255,0.1); color: white; } `}</style>
        </div>
    );
}