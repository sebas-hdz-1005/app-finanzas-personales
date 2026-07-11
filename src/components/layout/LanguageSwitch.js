'use client';

import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Conmutador de idioma ES / EN (segmentado). */
export function LanguageSwitch({ className }) {
  const { lang, setLang, t } = useTranslation();
  const options = [
    { value: 'es', label: t('language.es') },
    { value: 'en', label: t('language.en') },
  ];

  return (
    <div
      className={cn('inline-flex rounded-lg border border-black/10 bg-black/5 p-0.5', className)}
      role="group"
      aria-label={t('language.label')}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLang(opt.value)}
          aria-pressed={lang === opt.value}
          className={cn(
            'px-2.5 py-1 rounded font-label-caps text-[11px] font-bold uppercase tracking-wider transition-colors',
            lang === opt.value
              ? 'bg-primary-container text-on-primary-container'
              : 'text-outline hover:text-on-surface',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
