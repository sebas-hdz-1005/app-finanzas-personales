'use client';

import { Icon } from '@/components/common/Icon';
import { formatLedgerTimestamp, formatAmount } from '@/utils/format';
import { useTranslation } from '@/i18n/LanguageProvider';

function StatusCell({ tx, t }) {
  if (tx.type === 'income') {
    return (
      <div className="flex items-center gap-2">
        <span className="status-dot bg-primary-fixed shadow-[0_0_8px_rgba(124,108,240,0.6)]" />
        <span className="text-primary-fixed">{t('transactions.statusIncoming')}</span>
      </div>
    );
  }
  if (tx.status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <span className="status-dot bg-error shadow-[0_0_8px_rgba(215,106,106,0.6)]" />
        <span className="text-error">{t('transactions.statusPending')}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="status-dot bg-secondary-fixed shadow-[0_0_8px_rgba(56,169,126,0.6)]" />
      <span className="text-secondary-fixed">{t('transactions.statusConfirmed')}</span>
    </div>
  );
}

/**
 * Tabla de transacciones estilo "Transaction Ledger".
 * Responsive: tabla en desktop, tarjetas en móvil.
 * @param {object} props
 * @param {Array} props.rows transacciones con `balance`
 * @param {Map<string,object>} props.categoriesById
 * @param {(tx:object)=>void} props.onEdit
 * @param {(tx:object)=>void} props.onDelete
 */
export function LedgerTable({ rows = [], categoriesById, onEdit, onDelete }) {
  const { t } = useTranslation();
  const catOf = (id) => categoriesById?.get(id);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto scroll-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 border-b border-black/10">
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline">{t('transactions.colStatus')}</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline">{t('transactions.colTimestamp')}</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline">{t('transactions.colCategory')}</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline">{t('transactions.colEntity')}</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline text-right">{t('transactions.colAmount')}</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline text-right">{t('transactions.colBalance')}</th>
              <th className="py-4 px-6 font-label-caps text-label-caps text-outline text-right">{t('transactions.colActions')}</th>
            </tr>
          </thead>
          <tbody className="font-data-mono text-data-mono divide-y divide-black/5">
            {rows.map((tx) => {
              const cat = catOf(tx.categoryId);
              return (
                <tr key={tx.id} className="ledger-row group">
                  <td className="py-4 px-6">
                    <StatusCell tx={tx} t={t} />
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">
                    {formatLedgerTimestamp(tx.createdAt || tx.transactionDate)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Icon name={cat?.icon || 'more_horiz'} className="text-primary-fixed-dim text-[20px]" />
                      <span>{cat?.name || t('transactions.noCategory')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 max-w-[240px]">
                    <span className="text-on-surface block truncate">{tx.title}</span>
                    <span className="text-[10px] text-outline opacity-50">TXID: {String(tx.id).slice(0, 8)}</span>
                  </td>
                  <td className={`py-4 px-6 text-right ${tx.type === 'income' ? 'text-secondary-fixed font-bold' : 'text-error'}`}>
                    {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount)}
                  </td>
                  <td className="py-4 px-6 text-right text-on-surface tabular-nums">
                    {formatAmount(tx.balance, { showSign: false })}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onEdit?.(tx)}
                      className="text-outline hover:text-primary-fixed transition-colors mr-3"
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

      {/* Móvil: tarjetas */}
      <div className="md:hidden divide-y divide-black/5">
        {rows.map((tx) => {
          const cat = catOf(tx.categoryId);
          return (
            <div key={tx.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                <Icon name={cat?.icon || 'more_horiz'} className="text-primary-fixed-dim text-[20px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-on-surface font-body-md truncate">{tx.title}</p>
                <p className="text-[11px] text-outline font-data-mono">
                  {cat?.name || t('transactions.noCategory')} · {formatLedgerTimestamp(tx.transactionDate).slice(0, 10)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-data-mono ${tx.type === 'income' ? 'text-secondary-fixed' : 'text-error'}`}>
                  {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount)}
                </p>
                <div className="flex gap-2 justify-end mt-1">
                  <button type="button" onClick={() => onEdit?.(tx)} aria-label={t('common.edit')} className="text-outline">
                    <Icon name="edit" className="text-[16px]" />
                  </button>
                  <button type="button" onClick={() => onDelete?.(tx)} aria-label={t('common.delete')} className="text-outline">
                    <Icon name="delete" className="text-[16px]" />
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
