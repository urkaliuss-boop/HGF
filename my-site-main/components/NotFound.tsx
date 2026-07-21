import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] flex flex-col items-center justify-center p-4 text-center">
      <div className="animate-fade-in-up">
        {/* Иконка с анимацией */}
        <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Страница не найдена</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Похоже, вы перешли по неправильной ссылке или страница была удалена.
        </p>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30"
        >
          <Home size={20} /> Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
