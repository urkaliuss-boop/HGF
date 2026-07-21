import React, { useEffect, useState } from 'react';
import { Users, Banknote, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useCountUp } from '../hooks/useCountUp';
import { useScrollAnimation, calculateStaggerDelay } from '../hooks/useScrollAnimation';

// Count-up stat display component using the useCountUp hook
const StatCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const { ref, value: animatedValue } = useCountUp({
    end: value,
    duration: 1200,
    easing: 'easeOut',
    startOnView: true,
    threshold: 0.5,
  });

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {animatedValue.toLocaleString('ru-RU')}{suffix}
    </span>
  );
};

export default function Stats() {
  const [stats, setStats] = useState({
    online: 0,
    paid: 0,
    reviews: 0,
    daily: 0,
  });

  useEffect(() => {
    fetchStats();

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
          console.error('JSON Parse Error', e);
          return;
        }

        if (config.mode === 'fake') {
          setStats({
            online: Number(config.online),
            paid: Number(config.paid),
            reviews: Number(config.reviews),
            daily: Number(config.daily),
          });
        } else {
          const { data, error } = await supabase.rpc('get_real_stats');
          if (!error && data) {
            setStats({
              online: data.online,
              paid: data.paid,
              reviews: data.reviews,
              daily: data.daily,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statItems = [
    { label: 'Активных Воркеров', value: stats.online, icon: Users, suffix: '', color: 'blue-500' },
    { label: 'Выплачено за месяц', value: stats.paid, icon: Banknote, suffix: ' ₽', color: 'green-500' },
    { label: 'Успешных отзывов', value: stats.reviews, icon: Award, suffix: '', color: 'amber-500' },
    { label: 'Средний доход в день', value: stats.daily, icon: TrendingUp, suffix: ' ₽', color: 'purple-500' },
  ];

  const headerAnim = useScrollAnimation({ threshold: 0.2, duration: 500 });

  const cardAnimations = [
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(0, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(1, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(2, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(3, 75) }),
  ];

  return (
    <Section variant="dark">
      <div className="text-center mb-12" ref={headerAnim.ref as React.RefObject<HTMLDivElement>} style={headerAnim.style}>
        <h2 className="text-[28px] lg:text-[45px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
          Наши результаты
        </h2>
      </div>

      {/* Bento-style grid: 2 large + 2 small for visual hierarchy */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item, index) => (
          <div
            key={index}
            ref={cardAnimations[index].ref as React.RefObject<HTMLDivElement>}
            style={cardAnimations[index].style}
            className={index < 2 ? 'col-span-1 md:col-span-2' : 'col-span-1'}
          >
            <Card variant="flat" hoverable className="bg-white/5 border border-white/10 text-center h-full">
              <div className="flex flex-col items-center">
                <IconBadge icon={item.icon} color={item.color} size="md" className="mb-4" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                  <StatCounter value={item.value} suffix={item.suffix} />
                </div>
                <div className="text-[12px] lg:text-[14px] font-bold uppercase tracking-widest text-slate-400 leading-[1.6]">
                  {item.label}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
}
