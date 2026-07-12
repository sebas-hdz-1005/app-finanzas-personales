'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/common/Icon';
import { TOP_NAV_ITEMS } from '@/constants/navigation';
import { APP_NAME } from '@/constants';
import { useAuth } from '@/features/auth/AuthContext';
import { useTranslation } from '@/i18n/LanguageProvider';
import { LanguageSwitch } from './LanguageSwitch';
import { NotificationsBell } from './NotificationsBell';

/** Barra superior fija con logo, navegación, estado y menú de usuario. */
export function TopNav({ alerts = [], onQuickAdd, onOpenMobileMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const displayName = profile?.name || user?.displayName || t('nav.operator');
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-xl border-b border-black/10 shadow-[0_2px_12px_rgba(80,70,160,0.06)]">
      <div className="flex items-center gap-4 md:gap-gutter">
        <button
          type="button"
          className="md:hidden text-on-surface-variant hover:text-primary"
          onClick={onOpenMobileMenu}
          aria-label={t('nav.openMenu')}
        >
          <Icon name="menu" />
        </button>
        <Link
          href="/dashboard"
          className="font-headline-lg text-[19px] sm:text-2xl md:text-headline-lg font-bold text-surface-tint tracking-tight whitespace-nowrap leading-none"
        >
          {APP_NAME}
        </Link>
        <nav className="hidden md:flex gap-8 ml-8" aria-label="Navegación">
          {TOP_NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'font-body-md text-body-md transition-colors duration-200 pb-1',
                  active
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary',
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <span className="hidden lg:block font-body-md text-body-md text-on-surface-variant mr-1">
          {t('nav.greeting', { name: firstName })}
        </span>
        <NotificationsBell alerts={alerts} />
        <button
          type="button"
          onClick={onQuickAdd}
          className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-label-caps text-label-caps font-bold hover:brightness-110 active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <Icon name="add" className="text-[18px]" />
          <span className="hidden sm:inline">{t('common.quickAdd')}</span>
        </button>

        <div className="hidden md:block">
          <LanguageSwitch />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-full border border-primary/30 overflow-hidden bg-surface-container flex items-center justify-center text-primary-fixed font-headline-md hover:border-primary transition-colors"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t('nav.userMenu')}
          >
            {initial}
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 glass-panel-solid rounded-lg border border-black/10 shadow-2xl py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-black/10 mb-1">
                <p className="font-body-md text-on-surface truncate">{displayName}</p>
                <p className="font-data-mono text-[11px] text-outline truncate">{user?.email}</p>
              </div>

              {/* Selector de idioma dentro del menú */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-black/10 mb-1">
                <span className="font-label-caps text-label-caps text-outline uppercase">
                  {t('language.label')}
                </span>
                <LanguageSwitch />
              </div>

              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-black/5 hover:text-primary-fixed font-label-caps text-label-caps"
              >
                <Icon name="person" className="text-[18px]" /> {t('nav.profile')}
              </Link>
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-black/5 hover:text-primary-fixed font-label-caps text-label-caps"
              >
                <Icon name="settings" className="text-[18px]" /> {t('nav.settings')}
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-error/10 font-label-caps text-label-caps"
              >
                <Icon name="logout" className="text-[18px]" /> {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
