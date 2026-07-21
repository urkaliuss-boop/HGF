import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from './Toast';
import {
    Briefcase, PlusCircle, ChevronLeft, TrendingUp, ExternalLink,
    Loader2, Package, CheckCircle, Clock, X, Wallet, BarChart3,
    Send, Eye, ArrowRight, CreditCard, Code2
} from 'lucide-react';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './RealPlatformIcons';
import WidgetBuilder from './WidgetBuilder';

const SUPABASE_FUNCTIONS_URL = 'https://uqjavxbkcsqdfssrlplp.supabase.co/functions/v1';

const PLATFORMS = [
    { name: 'Авито', icon: AvitoIcon, color: 'from-[#ff5e5b] to-[#00aaff]', pricePerReview: 400, workerPrice: 150 },
    { name: 'Яндекс Карты', icon: YandexIcon, color: 'from-[#f23030] to-[#ff6b6b]', pricePerReview: 700, workerPrice: 100 },
    { name: 'Google Maps', icon: GoogleMapsIcon, color: 'from-[#ea4335] to-[#4285f4]', pricePerReview: 600, workerPrice: 40 },
    { name: '2ГИС', icon: TwoGisIcon, color: 'from-[#5cb813] to-[#82db34]', pricePerReview: 500, workerPrice: 50 },
];

