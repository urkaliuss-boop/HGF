import React from 'react';
import { Quote, CheckCircle2 } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  { id: 1, author: 'Михаил Д.', text: "Сначала сомневался, сделал пару отзывов на Гугле. Оплату получил в 21:00 как часы. Сейчас беру пачками.", date: "Вчера", verified: true },
  { id: 2, author: 'Елена К.', text: "Отличная подработка. Точку искать самой даже удобнее. Админ всегда на связи, мануалы понятные.", date: "16.01.2024", verified: true },
  { id: 3, author: 'Алексей', text: "Яндекс проходит дня за 3-4, зато платят хорошо. Главное делать по инструкции.", date: "18.01.2024", verified: true },
];

const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-24 px-4 max-w-7xl mx-auto bg-[#F5F5F7] dark:bg-[#0a0a0a]">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-12 text-center">Отзывы</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-sm hover:shadow-apple-hover transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                       {t.author.charAt(0)}
                   </div>
                   <span className="font-bold text-[#1d1d1f] dark:text-white text-sm">{t.author}</span>
               </div>
               {t.verified && <CheckCircle2 size={16} className="text-blue-500" />}
            </div>
            <p className="text-[#1d1d1f] dark:text-slate-300 mb-6 text-sm leading-relaxed font-medium">
              "{t.text}"
            </p>
            <p className="text-xs text-[#86868b]">{t.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;