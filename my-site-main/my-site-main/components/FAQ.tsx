import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "В чем суть работы?",
    answer: "Бизнесу нужны хорошие отзывы для репутации. Вы пишете качественный отзыв, помогаете компании, а мы оплачиваем ваш труд.",
  },
  {
    question: "Почему выплата в 21:00, а не сразу?",
    answer: "Мы платим вечером, чтобы убедиться, что отзыв успешно прошел модерацию и закрепился. Это гарантирует оплату за качественную работу.",
  },
  {
    question: "Нужен опыт?",
    answer: "Опыт не обязателен — мы предоставим подробную инструкцию.",
  },
  {
    question: "Что если отзыв удалят?",
    answer: "Мы оплачиваем только активные отзывы. Если отзыв удалила нейросеть площадки — предложим другое задание.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 max-w-3xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-12"
      >
        Частые вопросы
      </motion.h2>
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className={`w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none group transition-colors rounded-xl ${
                openIndex === index
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span className="font-semibold text-base text-zinc-900 dark:text-white pr-4">
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                className={`text-zinc-400 shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-1 text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;