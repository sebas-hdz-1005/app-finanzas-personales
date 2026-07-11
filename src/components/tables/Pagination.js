import { cn } from '@/utils/cn';
import { Icon } from '@/components/common/Icon';
import { useTranslation } from '@/i18n/LanguageProvider';

/**
 * Paginación estilo ledger.
 * @param {object} props
 * @param {number} props.page 1-indexed
 * @param {number} props.totalPages
 * @param {(p:number)=>void} props.onChange
 * @param {number} [props.totalItems]
 * @param {number} [props.pageSize]
 */
export function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  const { t } = useTranslation();
  if (totalPages <= 1) {
    return totalItems != null ? (
      <div className="px-6 py-4 bg-surface-container-highest/20 border-t border-white/10">
        <span className="text-label-caps font-label-caps text-outline">
          {totalItems} {totalItems === 1 ? t('common.entry') : t('common.entries')}
        </span>
      </div>
    ) : null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = [];
  const from = Math.max(1, page - 1);
  const to = Math.min(totalPages, from + 2);
  for (let p = from; p <= to; p += 1) pages.push(p);

  const btn = 'px-3 py-1 glass-panel rounded font-data-mono text-data-mono transition-colors';

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between items-center bg-surface-container-highest/20 border-t border-white/10">
      <span className="text-label-caps font-label-caps text-outline">
        {t('common.showing', { start, end, total: totalItems })}
      </span>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className={cn(btn, 'p-2 disabled:opacity-30')}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('common.prevPage')}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(btn, p === page ? 'text-primary-fixed border-primary/50' : 'text-outline hover:text-on-surface')}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className={cn(btn, 'p-2 disabled:opacity-30')}
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t('common.nextPage')}
        >
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
