import React, { useEffect, useRef, useState } from 'react';
import { Users, Banknote, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Компонент для анимированного числа — uses useRef instead of useState for per-frame updates (SKILL.md Section 5.D)
const AnimatedCounter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const displayRef = useRef<HTMLSpanElement>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current && displayRef.current) {
      hasAnimated.current = true;
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOut * value);
        if (displayRef.current) {
          displayRef.current.textContent = current.toLocaleString('ru-RU');
        }
        if (progress < 1) {
          requestAnimationFrame(step);
        } else if (displayRef.current) {
          displayRef.current.textContent = value.toLocaleString('ru-RU');
        }
      };
      requestAnimationFrame(step);
    }
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      <span ref={displayRef}>0</span>
    </span>
  );
};

export default function Stats() {
  const [stats, setStats] = useState({
    online: 0,
    paid: 0,
    reviews: 0,
    daily: 0
  });

  useEffect(() => {
    fetchStats();

    // Подписка на изменения в реальном времени (чтобы менялось без перезагрузки)
    const channel = supabase
      .channel('public:app_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Получаем настройки
      const { data: setting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'stats_config')
        .single();

      if (setting && setting.value) {
        let config;
        try {
          config = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        } catch (e) {
          console.error("JSON Parse Error", e);
          return;
        }

        if (config.mode === 'fake') {
          // --- РЕЖИМ ФЕЙК ---
          setStats({
            online: Number(config.online),
            paid: Number(config.paid),
            reviews: Number(config.reviews),
            daily: Number(config.daily)
          });
        } else {
          // --- РЕЖИМ РЕАЛ ---
          // Вызываем нашу SQL функцию get_real_stats
          const { data, error } = await supabase.rpc('get_real_stats');

          if (!error && data && (data.online > 0 || data.paid > 0)) {
            setStats({
              online: data.online,
              paid: data.paid,
              reviews: data.reviews,
              daily: data.daily
            });
          } else {
            // Фолбэк: если RPC функции нет в базе или она вернула 0, показываем дефолтные красивые цифры из конфига
            setStats({
              online: Number(config.online) || 342,
              paid: Number(config.paid) || 89450,
              reviews: Number(config.reviews) || 1428,
              daily: Number(config.daily) || 1450
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statItems = [
    {
      label: 'Активных Воркеров',
      value: stats.online,
      icon: Users,
      suffix: ''
    },
    {
      label: 'Выплачено за месяц',
      value: stats.paid,
      icon: Banknote,
      suffix: ' ₽'
    },
    {
      label: 'Успешных отзывов',
      value: stats.reviews,
      icon: Award,
      suffix: ''
    },
    {
      label: 'Средний доход в день',
      value: stats.daily,
      icon: TrendingUp,
      suffix: ' ₽'
    }
  ];

  return (
    <section className="py-16 bg-zinc-900 dark:bg-zinc-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/8 group-hover:bg-white/8 transition-colors">
                <item.icon className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1.5 tracking-tight">
                <AnimatedCounter value={item.value} /><span className="text-xl md:text-2xl text-zinc-500">{item.suffix}</span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}