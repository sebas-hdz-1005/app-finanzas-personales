'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n/LanguageProvider';

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  success: 'border-secondary-fixed/40 text-secondary-fixed',
  error: 'border-error/40 text-error',
  info: 'border-primary-fixed-dim/40 text-primary-fixed',
};

const VARIANT_ICONS = { success: 'check_circle', error: 'error', info: 'info' };

export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message, variant = 'info', timeout = 4000) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (timeout) setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      notify,
      success: (m, t) => notify(m, 'success', t),
      error: (m, t) => notify(m, 'error', t),
      info: (m, t) => notify(m, 'info', t),
      dismiss,
    }),
    [notify, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-16 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'glass-panel-solid border rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg animate-pulse-soft',
              VARIANT_STYLES[item.variant],
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{VARIANT_ICONS[item.variant]}</span>
            <span className="font-body-md text-body-md text-on-surface flex-1">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-outline hover:text-on-surface"
              aria-label={t('toasts.closeNotification')}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
