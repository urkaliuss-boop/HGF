import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Medal } from 'lucide-react';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCountUp } from '../hooks/useCountUp';

type Leader = {
  id: string;
  email: string;
  count: number;
};

/** Small component to use useCountUp hook per leaderboard entry */
function CountUpValue({ end }: { end: number }) {
  const { ref, value } = useCountUp({ end, duration: 1000, easing: 'easeOut' });
  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{value}</span>;
}

/** Wrapper component to apply stagger scroll animation per entry */
function StaggerCard({ children, index }: { children: React.ReactNode; index: number }) {
  const anim = useScrollAnimation({ delay: index * 75 });
  return (
    <div ref={anim.ref as React.RefObject<HTMLDivElement>} style={anim.style}>
      {children}
    </div>
  );
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      // 1️⃣ Получаем дату старта недели
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('leaderboard_week_start')
        .eq('id', 1)
        .single();

      if (settingsError) throw settingsError;

      const startDate = settings?.leaderboard_week_start;
      setWeekStart(startDate);

      // 2️⃣ Получаем профили (без админов)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('role', 'admin');

      if (profilesError) throw profilesError;

      // 3️⃣ Получаем задания с момента старта недели
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('user_id')
        .eq('status', 'approved')
        .gte('created_at', startDate);

      if (submissionsError) throw submissionsError;

      // 4️⃣ Считаем статистику
      const stats: Record<string, number> = {};
      submissions?.forEach(sub => {
        stats[sub.user_id] = (stats[sub.user_id] || 0) + 1;
      });

      // 5️⃣ Формируем топ
      const sortedLeaders: Leader[] = profiles!
        .map(user => ({
          id: user.id,
          email: user.email,
          count: stats[user.id] || 0
        }))
        .filter(user => user.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setLeaders(sortedLeaders);
    } catch (err) {
      console.error('Ошибка загрузки рейтинга:', err);
    } finally {
      setLoading(false);
    }
  };

  // Склонение
  const getTaskWord = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'заданий';
    if (lastDigit === 1) return 'задание';
    if (lastDigit >= 2 && lastDigit <= 4) return 'задания';
    return 'заданий';
  };

  const maskEmail = (email: string) => {
    if (!email) return 'User';
    const [name] = email.split('@');
    return `${name.slice(0, 3)}***`;
  };

  const getMedalBadge = (index: number) => {
    if (index === 0)
      return <IconBadge icon={Trophy} color="yellow-500" size="md" />;
    if (index === 1)
      return <IconBadge icon={Medal} color="slate-400" size="md" />;
    if (index === 2)
      return <IconBadge icon={Medal} color="orange-500" size="md" />;
    return null;
  };

  const getRankIcon = (index: number) => {
    if (index === 0)
      return <Trophy className="text-yellow-500 fill-yellow-500/20" size={24} />;
    if (index === 1)
      return <Medal className="text-slate-400 fill-slate-400/20" size={24} />;
    if (index === 2)
      return <Medal className="text-orange-500 fill-orange-500/20" size={24} />;

    return (
      <span className="text-text-muted font-bold w-6 text-center">
        {index + 1}
      </span>
    );
  };

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const sectionAnim = useScrollAnimation({ threshold: 0.2 });

  return (
    <Section
      variant="dark"
      decorElements={[
        { type: 'geometric', position: { top: '10%', left: '5%' }, opacity: 0.06, size: '120px' },
        { type: 'dots', position: { bottom: '15%', right: '5%' }, opacity: 0.05, size: '100px' },
        { type: 'geometric', position: { top: '60%', right: '10%' }, opacity: 0.04, size: '80px' },
      ]}
    >
      <div ref={sectionAnim.ref as React.RefObject<HTMLDivElement>} style={sectionAnim.style} className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Топ исполнителей
          </h2>

          <p className="text-text-secondary">
            Лидеры текущей недели
          </p>

          {weekStart && (
            <div className="text-xs text-text-muted mt-2">
              Неделя началась: {new Date(weekStart).toLocaleString()}
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted animate-pulse">
            Загрузка рейтинга...
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            Пока никто не выполнил заданий
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3: Glass cards with IconBadge medals */}
            {top3.length > 0 && (
              <div className="space-y-3">
                {top3.map((user, index) => (
                  <StaggerCard key={user.id} index={index}>
                    <Card variant="glass" className="p-5 md:p-8 dark:shadow-[0_0_20px_rgba(0,113,227,0.08)]" hoverable={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {getMedalBadge(index)}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-base">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>

                            <div>
                              <div className="font-bold text-white text-base sm:text-lg">
                                {maskEmail(user.email)}
                              </div>

                              {index === 0 && (
                                <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide">
                                  Лидер недели
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-accent-primary text-xl">
                            <CountUpValue end={user.count} />
                          </div>
                          <div className="text-[10px] text-text-muted uppercase font-bold">
                            {getTaskWord(user.count)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </StaggerCard>
                ))}
              </div>
            )}

            {/* Rest: Flat cards */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((user, index) => (
                  <StaggerCard key={user.id} index={index + 3}>
                    <Card variant="flat" className="p-4 sm:p-5 bg-white/5 dark:shadow-[0_0_15px_rgba(0,113,227,0.05)]" hoverable={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 flex justify-center">
                            {getRankIcon(index + 3)}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 font-bold text-sm">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>

                            <div>
                              <div className="font-bold text-white/90 text-sm sm:text-base">
                                {maskEmail(user.email)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-accent-primary text-lg">
                            <CountUpValue end={user.count} />
                          </div>
                          <div className="text-[10px] text-text-muted uppercase font-bold">
                            {getTaskWord(user.count)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </StaggerCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
