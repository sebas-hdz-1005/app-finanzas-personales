'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import { useTranslation } from '@/i18n/LanguageProvider';

/**
 * Diálogo de confirmación (usado antes de eliminar). Cumple RF-12.
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onCancel
 * @param {() => void} props.onConfirm
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {string} [props.confirmLabel]
 * @param {boolean} [props.loading]
 * @param {'danger'|'primary'} [props.tone]
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel,
  loading = false,
  tone = 'danger',
}) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={
            tone === 'danger'
              ? 'w-14 h-14 rounded-full bg-error/10 border border-error/30 flex items-center justify-center'
              : 'w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center'
          }
        >
          <Icon
            name={tone === 'danger' ? 'delete' : 'help'}
            className={tone === 'danger' ? 'text-error text-2xl' : 'text-primary-fixed text-2xl'}
          />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">{title || t('common.confirmDeleteDefault')}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {message || t('common.confirmDeleteDefault')}
        </p>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel || t('common.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
