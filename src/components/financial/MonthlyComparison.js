'use client';

import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { MoneyText } from './MoneyText';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Flecha + % de cambio, coloreado según si el cambio es bueno o malo. */
function Delta({ value, goodWhenUp }) {
  if (value === 0) {
    return <span className="font-data-mono text-[12px] text-outline">—</span>;
  }
  const up = value > 0;
  const good = goodWhenUp ? up : !up;
  const color = good ? 'text-secondary-fixed' : 'text-error';
  return (
    <span className={`inline-flex items-center gap-0.5 font-data-mono text-[12px] ${color}`}>
      <Icon name={up ? 'arrow_upward' : 'arrow_downward'} className="text-[14px]" />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function Row({ label, value, currency, tone, delta, goodWhenUp }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0 gap-3">
      <span className="font-label-caps text-label-caps text-outline uppercase">{label}</span>
      <div className="flex items-center gap-3 min-w-0">
        <MoneyText value={value} currency={currency} tone={tone} className="text-data-mono whitespace-nowrap" />
        <span className="w-14 text-right shrink-0">
          <Delta value={delta} goodWhenUp={goodWhenUp} />
        </span>
      </div>
    </div>
  );
}

/**
 * Comparativa del mes actual vs. el anterior.
 * @param {{comparison: object, currency: string}} props
 */
export function MonthlyComparison({ comparison, currency }) {
  const { t, months } = useTranslation();
  const { current, previous, delta } = comparison;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h4 className="font-headline-md text-headline-md text-on-surface">{t('comparison.title')}</h4>
          <p className="font-label-caps text-label-caps text-outline uppercase">
            {months[current.monthIndex]} {'vs'} {months[previous.monthIndex]}
          </p>
        </div>
        <Icon name="compare_arrows" className="text-primary-fixed-dim" />
      </div>
      <div>
        <Row label={t('comparison.income')} value={current.income} currency={currency} tone="income" delta={delta.income} goodWhenUp />
        <Row label={t('comparison.expense')} value={current.expense} currency={currency} tone="expense" delta={delta.expense} goodWhenUp={false} />
        <Row label={t('comparison.balance')} value={current.balance} currency={currency} tone="auto" delta={delta.balance} goodWhenUp />
      </div>
    </Card>
  );
}
