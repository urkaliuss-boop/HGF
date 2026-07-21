import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, X, Save, Edit, AlertCircle, Coins } from 'lucide-react';
import { toast } from './Toast';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Редактирование
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState(''); // Причина изменения
  const [operationType, setOperationType] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('Ошибка загрузки'); setLoading(false); return; }

    const { data: submissions } = await supabase.from('task_submissions').select('user_id').eq('status', 'approved');
    const stats: any = {};
    submissions?.forEach((sub: any) => { stats[sub.user_id] = (stats[sub.user_id] || 0) + 1; });

    const fullData = profiles.map(user => ({ ...user, completed_tasks: stats[user.id] || 0 }));
    setUsers(fullData);
    setLoading(false);
  };

  const handleUpdateBalance = async (userId: string, currentBalance: number) => {
      if (!editAmount) return toast.error('Укажите сумму');
      if (!editReason) return toast.error('Укажите причину (для уведомления)');
      
      const amount = Number(editAmount);
      const finalChange = operationType === 'add' ? amount : -amount;
      const newBalance = currentBalance + finalChange;

      // 1. Обновляем баланс
      const { error } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);

      if (!error) {
          // 2. Создаем уведомление для юзера
          await supabase.from('notifications').insert({
              user_id: userId,
              title: operationType === 'add' ? 'Пополнение баланса' : 'Списание средств',
              message: `${editReason} (${operationType === 'add' ? '+' : '-'}${amount}₽)`,
              type: operationType === 'add' ? 'success' : 'error'
          });

          toast.success('Баланс обновлен и уведомление отправлено!');
          setEditingId(null); setEditAmount(''); setEditReason('');
          fetchUsers();
      } else {
          toast.error(error.message);
      }
  };

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search));

  if (loading) return <div className="min-h-screen bg-[#F5F5F7] dark:bg-black pt-32 text-center text-slate-500">Загрузка базы...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/cabinet" className="p-3 bg-white dark:bg-white/10 rounded-xl hover:scale-105 transition shadow-sm"><ArrowLeft size={20} className="dark:text-white"/></Link>
                    <h1 className="text-3xl font-bold dark:text-white">База пользователей</h1>
                </div>
                <div className="bg-white dark:bg-[#1c1c1e] px-4 py-2 rounded-xl text-sm font-bold dark:text-white shadow-sm border border-slate-100 dark:border-white/5">
                    Всего: {users.length}
                </div>
            </div>

            <div className="relative mb-6">
                <input type="text" placeholder="Поиск по Email или ID..." className="w-full p-4 pl-12 rounded-2xl bg-white dark:bg-[#1c1c1e] dark:text-white outline-none border border-slate-100 dark:border-white/5 focus:border-blue-500 transition shadow-sm" value={search} onChange={e => setSearch(e.target.value)} />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            </div>

            <div className="grid gap-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white dark:bg-[#1c1c1e] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-300">
                                {user.email[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <div className="font-bold dark:text-white truncate">{user.email}</div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                                    {user.id} 
                                    <span className="bg-slate-100 dark:bg-white/10 px-1.5 rounded text-slate-500">{user.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-center">
                                <div className="text-xs text-slate-400 mb-1">Заданий</div>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold text-xs">
                                    <CheckCircle size={12}/> {user.completed_tasks}
                                </span>
                            </div>

                            {editingId === user.id ? (
                                <div className="flex flex-col gap-2 w-full md:w-64 animate-fade-in-up">
                                    <div className="flex bg-slate-100 dark:bg-black/40 rounded-lg p-1">
                                        <button onClick={() => setOperationType('add')} className={`flex-1 text-xs py-1.5 rounded-md font-bold transition ${operationType === 'add' ? 'bg-white shadow text-green-600' : 'text-slate-500'}`}>Начислить</button>
                                        <button onClick={() => setOperationType('subtract')} className={`flex-1 text-xs py-1.5 rounded-md font-bold transition ${operationType === 'subtract' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Списать</button>
                                    </div>
                                    <input type="number" autoFocus className="input-mini" placeholder="Сумма" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                                    <input type="text" className="input-mini" placeholder="Причина (Видна юзеру)" value={editReason} onChange={e => setEditReason(e.target.value)} />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateBalance(user.id, user.balance)} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-700"><Save size={14} className="mx-auto"/></button>
                                        <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-200 dark:bg-white/10 dark:text-white py-1.5 rounded-lg text-xs font-bold"><X size={14} className="mx-auto"/></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 mb-1">Баланс</div>
                                        <div className="font-bold text-xl dark:text-white">{user.balance} ₽</div>
                                    </div>
                                    <button onClick={() => { setEditingId(user.id); setEditAmount(''); setEditReason(''); }} className="p-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition">
                                        <Edit size={16}/>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && <div className="p-8 text-center text-slate-500">Пользователи не найдены</div>}
            </div>
        </div>
        <style>{` .input-mini { width: 100%; padding: 8px; border-radius: 8px; font-size: 12px; outline: none; background: rgba(0,0,0,0.05); } .dark .input-mini { background: rgba(255,255,255,0.1); color: white; } `}</style>
    </div>
  );
}