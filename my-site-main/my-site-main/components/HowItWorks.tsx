import React from 'react';
import { Search, PenTool, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function HowItWorks() {
    const steps = [
        {
            icon: Search,
            num: '01',
            title: 'Выберите задание',
            desc: 'В ленте всегда есть задачи на лайки, подписки или отзывы.',
        },
        {
            icon: PenTool,
            num: '02',
            title: 'Выполните',
            desc: 'Следуйте простой инструкции от заказчика.',
        },
        {
            icon: CheckCircle,
            num: '03',
            title: 'Получите оплату',
            desc: 'Деньги на баланс сразу после проверки модератором.',
        }
    ];

    return (
        <section className="py-20 relative z-10">
            <div className="max-w-5xl mx-auto px-4">

                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-14"
                >
                    Как это работает
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                className="group relative"
                            >
                                {/* Step number */}
                                <div className="text-[80px] font-black text-zinc-100 dark:text-zinc-800/60 leading-none select-none absolute -top-2 -left-1 -z-10 transition-colors group-hover:text-emerald-100 dark:group-hover:text-emerald-900/30">
                                    {step.num}
                                </div>

                                <div className="pt-10 pl-1">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px]">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
