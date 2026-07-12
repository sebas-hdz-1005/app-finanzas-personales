'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { MoneyText } from './MoneyText';
import { useTranslation } from '@/i18n/LanguageProvider';
import { formatDate } from '@/utils/format';

/**
 * Checklist de gastos pendientes del mes. Al marcar la casilla, el gasto se
 * paga (queda confirmado) vía `onPay(id)`.
 * @param {object} props
 * @param {Array} props.items transacciones pendientes (gastos)
 * @param {Map} props.categoriesById
 * @param {string} props.currency
 * @param {(id:string)=>Promise<void>} props.onPay
 */
export function PendingChecklist({ items = [], categoriesById, currency, onPay }) {
  const { t } = useTranslation();
  const [paying, setPaying] = useState(null);

  const total = items.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

  const pay = async (id) => {
    setPaying(id);
    try {
      await onPay(id);
    } finally {
      setPaying(null);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h4 className="font-headline-md text-headline-md text-on-surface">{t('checklist.title')}</h4>
          <p className="font-label-caps text-label-caps text-outline uppercase">
            {items.length} {items.length === 1 ? t('checklist.item') : t('checklist.items')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-label-caps text-outline uppercase">{t('checklist.pendingTotal')}</p>
          <MoneyText value={total} currency={currency} tone="expense" className="text-headline-md" />
        </div>
      </div>

      <ul className="divide-y divide-black/5">
        {items.map((tx) => {
          const cat = categoriesById?.get(tx.categoryId);
          const busy = paying === tx.id;
          return (
            <li key={tx.id} className="flex items-center gap-3 py-2.5">
              <button
                type="button"
                onClick={() => pay(tx.id)}
                disabled={busy}
                aria-label={t('checklist.markPaid')}
                className="w-6 h-6 rounded-md border-2 border-outline/50 hover:border-secondary-fixed hover:bg-secondary-fixed/10 flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
              >
                {busy ? (
                  <Icon name="progress_activity" className="animate-spin text-[16px] text-outline" />
                ) : (
                  <Icon name="check" className="text-[16px] text-transparent" />
                )}
              </button>
              <span className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                <Icon name={cat?.icon || 'more_horiz'} className="text-on-surface-variant text-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-on-surface font-body-md truncate">{tx.title}</p>
                <p className="text-[11px] text-outline font-data-mono truncate">
                  {cat?.name || t('transactions.noCategory')} · {formatDate(tx.transactionDate)}
                </p>
              </div>
              <MoneyText value={tx.amount} currency={currency} tone="expense" showSign={false} className="text-data-mono shrink-0" />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
