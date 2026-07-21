import React from 'react';
import { Sprout, Star, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LevelsInfo() {
  const levels = [
    {
      name: 'Новичок',
      icon: Sprout,
      req: '0 заданий',
      bonus: '+0%',
      desc: 'Базовая ставка за выполнение заданий.',
      active: true,
    },
    {
      name: 'Продвинутый',
      icon: Star,
      req: '5 заданий',
      bonus: '+5%',
      desc: 'Небольшая прибавка к каждому заданию.',
      active: false,
    },
    {
      name: 'Опытный',
      icon: Crown,
      req: '10 заданий',
      bonus: '+10%',
      desc: 'Серьезный бонус за тот же объём работы.',
      active: false,
    },
    {
      name: 'Легенда',
      icon: Zap,
      req: '20+ заданий',
      bonus: '+15%',
      desc: 'Максимальный статус на бирже.',
      active: false,
    },
  ];

  return (
    <section className="py-20 border-t border-zinc-100 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
            Карьера и Бонусы
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg">
            Выполняйте задания, повышайте уровень и получайте до <span className="text-emerald-500 font-semibold">+15%</span> к оплате.
          </p>
        </motion.div>

        {/* Timeline layout — different from 4-equal-cards, 3-col steps, and 2-col list */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-[23px] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <div className="space-y-3">
            {levels.map((lvl, idx) => {
              const Icon = lvl.icon;
              return (
                <motion.div
                  key={lvl.name}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-5 group"
                >
                  {/* Timeline dot */}
                  <div className="relative shrink-0 hidden md:block">
                    <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center z-10 relative transition-colors ${
                      idx === 0
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/15'
                    }`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-center justify-between p-4 md:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[72px]">
                    <div className="flex items-center gap-3 md:hidden">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{lvl.name}</h3>
                        <p className="text-xs text-zinc-500">{lvl.desc}</p>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-3 mb-0.5">
                        <h3 className="font-bold text-zinc-900 dark:text-white">{lvl.name}</h3>
                        <span className="text-xs text-zinc-400 font-medium">{lvl.req}</span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{lvl.desc}</p>
                    </div>
                    <span className="px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 border border-zinc-100 dark:border-zinc-700 shrink-0 ml-4">
                      {lvl.bonus}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
