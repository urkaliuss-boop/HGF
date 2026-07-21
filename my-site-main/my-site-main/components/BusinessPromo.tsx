import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessPromo = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900 dark:bg-zinc-800/80 border border-zinc-800 dark:border-zinc-700 rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >

            <div className="grid md:grid-cols-5 gap-10 items-center">
                {/* Text — 3 cols */}
                <div className="md:col-span-3 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-[1.1]">
                        Управление репутацией{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">без списаний.</span>
                    </h2>
                    
                    <p className="text-base text-zinc-400 leading-relaxed max-w-lg">
                        Помогаем бизнесу поднять рейтинг на картах и маркетплейсах. Используем реальных людей с историей, алгоритмы анти-фрода и ручную модерацию.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400 mt-0.5 shrink-0">
                                <Users size={18} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold">Только живые люди</h4>
                                <p className="text-zinc-500 text-sm">Никаких ботов. Отзывы пишут реальные пользователи.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400 mt-0.5 shrink-0">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold">Гарантия от удалений</h4>
                                <p className="text-zinc-500 text-sm">Если отзыв пропадет — вернем деньги или переделаем.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Link 
                            to="/business"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-zinc-900 rounded-xl font-semibold text-base hover:bg-zinc-100 transition-all active:scale-[0.98]"
                        >
                            Рассчитать стоимость
                            <ArrowRight size={18} />
                        </Link>
                        <p className="mt-3 text-xs text-zinc-600">Работаем с Авито, Яндекс.Карты, 2ГИС, Google Maps, AppStore.</p>
                    </div>
                </div>

                {/* Visual — 2 cols — real stats instead of div-fake-screenshots */}
                <div className="md:col-span-2 hidden md:flex flex-col gap-3">
                    <div className="p-5 bg-zinc-800 dark:bg-zinc-700/50 rounded-2xl border border-zinc-700 dark:border-zinc-600">
                        <div className="text-xs text-zinc-500 font-medium mb-1">Средний рейтинг после</div>
                        <div className="text-4xl font-bold text-white flex items-baseline gap-1">
                            4.8 <span className="text-lg text-emerald-400">+1.3</span>
                        </div>
                        <div className="flex gap-0.5 mt-2">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className={`w-8 h-1.5 rounded-full ${i <= 4 ? 'bg-emerald-400' : 'bg-emerald-400/40'}`}></div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-zinc-800 dark:bg-zinc-700/50 rounded-2xl border border-zinc-700 dark:border-zinc-600">
                            <div className="text-xs text-zinc-500 font-medium mb-1">Удержание</div>
                            <div className="text-2xl font-bold text-white">98%</div>
                        </div>
                        <div className="p-4 bg-zinc-800 dark:bg-zinc-700/50 rounded-2xl border border-zinc-700 dark:border-zinc-600">
                            <div className="text-xs text-zinc-500 font-medium mb-1">Срок</div>
                            <div className="text-2xl font-bold text-white">24ч</div>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <div className="text-xs text-emerald-400 font-medium mb-1">Экономия при объёме</div>
                        <div className="text-xl font-bold text-white">до 25%</div>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessPromo;