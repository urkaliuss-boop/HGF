import React from 'react';
import { Link } from 'react-router-dom'; // <--- Важный импорт
import { ShieldCheck, Users, Zap, ArrowRight, Star } from 'lucide-react';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/** Stagger animation wrapper — 75ms delay per card index */
const StaggerCard: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const anim = useScrollAnimation({ delay: index * 75 });
  return (
    <div ref={anim.ref as React.RefObject<HTMLDivElement>} style={anim.style}>
      {children}
    </div>
  );
};

const BusinessPromo = () => {
  const heroAnim = useScrollAnimation({ threshold: 0.1 });
  const benefitsAnim = useScrollAnimation({ delay: 100 });
  const ctaAnim = useScrollAnimation({ delay: 50 });

  return (
    <div className="relative overflow-hidden">
      {/* Секция 1: Dark — основной блок с заголовком, описанием и декоративными карточками */}
      <Section
        variant="dark"
        decorElements={[
          { type: 'blob', position: { top: '5%', right: '10%' }, opacity: 0.06, size: '150px' },
          { type: 'geometric', position: { bottom: '10%', left: '3%' }, opacity: 0.05, size: '100px' },
          { type: 'dots', position: { top: '60%', right: '2%' }, opacity: 0.04, size: '80px' },
        ]}
      >
        <div ref={heroAnim.ref as React.RefObject<HTMLDivElement>} style={heroAnim.style} className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="fill-accent-primary" />
              Для владельцев бизнеса
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1]">
              Управление репутацией <br />
              <span className="text-accent-primary">без списаний.</span>
            </h2>

            <p className="text-lg text-text-muted leading-relaxed">
              Помогаем бизнесу поднять рейтинг на картах и маркетплейсах. Используем реальных людей с историей, алгоритмы анти-фрода и ручную модерацию.
            </p>
          </div>

          {/* Визуальная часть справа (имитация карточек) */}
          <div className="relative h-full min-h-[300px] hidden md:block">
            <div className="absolute top-10 right-10 w-64 p-5 bg-surface-dark rounded-2xl border border-border-secondary shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-500 z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">Я</div>
                <div>
                  <div className="h-2 w-20 bg-surface-secondary/20 rounded mb-1"></div>
                  <div className="h-2 w-12 bg-surface-secondary/10 rounded"></div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
              <div className="h-2 w-full bg-surface-secondary/10 rounded mb-2"></div>
              <div className="h-2 w-[80%] bg-surface-secondary/10 rounded"></div>
            </div>

            <div className="absolute top-32 right-32 w-64 p-5 bg-surface-dark rounded-2xl border border-border-secondary shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 z-20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center text-white font-bold">Av</div>
                <div>
                  <div className="h-2 w-24 bg-surface-secondary/20 rounded mb-1"></div>
                  <div className="h-2 w-16 bg-surface-secondary/10 rounded"></div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
              <div className="h-2 w-full bg-surface-secondary/10 rounded mb-2"></div>
              <div className="h-2 w-[90%] bg-surface-secondary/10 rounded"></div>
            </div>
          </div>
        </div>
      </Section>

      {/* Секция 2: Accent — преимущества в bordered-карточках (dark → accent = допустимая пара) */}
      <Section
        variant="accent"
        decorElements={[
          { type: 'lines', position: { top: '8%', left: '5%' }, opacity: 0.04, size: '100px' },
          { type: 'dots', position: { bottom: '12%', right: '4%' }, opacity: 0.05, size: '90px' },
        ]}
      >
        <div ref={benefitsAnim.ref as React.RefObject<HTMLDivElement>} style={benefitsAnim.style} className="space-y-6">
          {/* Преимущество 1 — stagger 0ms */}
          <StaggerCard index={0}>
            <Card variant="bordered" hoverable>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl text-green-500 mt-1">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-text-primary font-bold text-lg">Только живые люди</h4>
                  <p className="text-text-secondary text-sm">Никаких ботов. Отзывы пишут реальные пользователи с устройств iPhone/Android.</p>
                </div>
              </div>
            </Card>
          </StaggerCard>

          {/* Преимущество 2 — stagger 75ms */}
          <StaggerCard index={1}>
            <Card variant="bordered" hoverable>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-primary/20 rounded-xl text-accent-primary mt-1">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-text-primary font-bold text-lg">Гарантия от удалений</h4>
                  <p className="text-text-secondary text-sm">Мы знаем алгоритмы Яндекса и Авито. Если отзыв пропадет — вернем деньги или переделаем.</p>
                </div>
              </div>
            </Card>
          </StaggerCard>
        </div>
      </Section>

      {/* Секция 3: Light — CTA блок (accent → light = допустимо, ΔL достаточная через textured) */}
      <Section
        variant="textured"
        decorElements={[
          { type: 'geometric', position: { top: '15%', right: '8%' }, opacity: 0.05, size: '100px' },
          { type: 'blob', position: { bottom: '10%', left: '5%' }, opacity: 0.04, size: '120px' },
        ]}
      >
        <div ref={ctaAnim.ref as React.RefObject<HTMLDivElement>} style={ctaAnim.style} className="text-center">
          <Link
            to="/business"
            className="inline-flex items-center gap-3 px-8 py-5 bg-accent-primary text-white rounded-full font-bold text-lg hover:bg-accent-primary/90 transition-all shadow-[0_0_40px_-10px_rgba(0,107,219,0.4)] hover:scale-105"
          >
            Рассчитать стоимость
            <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-sm text-text-muted">Работаем с Авито, Яндекс.Карты, 2ГИС, Google Maps, AppStore.</p>
        </div>
      </Section>
    </div>
  );
};

export default BusinessPromo;
