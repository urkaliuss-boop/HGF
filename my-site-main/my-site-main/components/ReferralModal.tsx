import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, TrendingUp, Share2, Briefcase, UserPlus } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ReferralModal({ isOpen, onClose, userId }: ReferralModalProps) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ count: 0, earnings: 0 });

  const refLink = `${window.location.origin}/?ref=${userId}`;

  useEffect(() => {
    if (isOpen) fetchStats();
  }, [isOpen]);

  const fetchStats = async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('invited_by', userId);
    // Fetch the new total_earned_from_refs field
    const { data } = await supabase.from('profiles').select('total_earned_from_refs').eq('id', userId).single();
    setStats({ count: count || 0, earnings: data?.total_earned_from_refs || 0 });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVk = () => {
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(refLink)}&title=${encodeURIComponent('Зарабатывай на простых заданиях или заказывай отзывы со скидкой!')}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('Крутой сервис для заработка и продвижения бизнеса. Заходи!')}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-100 dark:border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Партнерская программа
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Приглашайте друзей и получайте пассивный доход
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X size={20} className="text-slate-900 dark:text-white" />
          </button>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-500/20">
            <Briefcase size={20} className="text-blue-500 mb-2" />
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 mb-1">10%</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
              От пополнений бизнес-клиентов
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/20">
            <UserPlus size={20} className="text-emerald-500 mb-2" />
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-1">5%</div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
              От заработка исполнителей
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <Users size={12} /> Приглашено
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.count}</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <TrendingUp size={12} /> Заработано
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-500">+{stats.earnings} ₽</div>
          </div>
        </div>

        {/* Link & Share */}
        <div>
          <div className="mb-2 text-xs font-bold text-slate-500 uppercase ml-1 flex items-center justify-between">
            <span>Ваша ссылка</span>
          </div>

          <div className="flex gap-2 w-full mb-4">
            <div className="flex-1 bg-slate-100 dark:bg-white/5 p-3 rounded-xl text-[#0071e3] font-mono text-xs sm:text-sm truncate border border-slate-200 dark:border-white/10 flex items-center select-all">
              {refLink}
            </div>
            <button
              onClick={copyToClipboard}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${copied ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-lg shadow-blue-500/20'}`}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareVk}
              className="flex-1 py-3 px-4 bg-[#0077FF]/10 hover:bg-[#0077FF]/20 text-[#0077FF] dark:text-[#4facfe] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> ВКонтакте
            </button>
            <button
              onClick={shareTelegram}
              className="flex-1 py-3 px-4 bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 text-[#2AABEE] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Telegram
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}