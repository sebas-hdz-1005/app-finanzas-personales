'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { useTranslation } from '@/i18n/LanguageProvider';

/**
 * Modal accesible (cierra con Escape / click en overlay, atrapa foco básico).
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {'sm'|'md'|'lg'} [props.size]
 */
export function Modal({ open, onClose, title, children, size = 'md', className }) {
  const ref = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Foco al primer elemento enfocable.
    setTimeout(() => {
      const focusable = ref.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || t('common.close')}
    >
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={ref}
        className={cn(
          'glass-panel-solid relative w-full rounded-xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scroll-hide',
          sizes[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-surface-container/95 backdrop-blur-xl z-10">
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-outline hover:text-primary-fixed transition-colors"
              aria-label={t('common.close')}
            >
              <Icon name="close" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
