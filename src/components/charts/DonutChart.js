import { formatCurrency } from '@/utils/format';

/**
 * Donut chart en SVG (sin dependencias), como en el diseño del dashboard.
 * @param {object} props
 * @param {Array<{label:string, value:number, color:string}>} props.segments
 * @param {string} [props.centerLabel]
 * @param {number} props.total
 * @param {string} [props.currency]
 */
export function DonutChart({ segments = [], centerLabel = 'TOTAL', total = 0, currency = 'MXN' }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const sum = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = seg.value / sum;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const offset = -cumulative * circumference;
    cumulative += fraction;
    return { ...seg, dash, gap, offset };
  });

  const ariaLabel = `Distribución: ${segments
    .map((s) => `${s.label} ${((s.value / sum) * 100).toFixed(0)}%`)
    .join(', ')}`;

  return (
    <div className="relative w-56 h-56 md:w-64 md:h-64" role="img" aria-label={ariaLabel}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="transparent"
            stroke={a.color}
            strokeWidth="12"
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={a.offset}
            className="transition-all duration-1000"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-data-mono text-[11px] text-outline uppercase tracking-widest">{centerLabel}</span>
        <span className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
          {formatCurrency(total, currency, { compact: true })}
        </span>
      </div>
    </div>
  );
}
