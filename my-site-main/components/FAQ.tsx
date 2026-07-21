import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Clock, Shield, FileText } from 'lucide-react';
import { Section } from './ui/Section';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation, calculateStaggerDelay } from '../hooks/useScrollAnimation';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ComponentType<any>;
}

const faqs: FAQItem[] = [
  {
    question: 'В чем суть работы?',
    answer: 'Бизнесу нужны хорошие отзывы для репутации. Вы пишете качественный отзыв, помогаете компании, а мы оплачиваем ваш труд.',
    icon: FileText,
  },
  {
    question: 'Почему выплата в 21:00, а не сразу?',
    answer: 'Мы платим вечером, чтобы убедиться, что отзыв успешно прошел модерацию и закрепился. Это гарантирует оплату за качественную работу.',
    icon: Clock,
  },
  {
    question: 'Нужен опыт?',
    answer: 'Опыт не обязателен — мы предоставим подробную инструкцию.',
    icon: MessageCircle,
  },
  {
    question: 'Что если отзыв удалят?',
    answer: 'Мы оплачиваем только активные отзывы. Если отзыв удалила нейросеть площадки — предложим другое задание.',
    icon: Shield,
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const headerAnim = useScrollAnimation({ threshold: 0.2, duration: 500 });

  const itemAnimations = [
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(0, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(1, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(2, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(3, 75) }),
  ];

  return (
    <Section variant="textured">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12" ref={headerAnim.ref as React.RefObject<HTMLDivElement>} style={headerAnim.style}>
          <IconBadge icon={HelpCircle} color="blue-500" size="lg" className="mx-auto mb-4" />
          <h2 className="text-[28px] lg:text-[45px] font-extrabold text-text-primary tracking-[-0.02em] leading-[1.1]">
            Частые вопросы
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <div
                key={index}
                ref={itemAnimations[index].ref as React.RefObject<HTMLDivElement>}
                style={itemAnimations[index].style}
                className="bg-surface-secondary rounded-card border border-slate-100 dark:border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center gap-3 py-6 px-6 text-left focus:outline-none group"
                >
                  <Icon className="w-5 h-5 text-accent-primary flex-shrink-0" />
                  <span className="font-semibold text-[18px] lg:text-[28px] text-text-primary tracking-[-0.02em] leading-[1.1] flex-1">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="text-text-muted w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-text-muted w-5 h-5 flex-shrink-0" />
                  )}
                </button>

                <div
                  className={`text-[16px] lg:text-[18px] text-text-secondary tracking-[0.01em] leading-[1.6] transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === index ? 'max-h-40 pb-6 px-6 pl-14 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default FAQ;
