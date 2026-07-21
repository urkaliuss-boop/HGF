import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Типы событий
type ToastType = 'success' | 'error' | 'info';

interface ToastEventDetail {
  message: string;
  type: ToastType;
}

// Функция для вызова уведомления из любого места
export const toast = {
  success: (msg: string) => dispatchToast(msg, 'success'),
  error: (msg: string) => dispatchToast(msg, 'error'),
  info: (msg: string) => dispatchToast(msg, 'info'),
};

const dispatchToast = (message: string, type: ToastType) => {
  const event = new CustomEvent('app-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: ToastType }[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const { message, type } = e.detail as ToastEventDetail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, msg: message, type }]);
      
      // Автоудаление через 3 секунды
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[200] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div 
            key={t.id} 
            className="pointer-events-auto bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 flex items-center gap-3 animate-fade-in-up"
        >
            {t.type === 'success' && <CheckCircle className="text-green-500" size={24} />}
            {t.type === 'error' && <AlertCircle className="text-red-500" size={24} />}
            {t.type === 'info' && <Info className="text-blue-500" size={24} />}
            
            <p className="text-sm font-medium flex-1">{t.msg}</p>
            
            <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={16} />
            </button>
        </div>
      ))}
    </div>
  );
}