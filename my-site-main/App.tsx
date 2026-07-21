import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Leaf, Loader2, Users as UsersIcon, Briefcase, Award, Menu, X } from 'lucide-react';
import { supabase } from './supabaseClient';

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
import Hero from './components/Hero';

// --- КОМПОНЕНТ ГЛАВНОЙ СТРАНИЦЫ ---
const HomePage = () => (
  <main>
    <Hero />

    <HowItWorks />

    <section id="tasks-preview" className="py-12 bg-white dark:bg-black/40 border-y border-slate-100 dark:border-white/5">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-[28px] lg:text-[45px] font-extrabold text-center mb-8 dark:text-white tracking-[-0.02em] leading-[1.1]">Актуальные задания</h2>
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

// --- THEME PROVIDER ---
function getInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialTheme() === 'dark');
  const [isFestive, setIsFestive] = useState(true);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    // 1. Проверяем наличие ошибки в хеше URL (от Supabase Auth)
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

      // Очищаем хеш из URL, чтобы не смущать пользователя
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
    const html = document.documentElement;
    // Enable theme transition on html for smooth switching
    html.style.transition = [
      'background-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      'color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      'border-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      'box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1)',
    ].join(', ');

    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Persist user choice
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleFestive = () => setIsFestive(!isFestive);

  if (appLoading || !mounted) {
    return (<div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>);
  }

  if (maintenanceMode && userRole !== 'admin') {
    return <Maintenance />;
  }

  if (location.pathname === '/widget-content') {
    return <WidgetContent />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] transition-colors duration-500 font-sans selection:bg-primary-500 selection:text-white">
      {isFestive && <SummerGlow />}

      <ToastContainer />

      <nav className={`absolute top-6 left-1/2 -translate-x-1/2 w-[92%] md:w-[90%] max-w-[960px] z-50 bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10 px-4 py-2 md:px-5 md:py-3 transition-all duration-300 ${isMenuOpen ? 'rounded-[2rem]' : 'rounded-2xl md:rounded-full'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 pl-1 md:pl-2 cursor-pointer">
            <span className="text-base md:text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">NOXISS<span className="text-primary-500">.WORK</span></span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-6 mr-2">
              <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-500' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70'}`}>Главная</Link>
              <Link to="/tasks" className={`text-sm font-medium transition-colors ${location.pathname === '/tasks' ? 'text-primary-500' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70'}`}>Задания</Link>

              <Link
                to="/business"
                className={`text-sm font-medium flex items-center gap-2 transition-colors ${location.pathname === '/business' ? 'text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white hover:text-[#0071e3]'}`}
              >
                <Briefcase size={16} /> Для бизнеса
              </Link>
              <Link
                to="/results"
                className={`text-sm font-medium flex items-center gap-2 transition-colors ${location.pathname === '/results' ? 'text-primary-500' : 'text-[#1d1d1f] dark:text-white hover:text-primary-500'}`}
              >
                <Award size={16} /> Кейсы
              </Link>
            </div>

            <button onClick={toggleFestive} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><Leaf size={16} className={`text-slate-500 dark:text-slate-400 ${isFestive ? "text-green-500 dark:text-green-400" : ""}`} /></button>
            <button onClick={toggleTheme} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'dark:bg-white/10' : 'bg-black/5'} hover:bg-black/5 dark:hover:bg-white/10`}>{isDarkMode ? <Sun size={16} className="text-white" /> : <Moon size={16} className="text-slate-800" />}</button>

            {userId && (
              <button
                onClick={() => setIsRefModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-sm font-medium text-slate-900 dark:text-white"
              >
                <UsersIcon size={16} />
                <span className="hidden sm:inline">Партнеры</span>
              </button>
            )}

            <Link
              to={location.pathname === '/cabinet' ? '/' : '/cabinet'}
              className={`hidden sm:inline-flex ml-1 px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-lg ${location.pathname === '/cabinet' ? 'bg-slate-200 text-black dark:bg-white/20 dark:text-white' : 'bg-[#0071e3] text-white shadow-blue-500/30'}`}
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

        {isMenuOpen && (
          <div className="md:hidden mt-3 px-2 pb-2 flex flex-col gap-1 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <Link onClick={() => setIsMenuOpen(false)} to="/" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-primary-500/10 text-primary-500' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>Главная</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/tasks" className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/tasks' ? 'bg-primary-500/10 text-primary-500' : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70 hover:bg-black/5 dark:hover:bg-white/5'}`}>Задания</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/business" className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${location.pathname === '/business' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}><Briefcase size={16} /> Для бизнеса</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/results" className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${location.pathname === '/results' ? 'bg-primary-500/10 text-primary-500' : 'text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}><Award size={16} /> Кейсы</Link>
            {userId && (
              <button onClick={() => { setIsMenuOpen(false); setIsRefModalOpen(true); }} className="px-4 py-2.5 rounded-xl text-sm font-bold text-left flex items-center gap-2 text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><UsersIcon size={16} /> Партнеры</button>
            )}
            <Link onClick={() => setIsMenuOpen(false)} to={location.pathname === '/cabinet' ? '/' : '/cabinet'} className={`px-4 py-2.5 rounded-xl text-sm font-bold text-center transition-colors ${location.pathname === '/cabinet' ? 'bg-slate-200 text-black dark:bg-white/20 dark:text-white' : 'bg-[#0071e3] text-white'}`}>
              {location.pathname === '/cabinet' ? 'Выйти' : 'Кабинет'}
            </Link>
          </div>
        )}
      </nav>

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

