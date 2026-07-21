import React from 'react';
import { MapPin, ShoppingBag, Globe, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { PricingItem } from '../types';
import NeonCard from './NeonCard';
import GlitchText from './GlitchText';

interface PricingDetails extends PricingItem {
  moderationTime: string;
  difficulty: string;
}

const prices: PricingDetails[] = [
  { 
    id: 1, 
    platform: 'Google Карты', 
    price: 40, 
    color: 'green', 
    iconName: 'globe',
    moderationTime: 'Моментально',
    difficulty: 'Легко'
  },
  { 
    id: 2, 
    platform: 'Яндекс Карты', 
    price: 100, 
    color: 'red', 
    iconName: 'map',
    moderationTime: 'до 4 дней',
    difficulty: 'Средне'
  },
  { 
    id: 3, 
    platform: 'Авито', 
    price: 200, 
    color: 'blue', 
    iconName: 'bag',
    moderationTime: '5-10 дней',
    difficulty: 'Сложно'
  },
];

const Pricing: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'globe': return <Globe className="w-6 h-6" />;
      case 'map': return <MapPin className="w-6 h-6" />;
      case 'bag': return <ShoppingBag className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  return (
    <section id="pricing" className="py-32 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] dark:text-white mb-6 tracking-tight">Тарифы</h2>
        <p className="text-[#86868b] text-lg font-medium max-w-2xl mx-auto">
            Оплата за каждый опубликованный отзыв. <br/>
            Выплаты ежедневно в <span className="text-primary-500 font-bold">21:00 МСК</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {prices.map((item, index) => (
          <NeonCard key={item.id} highlight={index === 1}>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${
                index === 1 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'bg-[#F5F5F7] dark:bg-white/10 text-[#1d1d1f] dark:text-white'
              }`}>
                {getIcon(item.iconName)}
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] dark:text-white">{item.platform}</h3>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-[#1d1d1f] dark:text-white tracking-tighter">{item.price}₽</span>
                <span className="text-slate-400 font-medium">/ шт</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1 border-t border-slate-100 dark:border-white/5 pt-6">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium text-sm">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Модерация: {item.moderationTime}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Мануал в комплекте</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Сложность: {item.difficulty}</span>
              </div>
            </div>

            <a 
              href="https://t.me/noxiss1" 
              target="_blank"
              rel="noreferrer"
              className={`w-full py-3.5 rounded-full text-center font-bold text-sm transition-all flex items-center justify-center gap-2 group ${
                index === 1 
                  ? 'bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-lg shadow-blue-500/20' 
                  : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#e8e8ed] dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
              }`}
            >
              Взять в работу
            </a>
          </NeonCard>
        ))}
      </div>
    </section>
  );
};

export default Pricing;