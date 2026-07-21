import React from 'react';
import { ShieldCheck, Fingerprint, Activity, Lock } from 'lucide-react';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation, calculateStaggerDelay } from '../hooks/useScrollAnimation';

const trustItems = [
  {
    icon: Lock,
    title: 'Приватно',
    desc: 'Данные используются только для выплаты. Никаких лишних вопросов.',
    color: 'blue-500',
  },
  {
    icon: Activity,
    title: 'Прозрачно',
    desc: 'Честно говорим статус модерации. Если отзыв висит — деньги ваши.',
    color: 'green-500',
  },
  {
    icon: Fingerprint,
    title: 'Умные алгоритмы',
    desc: 'Выдаем мануалы, как обходить анти-фрод системы карт.',
    color: 'purple-500',
  },
  {
    icon: ShieldCheck,
    title: 'Поддержка',
    desc: 'Менеджер на связи. Решаем любые вопросы оперативно.',
    color: 'amber-500',
  },
];

const Trust: React.FC = () => {
  const headerAnim = useScrollAnimation({ threshold: 0.2, duration: 500 });

  const cardAnimations = [
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(0, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(1, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(2, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(3, 75) }),
  ];

  return (
    <Section variant="accent">
      <div className="mb-12" ref={headerAnim.ref as React.RefObject<HTMLDivElement>} style={headerAnim.style}>
        <h2 className="text-[28px] lg:text-[45px] font-extrabold text-text-primary tracking-[-0.02em] leading-[1.1]">
          Почему выбирают нас
        </h2>
      </div>

      {/* Bento grid: first item spans 2 cols for visual hierarchy */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            ref={cardAnimations[idx].ref as React.RefObject<HTMLDivElement>}
            style={cardAnimations[idx].style}
            className={idx === 0 ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'}
          >
            <Card variant="bordered" accent="corner" hoverable className="h-full">
              <IconBadge icon={item.icon} color={item.color} size="md" className="mb-4" />
              <h3 className="text-[22px] lg:text-[36px] font-semibold mb-2 text-text-primary tracking-[-0.02em] leading-[1.1]">
                {item.title}
              </h3>
              <p className="text-[14px] lg:text-[16px] text-text-muted tracking-[0.01em] leading-[1.6]">
                {item.desc}
              </p>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Trust;