export default function BusinessDashboard() {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [viewOrder, setViewOrder] = useState<any>(null);
    const [orderSubmissions, setOrderSubmissions] = useState<any[]>([]);

    // New Order Form
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
    const [targetLink, setTargetLink] = useState('');
    const [instructions, setInstructions] = useState('');
    const [reviewCount, setReviewCount] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Payment modal
    const [showPayment, setShowPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(3000);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [payments, setPayments] = useState<any[]>([]);

    // Price calculation
    let discount = 0;
    if (reviewCount >= 50) discount = 0.25;
    else if (reviewCount >= 20) discount = 0.15;
    else if (reviewCount >= 10) discount = 0.10;

    const pricePerReview = Math.floor(selectedPlatform.pricePerReview * (1 - discount));
    const totalPrice = pricePerReview * reviewCount;
    const oldPrice = selectedPlatform.pricePerReview * reviewCount;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchData(session.user.id);
            else setLoading(false);
        });
    }, []);

    const fetchData = async (userId: string) => {
        try {
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setProfile(profileData);

            const { data: ordersData } = await supabase
                .from('business_orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            setOrders(ordersData || []);

            const { data: paymentsData } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            setPayments(paymentsData || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (order: any) => {
        setViewOrder(order);
        const { data } = await supabase
            .from('task_submissions')
            .select('*, tasks!inner(*)')
            .eq('tasks.business_order_id', order.id)
            .in('status', ['approved', 'paid', 'pending']);
        setOrderSubmissions(data || []);
    };

    const createOrder = async () => {
        if (!session?.user || !profile) return;
        if (!targetLink || targetLink.length < 5) return toast.error('Укажите ссылку на карточку');
        if (totalPrice > (profile?.balance || 0)) return toast.error('Недостаточно средств на балансе');

        setIsSubmitting(true);
        try {
            // 1. Create business order
            const { data: order, error: orderError } = await supabase
                .from('business_orders')
                .insert({
                    user_id: session.user.id,
                    platform: selectedPlatform.name,
                    target_link: targetLink,
                    review_count: reviewCount,
                    instructions: instructions || null,
                    price_per_review: pricePerReview,
                    total_price: totalPrice,
                    status: 'active'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Оплата заказа (защита от race condition)
            const { data: freshProfile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
            if (!freshProfile || freshProfile.balance < totalPrice) {
                toast.error('Недостаточно средств на балансе!');
                await supabase.from('business_orders').delete().eq('id', order.id); // Откатываем заказ
                setIsSubmitting(false);
                return;
            }

            const { error: balanceError } = await supabase
                .from('profiles')
                .update({ balance: freshProfile.balance - totalPrice })
                .eq('id', session.user.id);

            if (balanceError) throw balanceError;

            // 3. Auto-generate tasks for workers
            const taskData = {
                title: `${selectedPlatform.name}: Написать отзыв`,
                description: `Написать отзыв на ${selectedPlatform.name}.\n\nСсылка: ${targetLink}\n\n${instructions ? `Пожелания заказчика: ${instructions}` : 'Напишите естественный, живой отзыв от 3–5 предложений.'}`,
                price: selectedPlatform.workerPrice, // Цена исполнителю
                total_count: reviewCount,
                remaining_count: reviewCount,
                category: 'Отзывы',
                link: targetLink,
                execution_time_hours: 72,
                is_one_time: true,
                business_order_id: order.id
            };

            const { error: taskError } = await supabase
                .from('tasks')
                .insert(taskData);

            if (taskError) throw taskError;

            // 4. Update local state
            setProfile({ ...profile, balance: profile.balance - totalPrice });
            toast.success(`Заказ создан! ${reviewCount} заданий отправлены исполнителям.`);
            setShowNewOrder(false);
            setTargetLink('');
            setInstructions('');
            setReviewCount(10);
            fetchData(session.user.id);

        } catch (error: any) {
            toast.error('Ошибка: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelOrder = async (order: any) => {
        if (!confirm('Отменить заказ? Остаток средств вернётся на баланс.')) return;
        if (!session?.user) return;

        const completedCount = order.completed_count || 0;
        const remaining = order.review_count - completedCount;
        const refund = remaining * order.price_per_review;

        // Cancel unfinished tasks
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id')
            .eq('business_order_id', order.id);

        if (tasks) {
            for (const task of tasks) {
                await supabase.from('tasks').update({ remaining_count: 0 }).eq('id', task.id);
            }
        }

        await supabase.from('business_orders').update({ status: 'cancelled' }).eq('id', order.id);

        // Refund
        const { data: freshProfile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
        if (freshProfile) {
            await supabase.from('profiles').update({ balance: freshProfile.balance + refund }).eq('id', session.user.id);
        }

        toast.success(`Возвращено ${refund}₽ на баланс.`);
        fetchData(session.user.id);
    };

    const createPayment = async () => {
        if (!session?.user || paymentAmount < 1) return;
        setIsPaymentLoading(true);
        try {
            const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    amount: paymentAmount,
                    user_id: session.user.id,
                    success_url: window.location.href,
                    fail_url: window.location.href,
                }),
            });
            const data = await response.json();
            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                toast.error(data.error || 'Ошибка создания платежа');
            }
        } catch (error: any) {
            toast.error('Ошибка: ' + error.message);
        } finally {
            setIsPaymentLoading(false);
        }
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
                <div className="w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5 text-center">
                    <Briefcase size={48} className="text-[#0071e3] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold dark:text-white mb-2">Кабинет заказчика</h2>
                    <p className="text-slate-500 mb-6 text-sm">Войдите в аккаунт, чтобы управлять заказами</p>
                    <Link to="/cabinet" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071e3] text-white rounded-full font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30">
                        Войти <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto space-y-6">

            <Link to="/business" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0071e3] transition-colors font-medium text-sm">
                <ChevronLeft size={16} /> К тарифам
            </Link>

            {/* Top Dashboard Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
                {/* Balance Card */}
                <div
                    className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 cursor-pointer hover:border-blue-500/50 transition-colors group relative overflow-hidden"
                    onClick={() => setShowPayment(true)}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[4rem] -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Wallet size={20} />
                        </div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Баланс</h2>
                    </div>
                    <div className="text-3xl font-black text-[#1d1d1f] dark:text-white">
                        {profile?.balance?.toLocaleString('ru-RU') || 0} ₽
                    </div>
                    <div className="mt-4 flex items-center text-xs font-bold text-[#0071e3]">
                        <PlusCircle size={14} className="mr-1" /> Пополнить
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Clock size={20} />
                        </div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">В работе</h2>
                    </div>
                    <div className="text-3xl font-black text-[#1d1d1f] dark:text-white">
                        {orders.filter(o => o.status === 'active').length}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
                            <CheckCircle size={20} />
                        </div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Завершено</h2>
                    </div>
                    <div className="text-3xl font-black text-[#1d1d1f] dark:text-white">
                        {orders.filter(o => o.status === 'completed').length}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden hidden sm:block">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Эффективность</h2>
                    </div>
                    <div className="text-3xl font-black text-blue-500">+1.2★</div>
                </div>
            </div>

            {/* Widget Builder Section */}
            {!showNewOrder && !viewOrder && (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <WidgetBuilder userId={session.user.id} />
                </div>
            )}

            {/* Main Content Area */}

            {/* HEADER */}
            <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm border border-slate-100 dark:border-white/5 relative z-20 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-[#0071e3] to-[#2997ff] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold dark:text-white">Кабинет заказчика</h1>
                        <p className="text-xs text-slate-500">{profile?.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowNewOrder(true)}
                        className="px-5 py-3 bg-[#0071e3] hover:bg-blue-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                    >
                        <PlusCircle size={18} /> Новый заказ
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium uppercase tracking-wide"><Wallet size={14} /> Баланс</div>
                    <div className="text-3xl font-bold dark:text-white">{profile?.balance || 0} ₽</div>
                    <button onClick={() => setShowPayment(true)} className="text-[10px] text-[#0071e3] font-bold mt-1 inline-block hover:underline">Пополнить →</button>
                </div>
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium uppercase tracking-wide"><Package size={14} /> Активные заказы</div>
                    <div className="text-3xl font-bold text-[#0071e3]">{orders.filter(o => o.status === 'active').length}</div>
                </div>
                <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-medium uppercase tracking-wide"><BarChart3 size={14} /> Всего потрачено</div>
                    <div className="text-3xl font-bold text-green-500">{orders.reduce((acc, o) => acc + o.total_price, 0).toLocaleString('ru-RU')} ₽</div>
                </div>
            </div>

            {/* ORDERS LIST */}
            <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                <h2 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2"><Package size={18} className="text-[#0071e3]" /> Мои заказы</h2>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                        <Package size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium mb-4">У вас пока нет заказов</p>
                        <button onClick={() => setShowNewOrder(true)} className="px-6 py-3 bg-[#0071e3] text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">
                            Создать первый заказ
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => {
                            const progress = order.review_count > 0 ? (order.completed_count / order.review_count) * 100 : 0;
                            const platform = PLATFORMS.find(p => p.name === order.platform) || PLATFORMS[0];
                            const PlatformIcon = platform.icon;

                            return (
                                <div key={order.id} className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#252527] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white shadow-md`}>
                                                <PlatformIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm dark:text-white">{order.platform}</h3>
                                                <a href={order.target_link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline truncate max-w-[200px] block">
                                                    {order.target_link}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${order.status === 'active' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' :
                                                order.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' :
                                                    'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                                                }`}>
                                                {order.status === 'active' ? 'В работе' : order.status === 'completed' ? 'Завершён' : 'Отменён'}
                                            </span>
                                            <span className="text-sm font-bold text-[#1d1d1f] dark:text-white">{order.total_price.toLocaleString('ru-RU')} ₽</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                            <span>Выполнено</span>
                                            <span className="text-[#0071e3]">{order.completed_count} / {order.review_count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-black/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${order.status === 'completed' ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-[#2997ff]'}`}
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => fetchOrderDetails(order)} className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-white/10 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition flex items-center justify-center gap-1">
                                            <Eye size={14} /> Детали
                                        </button>
                                        {order.status === 'active' && order.completed_count < order.review_count && (
                                            <button onClick={() => cancelOrder(order)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition flex items-center justify-center gap-1">
                                                <X size={14} /> Отменить
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* NEW ORDER MODAL */}
            {showNewOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10">
                        <button onClick={() => setShowNewOrder(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20">
                            <X size={20} className="dark:text-white" />
                        </button>

                        <h2 className="text-2xl font-bold dark:text-white mb-6">Новый заказ</h2>

                        {/* Step 1: Platform */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">1. Выберите площадку</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {PLATFORMS.map(platform => {
                                    const Icon = platform.icon;
                                    return (
                                        <button
                                            key={platform.name}
                                            onClick={() => setSelectedPlatform(platform)}
                                            className={`p-4 rounded-2xl border-2 text-center transition-all ${selectedPlatform.name === platform.name
                                                ? 'border-[#0071e3] bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                                : 'border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white mx-auto mb-2 shadow-sm`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="text-xs font-bold dark:text-white">{platform.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{platform.pricePerReview}₽/шт</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Link + Instructions */}
                        <div className="mb-6 space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">2. Данные заказа</label>
                            <input
                                type="text"
                                placeholder="Ссылка на карточку / профиль"
                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none text-sm dark:text-white focus:border-[#0071e3] transition-colors"
                                value={targetLink}
                                onChange={e => setTargetLink(e.target.value)}
                            />
                            <textarea
                                placeholder="Пожелания к отзывам (необязательно)&#10;Например: хвалите мастера Ивана, скорость работы и чистоту"
                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none text-sm dark:text-white min-h-[100px] focus:border-[#0071e3] transition-colors"
                                value={instructions}
                                onChange={e => setInstructions(e.target.value)}
                            />
                        </div>

                        {/* Step 3: Slider */}
                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">3. Количество отзывов</label>

                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-bold text-slate-500">Количество</span>
                                <span className="text-3xl font-black text-[#0071e3]">{reviewCount} шт.</span>
                            </div>

                            <div className="relative pt-2 pb-6">
                                <input
                                    type="range"
                                    min="5"
                                    max="100"
                                    step="5"
                                    value={reviewCount}
                                    onChange={(e) => setReviewCount(Number(e.target.value))}
                                    className="w-full h-3 rounded-full appearance-none outline-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #0071e3 ${(reviewCount - 5) / 95 * 100}%, rgba(148, 163, 184, 0.2) ${(reviewCount - 5) / 95 * 100}%)`
                                    }}
                                />
                                <div className="absolute left-0 -bottom-0 text-xs text-slate-400 font-bold">5</div>
                                <div className="absolute right-0 -bottom-0 text-xs text-slate-400 font-bold">100</div>
                            </div>

                            <div className="flex gap-2 mb-4">
                                {discount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold">
                                        <TrendingUp size={14} /> Скидка {discount * 100}%
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold">
                                    {pricePerReview}₽ за 1 отзыв
                                </span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-slate-50 dark:bg-black/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-slate-500 font-medium">Итого:</span>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-[#1d1d1f] dark:text-white">{totalPrice.toLocaleString('ru-RU')} ₽</div>
                                    {discount > 0 && <div className="text-sm text-slate-400 line-through">{oldPrice.toLocaleString('ru-RU')} ₽</div>}
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400">
                                Ваш баланс: <span className={`font-bold ${(profile?.balance || 0) >= totalPrice ? 'text-green-500' : 'text-red-500'}`}>{profile?.balance || 0} ₽</span>
                                {(profile?.balance || 0) < totalPrice && <span className="text-red-500 ml-2">— недостаточно средств</span>}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={createOrder}
                            disabled={isSubmitting || (profile?.balance || 0) < totalPrice || targetLink.length < 5}
                            className="w-full py-4 bg-[#0071e3] hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Запустить заказ</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {viewOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10">
                        <button onClick={() => setViewOrder(null)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20">
                            <X size={20} className="dark:text-white" />
                        </button>

                        <h2 className="text-2xl font-bold dark:text-white mb-2">Заказ #{viewOrder.id}</h2>
                        <p className="text-sm text-slate-500 mb-6">{viewOrder.platform} • {new Date(viewOrder.created_at).toLocaleDateString('ru-RU')}</p>

                        {/* Progress */}
                        <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-white/5 mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-500">Прогресс</span>
                                <span className="text-lg font-bold text-[#0071e3]">{viewOrder.completed_count} / {viewOrder.review_count}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-200 dark:bg-black/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-[#2997ff] rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(100, (viewOrder.completed_count / viewOrder.review_count) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Link */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ссылка</label>
                            <a href={viewOrder.target_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                                <ExternalLink size={16} /> {viewOrder.target_link}
                            </a>
                        </div>

                        {viewOrder.instructions && (
                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Пожелания</label>
                                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-sm dark:text-slate-300 whitespace-pre-wrap">{viewOrder.instructions}</div>
                            </div>
                        )}

                        {/* Submissions */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Выполненные отзывы ({orderSubmissions.length})</label>
                            {orderSubmissions.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 dark:bg-white/5 rounded-xl">
                                    <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                                    Ожидание выполнения исполнителями...
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {orderSubmissions.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                            <div>
                                                <div className="text-xs font-bold dark:text-white">{sub.review_username || 'Исполнитель'}</div>
                                                <div className="text-[10px] text-slate-400">{new Date(sub.created_at).toLocaleDateString('ru-RU')}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {sub.review_link && (
                                                    <a href={sub.review_link} target="_blank" rel="noreferrer" className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${sub.status === 'approved' || sub.status === 'paid' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                                    }`}>
                                                    {sub.status === 'approved' || sub.status === 'paid' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PAYMENT MODAL */}
            {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-200 dark:border-white/10">
                        <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20">
                            <X size={20} className="dark:text-white" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-[#2997ff] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                                <CreditCard size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white">Пополнить баланс</h2>
                            <p className="text-sm text-slate-500 mt-1">Банковская карта • СБП • Электронные кошельки</p>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {[1000, 3000, 5000, 10000].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => setPaymentAmount(amount)}
                                    className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${paymentAmount === amount
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-md'
                                        : 'border-slate-200 dark:border-white/10 dark:text-white hover:border-slate-400'
                                        }`}
                                >
                                    {amount.toLocaleString('ru-RU')}₽
                                </button>
                            ))}
                        </div>

                        {/* Custom amount */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Или своя сумма</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="100000"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(Math.max(1, Number(e.target.value)))}
                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-lg font-bold dark:text-white outline-none focus:border-blue-500 transition-colors pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₽</span>
                            </div>
                            {paymentAmount < 1 && <p className="text-red-500 text-xs mt-1">Минимум: 1₽</p>}
                        </div>

                        <button
                            onClick={createPayment}
                            disabled={isPaymentLoading || paymentAmount < 1}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-[#2997ff] hover:from-blue-700 hover:to-[#2997ff]/90 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base"
                        >
                            {isPaymentLoading ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={18} /> Оплатить {paymentAmount.toLocaleString('ru-RU')} ₽</>}
                        </button>

                        <p className="text-[10px] text-slate-400 text-center mt-3">Безопасная оплата • Баланс зачисляется автоматически</p>

                        {/* Recent payments */}
                        {payments.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">История платежей</h3>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                    {payments.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${p.status === 'succeeded' ? 'bg-green-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}></span>
                                                <span className="font-bold dark:text-white">{p.amount}₽</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
