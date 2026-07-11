/**
 * Gráfico de área/línea suavizada en SVG (Spending Flux del diseño de Analysis).
 * @param {object} props
 * @param {Array<{label:string, value:number}>} props.points
 * @param {string} [props.color] color del trazo/gradiente
 * @param {string} [props.gradientId]
 * @param {string} [props.emptyLabel]
 */
export function AreaLineChart({ points = [], color = '#7c6cf0', gradientId = 'flux', emptyLabel = '—' }) {
  const width = 600;
  const height = 260;
  const padX = 12;
  const padY = 24;

  if (points.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-outline font-data-mono text-data-mono">
        {emptyLabel}
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const stepX = (width - padX * 2) / Math.max(points.length - 1, 1);
  const coords = points.map((p, i) => {
    const x = padX + i * stepX;
    const y = padY + (height - padY * 2) * (1 - (p.value - min) / range);
    return [x, y];
  });

  // Suavizado tipo Catmull-Rom → Bézier.
  const line = coords
    .map(([x, y], i) => {
      if (i === 0) return `M ${x},${y}`;
      const [px, py] = coords[i - 1];
      const cx = (px + x) / 2;
      return `C ${cx},${py} ${cx},${y} ${x},${y}`;
    })
    .join(' ');

  const area = `${line} L ${coords[coords.length - 1][0]},${height - padY} L ${coords[0][0]},${
    height - padY
  } Z`;

  const ariaLabel = `Tendencia: ${points.map((p) => `${p.label} ${Math.round(p.value)}`).join(', ')}`;

  return (
    <div className="w-full overflow-x-auto scroll-hide" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full min-w-[420px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padY + (height - padY * 2) * f}
            y2={padY + (height - padY * 2) * f}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />

        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        ))}

        {points.map((p, i) => (
          <text
            key={i}
            x={coords[i][0]}
            y={height + 12}
            textAnchor="middle"
            className="fill-outline"
            style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
