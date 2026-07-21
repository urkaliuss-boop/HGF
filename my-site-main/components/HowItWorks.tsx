import React from 'react';
import { Search, PenTool, CheckCircle, ArrowRight } from 'lucide-react';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import { useScrollAnimation, calculateStaggerDelay } from '../hooks/useScrollAnimation';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: '1. Выберите задание',
      desc: 'В ленте всегда есть задачи на лайки, подписки или отзывы.',
      color: 'blue-500',
    },
    {
      icon: PenTool,
      title: '2. Выполните',
      desc: 'Следуйте простой инструкции от заказчика.',
      color: 'amber-500',
    },
    {
      icon: CheckCircle,
      title: '3. Получите оплату',
      desc: 'Деньги на баланс сразу после проверки модератором.',
      color: 'green-500',
    },
  ];

  const headerAnim = useScrollAnimation({ threshold: 0.2, duration: 500 });

  const stepAnimations = [
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(0, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(1, 75) }),
    useScrollAnimation({ threshold: 0.2, duration: 500, delay: calculateStaggerDelay(2, 75) }),
  ];

  return (
    <Section variant="light" id="how-it-works">
      <div className="text-center mb-16" ref={headerAnim.ref as React.RefObject<HTMLDivElement>} style={headerAnim.style}>
        <h2 className="text-[28px] lg:text-[45px] font-extrabold text-text-primary tracking-[-0.02em] leading-[1.1] mb-4">
          Как это работает?
        </h2>
        <p className="text-[16px] lg:text-[18px] text-text-secondary max-w-xl mx-auto tracking-[0.01em] leading-[1.6]">
          Всего 3 простых шага отделяют вас от первого заработка на платформе NOXISS.WORK
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
        {/* Connection line for desktop */}
        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/20 via-amber-500/20 to-green-500/20 z-0" aria-hidden="true"></div>

        {steps.map((step, idx) => (
          <div
            key={idx}
            ref={stepAnimations[idx].ref as React.RefObject<HTMLDivElement>}
            style={stepAnimations[idx].style}
            className={idx === 1 ? 'md:col-span-1' : 'md:col-span-1'}
          >
            <Card variant="bordered" accent="line" hoverable className="relative z-10 text-center h-full">
              <div className="flex flex-col items-center">
                <IconBadge icon={step.icon} color={step.color} size="lg" className="mb-6" />
                <h3 className="text-[22px] lg:text-[36px] font-semibold text-text-primary tracking-[-0.02em] leading-[1.1] mb-3">
                  {step.title}
                </h3>
                <p className="text-[14px] lg:text-[16px] text-text-secondary max-w-[250px] tracking-[0.01em] leading-[1.6]">
                  {step.desc}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
}
