import { cn } from '@/utils/cn';

const TONES = {
  cyan: { bar: 'bg-primary-fixed-dim', glow: 'shadow-[0_0_10px_#00dbe7]' },
  success: { bar: 'bg-secondary-fixed', glow: 'shadow-[0_0_10px_#c3f400]' },
  error: { bar: 'bg-error', glow: 'shadow-[0_0_10px_#ffb4ab]' },
};

/**
 * Barra de progreso con glow (usada en metas, presupuestos, "Budget Drift").
 * @param {object} props
 * @param {number} props.value 0..100
 * @param {'cyan'|'success'|'error'} [props.tone]
 */
export function ProgressBar({ value = 0, tone = 'cyan', className, height = 'h-1' }) {
  const pct = Math.max(0, Math.min(100, value));
  const t = TONES[tone] || TONES.cyan;
  return (
    <div
      className={cn('w-full bg-white/5 rounded-pill overflow-hidden', height, className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn('h-full rounded-pill transition-all duration-700', t.bar, t.glow)} style={{ width: `${pct}%` }} />
    </div>
  );
}
