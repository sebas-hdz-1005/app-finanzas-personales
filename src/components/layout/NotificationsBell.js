'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common/Icon';
import { useTranslation } from '@/i18n/LanguageProvider';
import { useAuth } from '@/features/auth/AuthContext';
import { formatCurrency } from '@/utils/format';

const SEVERITY = {
  error: { color: 'text-error', bg: 'bg-error/10' },
  warning: { color: 'text-tertiary', bg: 'bg-tertiary/10' },
  info: { color: 'text-primary-fixed', bg: 'bg-primary/10' },
};

/** Campana de notificaciones con panel de alertas. */
export function NotificationsBell({ alerts = [] }) {
  const { t } = useTranslation();
  const { currency } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const count = alerts.length;

  const messageFor = (alert) => {
    const params = { ...alert.values };
    if (params.amount != null) params.amount = formatCurrency(params.amount, currency);
    return t(alert.msgKey, params);
  };

  const go = (href) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center"
        aria-label={t('alerts.bell')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="notifications" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] glass-panel-solid rounded-lg border border-black/10 shadow-2xl py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-black/10 flex items-center justify-between">
            <span className="font-headline-md text-[16px] text-on-surface">{t('alerts.title')}</span>
            {count > 0 && (
              <span className="font-label-caps text-[10px] text-outline uppercase">{t('alerts.count', { n: count })}</span>
            )}
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed/10 flex items-center justify-center">
                <Icon name="check_circle" className="text-secondary-fixed text-2xl" />
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('alerts.empty')}</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto scroll-hide">
              {alerts.map((alert) => {
                const sev = SEVERITY[alert.severity] || SEVERITY.info;
                return (
                  <button
                    key={alert.id}
                    type="button"
                    role="menuitem"
                    onClick={() => go(alert.href)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-black/5 transition-colors"
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sev.bg}`}>
                      <Icon name={alert.icon} className={`${sev.color} text-[18px]`} />
                    </span>
                    <span className="font-body-md text-[14px] text-on-surface-variant leading-snug">
                      {messageFor(alert)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
