import React from 'react';
import { Quote, CheckCircle2, MessageSquare } from 'lucide-react';
import { Testimonial } from '../types';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation, calculateStaggerDelay } from '../hooks/useScrollAnimation';

const testimonials: Testimonial[] = [
  { id: 1, author: 'Михаил Д.', text: "Сначала сомневался, сделал пару отзывов на Гугле. Оплату получил в 21:00 как часы. Сейчас беру пачками.", date: "Вчера", verified: true },
  { id: 2, author: 'Елена К.', text: "Отличная подработка. Точку искать самой даже удобнее. Админ всегда на связи, мануалы понятные.", date: "16.01.2024", verified: true },
  { id: 3, author: 'Алексей', text: "Яндекс проходит дня за 3-4, зато платят хорошо. Главное делать по инструкции.", date: "18.01.2024", verified: true },
];

const Testimonials: React.FC = () => {
  const headerAnim = useScrollAnimation({ threshold: 0.2, duration: 500 });

  const cardAnimations = [
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(0, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(1, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(2, 75) }),
  ];

  return (
    <Section variant="accent" id="reviews">
      <div className="text-center mb-12" ref={headerAnim.ref as React.RefObject<HTMLDivElement>} style={headerAnim.style}>
        <IconBadge icon={MessageSquare} color="blue-500" size="lg" className="mx-auto mb-4" />
        <h2 className="text-[28px] lg:text-[45px] font-extrabold text-text-primary tracking-[-0.02em] leading-[1.1]">
          Отзывы
        </h2>
      </div>

      {/* Bento grid: first testimonial spans 2 cols */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, index) => (
          <div
            key={t.id}
            ref={cardAnimations[index].ref as React.RefObject<HTMLDivElement>}
            style={cardAnimations[index].style}
            className={index === 0 ? 'md:col-span-2 lg:col-span-1' : 'col-span-1'}
          >
            <Card variant="glass" accent="line" hoverable className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-sm font-bold text-accent-primary">
                    {t.author.charAt(0)}
                  </div>
                  <span className="font-semibold text-text-primary text-sm">{t.author}</span>
                </div>
                {t.verified && <CheckCircle2 size={18} className="text-accent-primary" />}
              </div>
              <p className="text-[14px] lg:text-[16px] text-text-primary dark:text-slate-300 mb-6 tracking-[0.01em] leading-[1.6]">
                "{t.text}"
              </p>
              <p className="text-[12px] lg:text-[14px] text-text-muted mt-auto tracking-[0.01em] leading-[1.6]">{t.date}</p>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;
