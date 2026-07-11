'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/common/Icon';
import { NAV_ITEMS } from '@/constants/navigation';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Barra lateral fija (desktop). Oculta en móvil (se usa MobileNav). */
export function SideNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container/60 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col py-6 z-40 pt-24 hidden md:flex">
      <div className="px-6 mb-8">
        <h2 className="font-headline-md text-headline-md text-primary-fixed">{t('nav.commandCenter')}</h2>
        <p className="font-label-caps text-label-caps text-on-surface-variant opacity-70 uppercase tracking-widest">
          {t('nav.eliteTier')}
        </p>
      </div>

      <nav className="flex-1 flex flex-col gap-1" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-4 px-6 py-3 transition-all duration-200 font-label-caps text-label-caps',
                active
                  ? 'bg-primary/10 text-primary-fixed shadow-[inset_0_0_10px_rgba(0,219,231,0.2)] border-r-2 border-primary-fixed'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 hover:translate-x-1',
              )}
            >
              <Icon name={item.icon} />
              <span>{t(`nav.${item.key}`)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <Link
          href="/goals"
          className="block text-center w-full py-4 border border-primary-fixed text-primary-fixed font-label-caps text-label-caps hover:bg-primary/10 transition-colors mb-8 shadow-[0_0_15px_rgba(0,219,231,0.2)] rounded-lg"
        >
          {t('nav.upgradeNode')}
        </Link>
        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <Link
            href="/profile"
            className="flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors font-label-caps text-label-caps"
          >
            <Icon name="person" />
            <span>{t('nav.profile')}</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors font-label-caps text-label-caps"
          >
            <Icon name="help" />
            <span>{t('nav.support')}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
