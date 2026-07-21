import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Briefcase, ArrowRight, Mail } from 'lucide-react';

const CITIES_LIST = [
  { slug: 'moskva', name: 'Москва' },
  { slug: 'spb', name: 'Санкт-Петербург' },
  { slug: 'novosibirsk', name: 'Новосибирск' },
  { slug: 'ekaterinburg', name: 'Екатеринбург' },
  { slug: 'kazan', name: 'Казань' },
  { slug: 'nizhniy-novgorod', name: 'Нижний Новгород' },
  { slug: 'chelyabinsk', name: 'Челябинск' },
  { slug: 'samara', name: 'Самара' },
  { slug: 'omsk', name: 'Омск' },
  { slug: 'rostov', name: 'Ростов-на-Дону' },
  { slug: 'ufa', name: 'Уфа' },
  { slug: 'krasnoyarsk', name: 'Красноярск' },
  { slug: 'perm', name: 'Пермь' },
  { slug: 'voronezh', name: 'Воронеж' },
  { slug: 'volgograd', name: 'Волгоград' },
  { slug: 'krasnodar', name: 'Краснодар' },
  { slug: 'tyumen', name: 'Тюмень' },
  { slug: 'saratov', name: 'Саратов' },
  { slug: 'tolyatti', name: 'Тольятти' },
  { slug: 'izhevsk', name: 'Ижевск' },
  { slug: 'barnaul', name: 'Барнаул' },
  { slug: 'vladivostok', name: 'Владивосток' },
  { slug: 'irkutsk', name: 'Иркутск' },
  { slug: 'habarovsk', name: 'Хабаровск' },
  { slug: 'orenburg', name: 'Оренбург' },
  { slug: 'tomsk', name: 'Томск' },
  { slug: 'kemerovo', name: 'Кемерово' },
  { slug: 'ryazan', name: 'Рязань' },
  { slug: 'astrakhan', name: 'Астрахань' },
  { slug: 'naberezhnye-chelny', name: 'Набережные Челны' },
  { slug: 'penza', name: 'Пенза' },
  { slug: 'lipetsk', name: 'Липецк' },
  { slug: 'kirov', name: 'Киров' },
  { slug: 'kaliningrad', name: 'Калининград' },
  { slug: 'tula', name: 'Тула' },
  { slug: 'cheboksary', name: 'Чебоксары' },
  { slug: 'stavropol', name: 'Ставрополь' },
  { slug: 'sochi', name: 'Сочи' },
  { slug: 'minsk', name: 'Минск' },
];

const Footer: React.FC = () => {
  const [showAllCities, setShowAllCities] = useState(false);

  return (
    <footer className="bg-white dark:bg-black py-16 border-t border-slate-100 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-10">

        {/* Левая часть: Логотип и описание */}
        <div className="max-w-xs">
          <h4 className="text-[18px] lg:text-[28px] text-[#1d1d1f] dark:text-white font-semibold tracking-[-0.02em] leading-[1.1] mb-4">
            NOXISS<span className="text-primary-500">.WORK</span>
          </h4>
          <p className="text-[14px] lg:text-[16px] tracking-[0.01em] leading-[1.6] text-[#86868b] mb-6">
            Платформа для работы с репутацией. <br />
            Просто, честно, выгодно.
          </p>
          <div className="text-[12px] lg:text-[14px] text-[#86868b] opacity-60 tracking-[0.01em] leading-[1.6]">
            © {new Date().getFullYear()} NOXISS GROUP.
          </div>
        </div>

        {/* Центральная часть: Контакты */}
        <div className="flex flex-col items-start gap-3 w-full md:w-auto">

          {/* Email */}
          <a
            href="mailto:urkaliuss@gmail.com"
            className="group w-full md:w-auto flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg group-hover:scale-110 transition-transform">
              <Mail size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Почта</div>
              <div className="text-sm font-bold text-[#1d1d1f] dark:text-white">urkaliuss@gmail.com</div>
            </div>
          </a>

          {/* Кнопка ДЛЯ БИЗНЕСА */}
          <a
            href="https://t.me/m/LOfp28FYYTRi"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full md:w-auto flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#0071e3]/5 hover:bg-[#0071e3]/10 border border-[#0071e3]/20 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#0071e3] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Владельцам бизнеса</div>
              <div className="text-sm font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                Заказать отзывы <ArrowRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>

          {/* Поддержка */}
          <a
            href="https://t.me/noxiss1"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 mt-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Send size={14} /> Чат воркеров / Поддержка
          </a>

        </div>
      </div>

      {/* Продвижение по городам (SEO локальные страницы) */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Отзывы и продвижение в городах
          </h5>
          <button 
            onClick={() => setShowAllCities(!showAllCities)} 
            className="text-xs font-bold text-[#0071e3] hover:text-blue-500 transition-colors bg-[#0071e3]/5 dark:bg-[#0071e3]/10 px-3 py-1.5 rounded-full"
          >
            {showAllCities ? 'Скрыть часть' : 'Показать все города'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4 text-[11px] leading-relaxed">
          {(showAllCities ? CITIES_LIST : CITIES_LIST.slice(0, 12)).map(city => (
            <div key={city.slug} className="flex flex-col gap-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">{city.name}</span>
              <div className="flex flex-col pl-2 border-l border-slate-100 dark:border-white/5 gap-0.5">
                <Link to={`/otzyvy/avito/${city.slug}`} className="text-slate-400 dark:text-slate-500 hover:text-[#0071e3] transition-colors">Купить на Авито</Link>
                <Link to={`/otzyvy/yandex/${city.slug}`} className="text-slate-400 dark:text-slate-500 hover:text-[#0071e3] transition-colors">Яндекс Карты</Link>
                <Link to={`/otzyvy/2gis/${city.slug}`} className="text-slate-400 dark:text-slate-500 hover:text-[#0071e3] transition-colors">2ГИС отзывы</Link>
                <Link to={`/otzyvy/google/${city.slug}`} className="text-slate-400 dark:text-slate-500 hover:text-[#0071e3] transition-colors">Google Maps</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя часть: Правовая информация */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
        <div className="flex flex-wrap gap-6 text-xs font-medium mb-4">
          <Link to="/offer" className="text-[#86868b] hover:text-[#0071e3] transition-colors">Публичная оферта</Link>
          <Link to="/terms" className="text-[#86868b] hover:text-[#0071e3] transition-colors">Правила</Link>
          <Link to="/privacy" className="text-[#86868b] hover:text-[#0071e3] transition-colors">Конфиденциальность</Link>
          <Link to="/blog" className="text-[#0071e3] hover:text-blue-600 font-bold flex items-center gap-1 transition-colors">
            База знаний <ArrowRight size={12} />
          </Link>
        </div>

        <p className="text-[10px] text-[#86868b] opacity-60 leading-normal max-w-2xl">
          *Мы оставляем за собой право открыть арбитраж или потребовать возврат средств, если оплаченный отзыв будет удален модерацией площадки.
        </p>
      </div>
    </footer>
  );
};

export default Footer;