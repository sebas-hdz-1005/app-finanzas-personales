import { cn } from '@/utils/cn';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { formatCurrency } from '@/utils/format';

const TONES = {
  error: { accent: 'error', light: 'bg-error shadow-[0_0_8px_#e08a8a]', value: 'text-error', icon: 'text-error' },
  success: {
    accent: 'success',
    light: 'bg-secondary-fixed-dim shadow-[0_0_8px_#2f9e75]',
    value: 'text-secondary-fixed-dim',
    icon: 'text-secondary-fixed-dim',
  },
  income: {
    accent: 'none',
    light: 'bg-secondary-fixed shadow-[0_0_8px_#38a97e]',
    value: 'text-secondary-fixed',
    icon: 'text-secondary-fixed',
  },
  cyan: {
    accent: 'cyan',
    light: 'bg-primary-fixed-dim shadow-[0_0_8px_#7c6cf0]',
    value: 'text-primary-fixed',
    icon: 'text-primary-fixed',
  },
};

/**
 * Tarjeta KPI del dashboard (Costos / Ingresos / Disponible).
 * @param {object} props
 * @param {string} props.label
 * @param {number} props.value
 * @param {string} props.currency
 * @param {'error'|'success'|'income'|'cyan'} props.tone
 * @param {string} props.icon
 * @param {Array<{label:string, value:string}>} [props.breakdown]
 * @param {React.ReactNode} [props.children]
 */
export function StatCard({ label, value, currency, tone = 'cyan', icon, breakdown, children }) {
  const t = TONES[tone] || TONES.cyan;
  return (
    <Card accent={t.accent} status={t.light} className="overflow-hidden">
      <div className="flex justify-between items-start mb-4 pl-4">
        <span className="font-label-caps text-label-caps text-outline uppercase">{label}</span>
        <Icon name={icon} className={t.icon} />
      </div>
      <h3 className={cn('font-display-lg text-display-lg mb-2 tabular-nums break-words', t.value)}>
        {formatCurrency(value, currency, { compact: Math.abs(value) >= 100000 })}
      </h3>
      {breakdown && (
        <div className="flex gap-4 border-t border-black/5 pt-4 mt-4">
          {breakdown.map((b) => (
            <div key={b.label} className="flex-1 min-w-0">
              <p className="text-[10px] font-label-caps text-outline uppercase">{b.label}</p>
              <p className="font-data-mono text-data-mono text-on-surface truncate">{b.value}</p>
            </div>
          ))}
        </div>
      )}
      {children}
    </Card>
  );
}

/** Nodo de dato compacto (fila inferior del dashboard). */
export function DataNode({ icon, label, value, tone = 'cyan' }) {
  const iconBg = {
    cyan: 'bg-primary/10 text-primary-fixed',
    success: 'bg-secondary-fixed/10 text-secondary-fixed',
    error: 'bg-error/10 text-error',
    neutral: 'bg-surface-variant text-on-surface-variant',
  }[tone];
  return (
    <Card className="p-4 flex gap-4 items-center">
      <div className={cn('w-10 h-10 flex items-center justify-center rounded-lg', iconBg)}>
        <Icon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-outline font-label-caps uppercase truncate">{label}</p>
        <p className="font-data-mono text-on-surface truncate">{value}</p>
      </div>
    </Card>
  );
}
