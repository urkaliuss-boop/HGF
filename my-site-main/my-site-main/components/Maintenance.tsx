import React from 'react';
import { Settings, RefreshCw, Construction } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] flex flex-col items-center justify-center p-4 text-center z-50 relative">
      <div className="animate-fade-in-up max-w-lg w-full">
        {/* Анимированная иконка */}
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
            <Construction size={48} className="text-amber-500 relative z-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Технические работы</h1>
        <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-6">
          Мы обновляем систему, чтобы стать лучше
        </h2>
        
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            В данный момент доступ к сайту ограничен для проведения планового обслуживания. 
            Пожалуйста, зайдите немного позже. Ваши данные в безопасности.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <RefreshCw size={20} /> Проверить доступ
          </button>
        </div>
        
        <div className="mt-8 text-slate-400 text-sm flex items-center justify-center gap-2">
           <Settings size={14} /> System Update 2.0
        </div>
      </div>
    </div>
  );
}