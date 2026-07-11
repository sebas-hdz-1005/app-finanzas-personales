'use client';

import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { useTranslation } from '@/i18n/LanguageProvider';
import { formatMonthYear, monthKey } from '@/utils/format';

/**
 * Navegador de mes: ◀ Mes Año ▶ + conmutador "Todo el tiempo".
 * @param {object} props
 * @param {string|null} props.value  'YYYY-MM' o null (todo el tiempo)
 * @param {(next: string|null) => void} props.onChange
 */
export function MonthNavigator({ value, onChange, className }) {
  const { t } = useTranslation();
  const currentKey = monthKey(new Date());
  const isAll = value == null;
  const atCurrent = value === currentKey;

  const shift = (delta) => {
    if (isAll) return;
    const [y, m] = value.split('-').map(Number);
    onChange(monthKey(new Date(y, m - 1 + delta, 1)));
  };

  const btn = 'w-8 h-8 flex items-center justify-center rounded-md text-on-surface-variant hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 glass-panel-solid rounded-lg border border-black/10 p-1',
        className,
      )}
    >
      <button type="button" className={btn} onClick={() => shift(-1)} disabled={isAll} aria-label={t('period.prevMonth')}>
        <Icon name="chevron_left" className="text-[20px]" />
      </button>
      <span className="min-w-[130px] text-center font-label-caps text-label-caps text-on-surface px-1 select-none">
        {isAll ? t('period.allTime') : formatMonthYear(value)}
      </span>
      <button type="button" className={btn} onClick={() => shift(1)} disabled={isAll || atCurrent} aria-label={t('period.nextMonth')}>
        <Icon name="chevron_right" className="text-[20px]" />
      </button>
      <span className="w-px h-5 bg-black/10 mx-1" />
      <button
        type="button"
        onClick={() => onChange(isAll ? currentKey : null)}
        className="px-3 h-8 rounded-md font-label-caps text-label-caps text-primary-fixed hover:bg-primary/10 transition-colors"
      >
        {isAll ? t('period.byMonth') : t('period.all')}
      </button>
    </div>
  );
}
