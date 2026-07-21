import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

type Leader = {
  id: string;
  email: string;
  count: number;
};

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

  const getRankIcon = (index: number) => {
    if (index === 0)
      return <Trophy className="text-amber-500" size={22} />;
    if (index === 1)
      return <Medal className="text-zinc-400" size={22} />;
    if (index === 2)
      return <Medal className="text-amber-600" size={22} />;

    return (
      <span className="text-zinc-400 font-semibold w-6 text-center text-sm">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Топ исполнителей
        </h2>

        <p className="text-zinc-500 dark:text-zinc-400">
          Лидеры текущей недели
        </p>

        {weekStart && (
          <div className="text-xs text-zinc-400 mt-2">
            Неделя началась: {new Date(weekStart).toLocaleString()}
          </div>
        )}
      </motion.div>

      <div className="bg-white dark:bg-zinc-800/60 backdrop-blur-xl rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400 animate-pulse">
            Загрузка рейтинга...
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            Пока никто не выполнил заданий
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
            {leaders.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">
                    {getRankIcon(index)}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-300 font-semibold text-sm">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
                        {maskEmail(user.email)}
                      </div>

                      {index === 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wide">
                          Лидер недели
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    {user.count}
                  </div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                    {getTaskWord(user.count)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}