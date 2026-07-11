'use client';

import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Indicador de carga. */
export function Spinner({ className, label }) {
  const { t } = useTranslation();
  return (
    <span className={cn('inline-flex items-center gap-2 text-outline', className)} role="status">
      <Icon name="progress_activity" className="animate-spin text-primary-fixed-dim" />
      <span className="font-label-caps text-label-caps">{label ?? t('common.loading')}</span>
    </span>
  );
}

/** Pantalla/contenedor de carga centrado. */
export function LoadingState({ label, className }) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <Icon name="progress_activity" className="animate-spin text-primary-fixed-dim text-4xl" />
      <p className="font-data-mono text-data-mono text-outline uppercase tracking-widest">
        {label ?? t('common.syncing')}
      </p>
    </div>
  );
}
