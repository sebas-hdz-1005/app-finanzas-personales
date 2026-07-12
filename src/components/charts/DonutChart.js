'use client';

import { useState } from 'react';
import { formatCurrency } from '@/utils/format';

/**
 * Donut chart en SVG (sin dependencias). Al pasar el cursor por un segmento,
 * el centro muestra a qué categoría pertenece (nombre, monto y %).
 * @param {object} props
 * @param {Array<{label:string, value:number, color:string}>} props.segments
 * @param {string} [props.centerLabel]
 * @param {number} props.total
 * @param {string} [props.currency]
 */
export function DonutChart({ segments = [], centerLabel = 'TOTAL', total = 0, currency = 'MXN' }) {
  const [hovered, setHovered] = useState(null);
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const sum = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  let cumulative = 0;
  const arcs = segments.map((seg, i) => {
    const fraction = seg.value / sum;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const offset = -cumulative * circumference;
    cumulative += fraction;
    return { ...seg, index: i, fraction, dash, gap, offset };
  });

  const ariaLabel = `Distribución: ${segments
    .map((s) => `${s.label} ${((s.value / sum) * 100).toFixed(0)}%`)
    .join(', ')}`;

  const active = hovered != null ? arcs[hovered] : null;

  return (
    <div className="relative w-56 h-56 md:w-64 md:h-64" role="img" aria-label={ariaLabel}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(20,18,45,0.06)" strokeWidth="12" />
        {arcs.map((a) => {
          const isActive = hovered === a.index;
          const dimmed = hovered != null && !isActive;
          return (
            <circle
              key={a.index}
              cx="50"
              cy="50"
              r={r}
              fill="transparent"
              stroke={a.color}
              strokeWidth={isActive ? 15 : 12}
              strokeDasharray={`${a.dash} ${a.gap}`}
              strokeDashoffset={a.offset}
              opacity={dimmed ? 0.35 : 1}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered(a.index)}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{`${a.label}: ${formatCurrency(a.value, currency)} (${(a.fraction * 100).toFixed(0)}%)`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
        {active ? (
          <>
            <span className="font-label-caps text-[10px] uppercase tracking-wide truncate max-w-full" style={{ color: active.color }}>
              {active.label}
            </span>
            <span className="font-headline-md text-[20px] sm:text-[22px] leading-none text-on-surface tabular-nums">
              {formatCurrency(active.value, currency, { compact: true })}
            </span>
            <span className="font-data-mono text-[12px] text-outline">{(active.fraction * 100).toFixed(1)}%</span>
          </>
        ) : (
          <>
            <span className="font-data-mono text-[10px] text-outline uppercase tracking-widest">{centerLabel}</span>
            <span className="font-headline-lg text-[20px] sm:text-[26px] leading-none text-on-surface tabular-nums">
              {formatCurrency(total, currency, { compact: true })}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
