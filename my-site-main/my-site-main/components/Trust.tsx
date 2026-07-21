import React from 'react';
import { ShieldCheck, Fingerprint, Activity, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Trust: React.FC = () => {
  const items = [
    {
      icon: Lock,
      title: 'Приватно',
      desc: 'Данные используются только для выплаты. Никаких лишних вопросов.',
    },
    {
      icon: Activity,
      title: 'Прозрачно',
      desc: 'Честно говорим статус модерации. Если отзыв висит — деньги ваши.',
    },
    {
      icon: Fingerprint,
      title: 'Умные алгоритмы',
      desc: 'Выдаем мануалы, как обходить анти-фрод системы карт.',
    },
    {
      icon: ShieldCheck,
      title: 'Поддержка',
      desc: 'Менеджер на связи. Решаем любые вопросы оперативно.',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-14"
        >
          Почему выбирают нас
        </motion.h2>

        {/* 2-column asymmetric layout — different from HowItWorks (3-col) and LevelsInfo (timeline) */}
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 group"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-emerald-500 shadow-sm border border-zinc-100 dark:border-zinc-700 group-hover:scale-105 transition-transform">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Trust;