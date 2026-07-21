import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000); // Исчезает через 3 секунды
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-fade-in-up flex items-start gap-3 transition-all
              ${toast.type === 'success' ? 'bg-white/90 dark:bg-[#1c1c1e]/90 border-green-500/30 text-green-600 dark:text-green-400' : ''}
              ${toast.type === 'error' ? 'bg-white/90 dark:bg-[#1c1c1e]/90 border-red-500/30 text-red-600 dark:text-red-400' : ''}
              ${toast.type === 'info' ? 'bg-white/90 dark:bg-[#1c1c1e]/90 border-blue-500/30 text-blue-600 dark:text-blue-400' : ''}
            `}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertTriangle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <p className="flex-1 font-medium text-sm leading-tight text-slate-900 dark:text-white">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
