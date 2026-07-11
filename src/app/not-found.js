'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageProvider';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="glass-panel rounded-xl p-10 max-w-md">
        <p className="font-data-mono text-data-mono text-error uppercase tracking-widest mb-2">
          {t('states.notFoundCode')}
        </p>
        <h1 className="font-headline-lg text-headline-lg text-primary-fixed mb-4">{t('states.notFoundTitle')}</h1>
        <p className="font-body-md text-on-surface-variant mb-6">{t('states.notFoundDesc')}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2.5 rounded-lg font-label-caps text-label-caps font-bold hover:brightness-110 transition"
        >
          {t('states.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}
