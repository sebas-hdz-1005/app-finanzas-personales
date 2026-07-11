'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/common/Icon';
import { NAV_ITEMS } from '@/constants/navigation';
import { useTranslation } from '@/i18n/LanguageProvider';
import { LanguageSwitch } from './LanguageSwitch';

/** Barra de navegación inferior (móvil). */
export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const items = NAV_ITEMS.slice(0, 5); // dashboard, analysis, wallets, transactions, budgets

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center h-16"
      aria-label="Navegación móvil"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
              active ? 'text-primary-fixed' : 'text-outline hover:text-on-surface',
            )}
          >
            <Icon name={item.icon} className={cn('text-[22px]', active && 'drop-shadow-[0_0_6px_#00dbe7]')} />
            <span className="text-[9px] font-label-caps uppercase tracking-wide">{t(`nav.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Drawer lateral para navegación completa en móvil. */
export function MobileDrawer({ open, onClose }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] md:hidden">
      <button
        type="button"
        aria-label="Cerrar menú"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-72 bg-surface-container/95 backdrop-blur-2xl border-r border-white/10 py-6 flex flex-col">
        <div className="px-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary-fixed">{t('nav.commandCenter')}</h2>
            <p className="font-label-caps text-label-caps text-outline uppercase">{t('nav.eliteTier')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="text-outline">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-4 px-6 py-3 font-label-caps text-label-caps',
                  active
                    ? 'bg-primary/10 text-primary-fixed border-r-2 border-primary-fixed'
                    : 'text-on-surface-variant hover:bg-white/5',
                )}
              >
                <Icon name={item.icon} />
                <span>{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pt-4 border-t border-white/5">
          <LanguageSwitch />
        </div>
      </div>
    </div>
  );
}
