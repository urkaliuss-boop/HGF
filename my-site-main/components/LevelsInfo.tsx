import React from 'react';
import { Sprout, Star, Crown, Zap, ShieldCheck } from 'lucide-react';

export default function LevelsInfo() {
  const levels = [
    {
      name: 'Новичок',
      icon: Sprout,
      color: 'text-slate-500',
      bg: 'bg-slate-100 dark:bg-white/10',
      req: '0 заданий',
      bonus: '+0%',
      desc: 'Базовая ставка за выполнение заданий.',
    },
    {
      name: 'Продвинутый',
      icon: Star,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      req: '5 заданий',
      bonus: '+5%',
      desc: 'Небольшая прибавка к каждому выполненному заданию.',
    },
    {
      name: 'Опытный',
      icon: Crown,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      req: '10 заданий',
      bonus: '+10%',
      desc: 'Серьезный бонус. Вы получаете больше за те же действия.',
    },
    {
      name: 'Легенда',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      req: '20+ заданий',
      bonus: '+15%',
      desc: 'Максимальный статус. Самый высокий доход на бирже.',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#050505] border-t border-slate-100 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">
          Карьера и Бонусы
        </h2>
        <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
          Выполняйте задания, повышайте уровень и получайте до <span className="text-[#0071e3] font-bold">+15%</span> к оплате за каждое задание.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((lvl) => (
            <div key={lvl.name} className="p-6 rounded-3xl bg-slate-50 dark:bg-[#1c1c1e] border border-slate-100 dark:border-white/5 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${lvl.bg} ${lvl.color} flex items-center justify-center`}>
                    <lvl.icon size={24} />
                  </div>
                  <span className="px-3 py-1 bg-white dark:bg-black/20 rounded-full text-xs font-bold border border-slate-100 dark:border-white/10 dark:text-white">
                    {lvl.bonus}
                  </span>
              </div>
              
              <h3 className="text-xl font-bold dark:text-white mb-1">
                {lvl.name}
              </h3>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Требуется: {lvl.req}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {lvl.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
