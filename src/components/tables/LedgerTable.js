'use client';

import { Icon } from '@/components/common/Icon';
import { formatDate, formatAmount } from '@/utils/format';
import { useTranslation } from '@/i18n/LanguageProvider';

function statusMeta(tx, t) {
  if (tx.type === 'income') {
    return { dot: 'bg-secondary-fixed', label: t('transactions.statusIncoming'), color: 'text-secondary-fixed' };
  }
  if (tx.status === 'pending') {
    return { dot: 'bg-tertiary', label: t('transactions.statusPending'), color: 'text-tertiary' };
  }
  return { dot: 'bg-primary-fixed', label: t('transactions.statusConfirmed'), color: 'text-primary-fixed' };
}

/**
 * Tabla de transacciones. Compacta para que quepa en laptops sin scroll
 * horizontal (el saldo corriente sólo se muestra en pantallas muy anchas).
 * Responsive: tabla en escritorio (lg+), tarjetas en móvil/tablet.
 */
export function LedgerTable({ rows = [], categoriesById, onEdit, onDelete }) {
  const { t } = useTranslation();
  const catOf = (id) => categoriesById?.get(id);

  return (
    <>
      {/* Escritorio (lg+) */}
      <div className="hidden lg:block overflow-x-auto scroll-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 border-b border-black/10">
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline">{t('transactions.colStatus')}</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline">{t('transactions.colTimestamp')}</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline">{t('transactions.colCategory')}</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline">{t('transactions.colEntity')}</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline text-right">{t('transactions.colAmount')}</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline text-right hidden 2xl:table-cell">{t('transactions.colBalance')}</th>
              <th className="py-3 px-4 font-label-caps text-label-caps text-outline text-right w-[80px]">{t('transactions.colActions')}</th>
            </tr>
          </thead>
          <tbody className="font-data-mono text-data-mono divide-y divide-black/5">
            {rows.map((tx) => {
              const cat = catOf(tx.categoryId);
              const s = statusMeta(tx, t);
              return (
                <tr key={tx.id} className="ledger-row group">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-2">
                      <span className={`status-dot ${s.dot}`} />
                      <span className={`${s.color} text-[11px]`}>{s.label}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap text-[13px]">
                    {formatDate(tx.transactionDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-2 max-w-[150px]">
                      <Icon name={cat?.icon || 'more_horiz'} className="text-primary-fixed-dim text-[18px] shrink-0" />
                      <span className="truncate">{cat?.name || t('transactions.noCategory')}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-[220px]">
                    <span className="text-on-surface block truncate">{tx.title}</span>
                  </td>
                  <td className={`py-3 px-4 text-right whitespace-nowrap ${tx.type === 'income' ? 'text-secondary-fixed font-bold' : 'text-error'}`}>
                    {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-right text-on-surface tabular-nums whitespace-nowrap hidden 2xl:table-cell">
                    {formatAmount(tx.balance, { showSign: false })}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onEdit?.(tx)}
                      className="text-outline hover:text-primary-fixed transition-colors mr-2"
                      aria-label={`${t('common.edit')} ${tx.title}`}
                    >
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(tx)}
                      className="text-outline hover:text-error transition-colors"
                      aria-label={`${t('common.delete')} ${tx.title}`}
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil / tablet: tarjetas */}
      <div className="lg:hidden divide-y divide-black/5">
        {rows.map((tx) => {
          const cat = catOf(tx.categoryId);
          const s = statusMeta(tx, t);
          return (
            <div key={tx.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                <Icon name={cat?.icon || 'more_horiz'} className="text-primary-fixed-dim text-[20px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-on-surface font-body-md truncate">{tx.title}</p>
                <p className="text-[11px] text-outline font-data-mono flex items-center gap-1.5 truncate">
                  <span className={`status-dot ${s.dot}`} />
                  <span className="truncate">
                    {cat?.name || t('transactions.noCategory')} · {formatDate(tx.transactionDate)}
                  </span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-data-mono whitespace-nowrap ${tx.type === 'income' ? 'text-secondary-fixed' : 'text-error'}`}>
                  {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount)}
                </p>
                <div className="flex gap-3 justify-end mt-1">
                  <button type="button" onClick={() => onEdit?.(tx)} aria-label={t('common.edit')} className="text-outline">
                    <Icon name="edit" className="text-[17px]" />
                  </button>
                  <button type="button" onClick={() => onDelete?.(tx)} aria-label={t('common.delete')} className="text-outline">
                    <Icon name="delete" className="text-[17px]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
