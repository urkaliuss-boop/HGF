import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Ticket, Gift, Sparkles, Plus, CreditCard, Layers, ArrowRight, Loader2 } from 'lucide-react';

interface PromoSystemProps {
  userRole: string;
  onBalanceUpdate: () => void;
}

const PromoSystem: React.FC<PromoSystemProps> = ({ userRole, onBalanceUpdate }) => {
  // User States
  const [promoInput, setPromoInput] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin States
  const [newCode, setNewCode] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newLimit, setNewLimit] = useState('');

  // Активация
  const handleActivate = async () => {
    if (!promoInput) return;
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('redeem_promo', { code_input: promoInput });
      if (error) throw error;
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setPromoInput('');
        onBalanceUpdate();
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'Ошибка', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Создание (Админ)
  const handleCreate = async () => {
    if (!newCode || !newAmount || !newLimit) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('promo_codes').insert([{
        code: newCode,
        amount: parseInt(newAmount),
        activations_left: parseInt(newLimit),
      }]);
      if (error) throw error;
      alert('Промокод создан!');
      setNewCode(''); setNewAmount(''); setNewLimit('');
    } catch (error: any) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      
      {/* КАРТОЧКА АКТИВАЦИИ (Для всех) */}
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#0071e3]"></div>
        
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-[#0071e3]">
                <Ticket size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Промокод</h3>
                <p className="text-xs text-slate-500">Активируйте бонусный код</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Введите код (например BONUS2024)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#F5F5F7] dark:bg-black/30 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#0071e3] transition-all outline-none font-medium"
                />
            </div>
            <button
                onClick={handleActivate}
                disabled={loading || !promoInput}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><Sparkles size={18} /> Активировать</>}
            </button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
            {message.type === 'success' ? <Sparkles size={16}/> : <Loader2 size={16} className="rotate-45"/>}
            {message.text}
          </div>
        )}
      </div>

      {/* КАРТОЧКА СОЗДАНИЯ (Только Админ) */}
      {userRole === 'admin' && (
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-500">
                    <Plus size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Создать код</h3>
                    <p className="text-xs text-slate-500">Панель администратора</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Ticket size={16}/></div>
                    <input type="text" placeholder="Название (SALE50)" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="w-full pl-10 p-3 bg-[#F5F5F7] dark:bg-black/30 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"/>
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Layers size={16}/></div>
                    <input type="number" placeholder="Лимит (шт)" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} className="w-full pl-10 p-3 bg-[#F5F5F7] dark:bg-black/30 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"/>
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><CreditCard size={16}/></div>
                    <input type="number" placeholder="Сумма (₽)" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full pl-10 p-3 bg-[#F5F5F7] dark:bg-black/30 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"/>
                </div>
            </div>

            <button onClick={handleCreate} disabled={loading} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                {loading ? 'Создание...' : <>Создать промокод <ArrowRight size={16}/></>}
            </button>
        </div>
      )}
    </div>
  );
};

export default PromoSystem;