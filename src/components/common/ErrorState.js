'use client';

import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { Button } from './Button';
import { useTranslation } from '@/i18n/LanguageProvider';

/**
 * Estado de error reutilizable.
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {() => void} [props.onRetry]
 */
export function ErrorState({ title, description, onRetry, className }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6 gap-3', className)}
    >
      <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center">
        <Icon name="warning" className="text-3xl text-error" />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">{title ?? t('states.errorTitle')}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        {description ?? t('states.errorDesc')}
      </p>
      {onRetry && (
        <Button variant="ghost" icon="refresh" onClick={onRetry} className="mt-2">
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
