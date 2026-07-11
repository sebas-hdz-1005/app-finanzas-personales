import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

/**
 * Muestra un monto formateado con color según tono.
 * @param {object} props
 * @param {number} props.value
 * @param {string} [props.currency]
 * @param {'auto'|'income'|'expense'|'neutral'|'cyan'} [props.tone]
 * @param {boolean} [props.showSign]
 */
export function MoneyText({ value, currency = 'MXN', tone = 'neutral', showSign = false, className, compact = false }) {
  let color = 'text-on-surface';
  if (tone === 'income') color = 'text-secondary-fixed';
  else if (tone === 'expense') color = 'text-error';
  else if (tone === 'cyan') color = 'text-primary-fixed';
  else if (tone === 'auto') color = value >= 0 ? 'text-secondary-fixed' : 'text-error';

  return (
    <span className={cn('font-data-mono tabular-nums', color, className)}>
      {formatCurrency(value, currency, { showSign, compact })}
    </span>
  );
}
