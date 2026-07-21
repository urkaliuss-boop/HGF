import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Loader2, Users as UsersIcon, Briefcase, Award, Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { AvitoIcon, YandexIcon, GoogleMapsIcon, TwoGisIcon } from './components/RealPlatformIcons';

// Импорт компонентов
import Footer from './components/Footer';
import Stats from './components/Stats';
import FAQ from './components/FAQ';
import Trust from './components/Trust';
import SummerGlow from './components/SummerGlow';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import NotFound from './components/NotFound';
import UsersPage from './components/Users';
import Maintenance from './components/Maintenance';
import ReferralModal from './components/ReferralModal';
import ToastContainer, { toast } from './components/Toast';
import LevelsInfo from './components/LevelsInfo';
import Leaderboard from './components/Leaderboard';
import BusinessPromo from './components/BusinessPromo';
import BusinessCard from './components/BusinessCard';
import BusinessDashboard from './components/BusinessDashboard';
import BusinessLanding from './components/BusinessLanding';
import Results from './components/Results';
import ROICalculator from './components/ROICalculator';
import HowItWorks from './components/HowItWorks';
import WidgetContent from './components/WidgetContent';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import CityLanding from './components/CityLanding';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Offer from './components/Offer';
import CookieBanner from './components/CookieBanner';

