import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart3, Save, Users, CreditCard, Award, TrendingUp, RefreshCw, Zap, Settings } from 'lucide-react';
import { Card } from './ui/Card';

export default function AdminStatsEditor() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    mode: 'fake', // 'real' | 'fake'
    online: 0,
    paid: 0,
    reviews: 0,
    daily: 0
  });

  // Загрузка настроек при старте
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'stats_config').single();
    if (data && data.value) {
      try {
        const parsed = JSON.parse(data.value);
        setConfig(parsed);
      } catch (e) {
        console.error("Ошибка парсинга JSON", e);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('app_settings')
      .update({ value: JSON.stringify(config) })
      .eq('key', 'stats_config');
    
    if (!error) alert('Настройки статистики сохранены!');
    else alert('Ошибка: ' + error.message);
    setLoading(false);
  };

  return (
    <Card variant="elevated" hoverable={false} className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 className="text-accent-primary" /> 
            Управление статистикой (Главная)
            </h3>
            <p className="text-sm text-text-muted mt-1">
            Выберите, какие цифры видят пользователи на главной странице.
            </p>
        </div>

        {/* ПЕРЕКЛЮЧАТЕЛЬ REAL / FAKE */}
        <div className="flex bg-surface-secondary dark:bg-white/10 p-1 rounded-xl">
            <button 
                onClick={() => setConfig({ ...config, mode: 'real' })}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${config.mode === 'real' ? 'bg-surface-primary dark:bg-surface-secondary text-green-600 shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
            >
                <Zap size={14} /> Реальные (БД)
            </button>
            <button 
                onClick={() => setConfig({ ...config, mode: 'fake' })}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${config.mode === 'fake' ? 'bg-surface-primary dark:bg-surface-secondary text-amber-500 shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
            >
                <Settings size={14} /> Имитация
            </button>
        </div>
      </div>

      {config.mode === 'real' ? (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-500/20 text-center">
            <RefreshCw className="inline mb-2" />
            <p className="text-base leading-relaxed">Сейчас данные берутся напрямую из базы данных в реальном времени.</p>
        </div>
      ) : (
        <Card variant="bordered" hoverable={false} className="!p-0 !border-border-primary dark:!border-border-secondary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 animate-fade-in-up">
              <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1"><Users size={12}/> Воркеров онлайн</label>
                  <input type="number" value={config.online} onChange={(e) => setConfig({...config, online: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-surface-primary dark:bg-surface-dark border border-border-primary dark:border-border-secondary outline-none text-text-primary font-mono" />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1"><CreditCard size={12}/> Выплачено (₽)</label>
                  <input type="number" value={config.paid} onChange={(e) => setConfig({...config, paid: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-surface-primary dark:bg-surface-dark border border-border-primary dark:border-border-secondary outline-none text-text-primary font-mono" />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1"><Award size={12}/> Отзывов</label>
                  <input type="number" value={config.reviews} onChange={(e) => setConfig({...config, reviews: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-surface-primary dark:bg-surface-dark border border-border-primary dark:border-border-secondary outline-none text-text-primary font-mono" />
              </div>
              <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1"><TrendingUp size={12}/> Доход в день (₽)</label>
                  <input type="number" value={config.daily} onChange={(e) => setConfig({...config, daily: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-surface-primary dark:bg-surface-dark border border-border-primary dark:border-border-secondary outline-none text-text-primary font-mono" />
              </div>
          </div>
        </Card>
      )}

      <button 
        onClick={handleSave} 
        disabled={loading}
        className="mt-6 w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] active:duration-100"
      >
        <Save size={18} /> {loading ? 'Сохранение...' : 'Сохранить настройки'}
      </button>
    </Card>
  );
}
