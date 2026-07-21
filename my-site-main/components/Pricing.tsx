import React from 'react';
import { MapPin, ShoppingBag, Globe, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { PricingItem } from '../types';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation, calculateStaggerDelay } from '../hooks/useScrollAnimation';

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
    difficulty: 'Легко',
  },
  {
    id: 2,
    platform: 'Яндекс Карты',
    price: 100,
    color: 'red',
    iconName: 'map',
    moderationTime: 'до 4 дней',
    difficulty: 'Средне',
  },
  {
    id: 3,
    platform: 'Авито',
    price: 200,
    color: 'blue',
    iconName: 'bag',
    moderationTime: '5-10 дней',
    difficulty: 'Сложно',
  },
];

const Pricing: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'globe': return Globe;
      case 'map': return MapPin;
      case 'bag': return ShoppingBag;
      default: return Globe;
    }
  };

  const getIconColor = (name: string) => {
    switch (name) {
      case 'globe': return 'green-500';
      case 'map': return 'red-500';
      case 'bag': return 'blue-500';
      default: return 'blue-500';
    }
  };

  const headerAnim = useScrollAnimation({ threshold: 0.2, duration: 500 });

  const cardAnimations = [
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(0, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(1, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(2, 75) }),
  ];

  return (
    <Section variant="light" id="pricing">
      <div className="text-center mb-16" ref={headerAnim.ref as React.RefObject<HTMLDivElement>} style={headerAnim.style}>
        <h2 className="text-[28px] lg:text-[45px] font-extrabold text-text-primary mb-6 tracking-[-0.02em] leading-[1.1]">
          Тарифы
        </h2>
        <p className="text-[16px] lg:text-[18px] text-text-muted font-medium max-w-2xl mx-auto tracking-[0.01em] leading-[1.6]">
          Оплата за каждый опубликованный отзыв.<br />
          Выплаты ежедневно в <span className="text-accent-primary font-bold">21:00 МСК</span>.
        </p>
      </div>

      {/* Grid with visual hierarchy: middle card spans 2 cols on tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {prices.map((item, index) => (
          <div
            key={item.id}
            ref={cardAnimations[index].ref as React.RefObject<HTMLDivElement>}
            style={cardAnimations[index].style}
            className={index === 1 ? 'md:col-span-2 lg:col-span-1' : 'col-span-1'}
          >
            <Card
              variant="elevated"
              accent={index === 1 ? 'line' : 'corner'}
              accentColor={index === 1 ? 'var(--accent-primary)' : undefined}
              hoverable
              className="h-full flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <IconBadge
                  icon={getIcon(item.iconName)}
                  color={getIconColor(item.iconName)}
                  size="md"
                />
                <h3 className="text-[22px] lg:text-[36px] font-semibold text-text-primary tracking-[-0.02em] leading-[1.1]">
                  {item.platform}
                </h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-text-primary tracking-tighter">
                    {item.price}₽
                  </span>
                  <span className="text-text-muted font-medium">/ шт</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1 border-t border-slate-100 dark:border-white/5 pt-6">
                <div className="flex items-center gap-3 text-text-secondary font-medium text-[14px] lg:text-[16px] tracking-[0.01em] leading-[1.6]">
                  <Clock className="w-5 h-5 text-accent-primary flex-shrink-0" />
                  <span>Модерация: {item.moderationTime}</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary font-medium text-[14px] lg:text-[16px] tracking-[0.01em] leading-[1.6]">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Мануал в комплекте</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary font-medium text-[14px] lg:text-[16px] tracking-[0.01em] leading-[1.6]">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>Сложность: {item.difficulty}</span>
                </div>
              </div>

              <a
                href="https://t.me/noxiss1"
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3.5 rounded-button text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  index === 1
                    ? 'bg-accent-primary text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                    : 'bg-surface-accent text-text-primary hover:bg-surface-accent/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                }`}
              >
                Взять в работу
              </a>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Pricing;