// --- Framer Motion variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// --- КОМПОНЕНТ ГЛАВНОЙ СТРАНИЦЫ ---
const HomePage = () => (
  <main>
    {/* Hero — Asymmetric Split */}
    <header className="relative pt-24 pb-20 px-4 z-10 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[70%] bg-[radial-gradient(ellipse_at_70%_20%,_rgba(0,113,227,0.07),_transparent_60%)] pointer-events-none -z-10 dark:bg-[radial-gradient(ellipse_at_70%_20%,_rgba(41,151,255,0.12),_transparent_60%)]"></div>
      <div className="absolute bottom-0 left-[10%] w-[30%] h-[40%] bg-[radial-gradient(circle,_rgba(0,113,227,0.04),_transparent_60%)] pointer-events-none -z-10 dark:bg-[radial-gradient(circle,_rgba(41,151,255,0.06),_transparent_60%)]"></div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — Text content */}
          <div className="max-w-xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0071e3]/8 dark:bg-[#2997ff]/10 border border-[#0071e3]/15 dark:border-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] text-xs font-semibold mb-6"
            >
              <Sparkles size={13} />
              Платформа для заработка
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.08] tracking-tight mb-6"
            >
              Биржа простых{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#2997ff]">микрозадач.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-lg text-[#86868b] dark:text-[#a1a1a6] leading-relaxed mb-8 max-w-[48ch]"
            >
              Зарабатывай на лайках, отзывах и активностях. Оплата сразу после проверки. Вывод от 40₽.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-start gap-3 mb-6"
            >
              <Link
                to="/tasks"
                className="px-7 py-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full font-semibold text-base transition-all shadow-glow hover:shadow-lg active:scale-[0.97] active:-translate-y-[1px] flex items-center gap-2"
              >
                Смотреть задания <ChevronRight size={17} />
              </Link>
              <a
                href="https://t.me/noxiss_work"
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3.5 bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white rounded-full font-semibold text-base hover:bg-[#f0f0f0] dark:hover:bg-[#2c2c2e] transition-all flex items-center gap-2 shadow-sm border border-zinc-200 dark:border-zinc-700 active:scale-[0.97]"
              >
                <Bell size={17} /> Канал
              </a>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <Link to="/business" className="text-sm font-medium text-[#86868b] hover:text-[#0071e3] transition-colors inline-flex items-center gap-1">
                Вы владелец бизнеса? <span className="text-[#1d1d1f] dark:text-white font-semibold">Заказать отзывы</span> <ChevronRight size={14} />
              </Link>
            </motion.div>
          </div>

          {/* Right column — Floating task cards with real platform icons */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-[440px] mx-auto">

              {/* Card 1 — Yandex */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: -2 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-[5%] left-[2%] w-[75%] p-5 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-card hover:shadow-card-hover transform hover:rotate-0 transition-all duration-500 z-20 animate-float"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                      <YandexIcon size={22} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Яндекс Карты</div>
                      <div className="text-xs text-[#86868b]">Отзыв на ресторан</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg">150 ₽</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '65%' }}
                    transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full"
                  />
                </div>
                <div className="text-[11px] text-[#86868b] mt-1.5">13 из 20 выполнено</div>
              </motion.div>

              {/* Card 2 — Avito */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: 5 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-[18%] right-[0%] w-[68%] p-4 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-card hover:shadow-card-hover transform hover:rotate-0 transition-all duration-500 z-10 animate-float-delayed"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <AvitoIcon size={22} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Авито</div>
                      <div className="text-xs text-[#86868b]">Отзыв продавцу</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg">200 ₽</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] text-[#86868b] font-medium">фото</span>
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] text-[#86868b] font-medium">400+ символов</span>
                </div>
              </motion.div>

              {/* Card 3 — Google Maps (small) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-[45%] right-[5%] p-3 bg-white dark:bg-[#1c1c1e] rounded-xl border border-zinc-100 dark:border-zinc-700/50 shadow-card z-30"
              >
                <div className="flex items-center gap-2">
                  <GoogleMapsIcon size={18} />
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">+5 заданий</span>
                </div>
              </motion.div>

              {/* Card 4 — 2GIS notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-[5%] left-[10%] p-3 bg-white dark:bg-[#1c1c1e] rounded-xl border border-zinc-100 dark:border-zinc-700/50 shadow-card z-30"
              >
                <div className="flex items-center gap-2">
                  <TwoGisIcon size={18} />
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">Оплата получена!</span>
                </div>
              </motion.div>

              {/* Decorative background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 -z-10 scale-[0.85] animate-pulse-soft"></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <HowItWorks />

    <section id="tasks-preview" className="py-16 bg-white/60 dark:bg-white/[0.02] border-y border-zinc-100 dark:border-white/5">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-[#1d1d1f] dark:text-white">Актуальные задания</h2>
        <Tasks />
      </div>
    </section>

    <Stats />

    <BusinessPromo />

    <div className="py-12">
      <Leaderboard />
    </div>

    <LevelsInfo />
    <ROICalculator />
    <Trust />
    <FAQ />
    <Footer />
  </main>
);

// --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [isFestive, setIsFestive] = useState(true);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const errorStr = hashParams.get('error');
      const errorDesc = hashParams.get('error_description');

      if (errorStr === 'access_denied' && errorDesc?.includes('expired')) {
        toast.error('Ссылка устарела или уже использована. Запросите новую при входе.');
      } else if (errorDesc) {
        toast.error(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      }

      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) localStorage.setItem('referral_code', refCode);

    const initApp = async () => {
      const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'maintenance_mode').single();
      setMaintenanceMode(settings?.value === 'true');

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUserId(session.user.id);
        const { data: profile } = await supabase.from('profiles').select('role, invited_by').eq('id', session.user.id).single();
        setUserRole(profile?.role);
        if (profile && !profile.invited_by) {
          const storedRef = localStorage.getItem('referral_code');
          if (storedRef && storedRef !== session.user.id) {
            await supabase.from('profiles').update({ invited_by: storedRef }).eq('id', session.user.id);
            localStorage.removeItem('referral_code');
          }
        }
      }
      setAppLoading(false);
      setMounted(true);
    };

    initApp();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleFestive = () => setIsFestive(!isFestive);

  if (appLoading || !mounted) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F5F7] dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#0071e3]" size={32} />
          <span className="text-sm text-[#86868b] font-medium">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (maintenanceMode && userRole !== 'admin') {
    return <Maintenance />;
  }

  if (location.pathname === '/widget-content') {
    return <WidgetContent />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F7] dark:bg-[#000000] transition-colors duration-500 font-sans selection:bg-[#0071e3]/20 selection:text-current">
      {isFestive && <SummerGlow />}

      <ToastContainer />

      {/* Navigation — glassmorphism */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[90%] max-w-[960px] z-50 bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/30 dark:border-white/10 px-4 py-2 md:px-5 md:py-2.5 transition-all duration-300 shadow-glass dark:shadow-glass-dark ${isMenuOpen ? 'rounded-2xl' : 'rounded-full'}`}>
        <div className="flex items-center justify-between h-[44px]">
          <Link to="/" className="flex items-center gap-2 pl-1 md:pl-2 cursor-pointer group">
            <span className="text-base md:text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">NOXISS<span className="text-[#0071e3]">.WORK</span></span>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-5 mr-2">
              <Link to="/" className={`text-sm font-medium transition-colors hover:text-[#0071e3] ${location.pathname === '/' ? 'text-[#0071e3]' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70'}`}>Главная</Link>
              <Link to="/tasks" className={`text-sm font-medium transition-colors hover:text-[#0071e3] ${location.pathname === '/tasks' ? 'text-[#0071e3]' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70'}`}>Задания</Link>
              <Link
                to="/business"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-[#0071e3] ${location.pathname === '/business' ? 'text-[#0071e3]' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70'}`}
              >
                <Briefcase size={15} /> Для бизнеса
              </Link>
              <Link
                to="/results"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-[#0071e3] ${location.pathname === '/results' ? 'text-[#0071e3]' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70'}`}
              >
                <Award size={15} /> Кейсы
              </Link>
            </div>

            <button onClick={toggleFestive} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Sparkles size={15} className={`${isFestive ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
            </button>

            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun size={16} className="text-white/70" /> : <Moon size={16} className="text-[#1d1d1f]/70" />}
            </button>

            {userId && (
              <button
                onClick={() => setIsRefModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] dark:bg-white/10 hover:bg-[#e8e8ed] dark:hover:bg-white/15 transition-all text-sm font-medium text-[#1d1d1f] dark:text-white"
              >
                <UsersIcon size={15} />
                <span className="hidden sm:inline">Партнеры</span>
              </button>
            )}

            <Link
              to={location.pathname === '/cabinet' ? '/' : '/cabinet'}
              className={`hidden sm:inline-flex ml-1 px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.97] ${location.pathname === '/cabinet' ? 'bg-[#e8e8ed] text-[#1d1d1f] dark:bg-white/15 dark:text-white' : 'bg-[#0071e3] text-white shadow-glow-sm'}`}
            >
              {location.pathname === '/cabinet' ? 'Выйти' : 'Кабинет'}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X size={18} className="text-[#1d1d1f] dark:text-white" /> : <Menu size={18} className="text-[#1d1d1f] dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-2 pt-2 pb-1 flex flex-col gap-0.5 border-t border-zinc-200/50 dark:border-white/10">
                <Link onClick={() => setIsMenuOpen(false)} to="/" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>Главная</Link>
                <Link onClick={() => setIsMenuOpen(false)} to="/tasks" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/tasks' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>Задания</Link>
                <Link onClick={() => setIsMenuOpen(false)} to="/business" className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${location.pathname === '/business' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}><Briefcase size={15} /> Для бизнеса</Link>
                <Link onClick={() => setIsMenuOpen(false)} to="/results" className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${location.pathname === '/results' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}><Award size={15} /> Кейсы</Link>
                {userId && (
                  <button onClick={() => { setIsMenuOpen(false); setIsRefModalOpen(true); }} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-left flex items-center gap-2 text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><UsersIcon size={15} /> Партнеры</button>
                )}
                <Link onClick={() => setIsMenuOpen(false)} to={location.pathname === '/cabinet' ? '/' : '/cabinet'} className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors mt-1 ${location.pathname === '/cabinet' ? 'bg-[#e8e8ed] text-[#1d1d1f] dark:bg-white/15 dark:text-white' : 'bg-[#0071e3] text-white'}`}>
                  {location.pathname === '/cabinet' ? 'Выйти' : 'Кабинет'}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16"></div>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/cabinet" element={<Dashboard />} />
        <Route path="/business" element={<BusinessLanding />} />
        <Route path="/business-prices" element={<BusinessCard />} />
        <Route path="/business-cabinet" element={<BusinessDashboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/otzyvy/:platform/:city" element={<CityLanding />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {userId && (
        <ReferralModal
          isOpen={isRefModalOpen}
          onClose={() => setIsRefModalOpen(false)}
          userId={userId}
        />
      )}

      <CookieBanner />

    </div>
  );
};

export default App;
