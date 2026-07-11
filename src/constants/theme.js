/**
 * Tokens de color del design system "Cyber-Fiducia" como valores JS,
 * para usarlos en gráficos SVG y lógica (no sólo en clases Tailwind).
 */
export const COLORS = {
  primaryFixedDim: '#00dbe7', // cyan neón
  primaryFixed: '#74f5ff',
  secondaryFixed: '#c3f400', // lime — crecimiento/positivo
  secondaryFixedDim: '#abd600',
  error: '#ffb4ab', // rojo — deuda/negativo
  outline: '#849495',
  onSurface: '#dee2f6',
  surface: '#0e1321',
  surfaceContainer: '#1a1f2e',
};

/** Paleta cíclica para categorías/segmentos de gráficos. */
export const CHART_PALETTE = [
  '#00dbe7', // cyan
  '#c3f400', // lime
  '#ffb4ab', // red
  '#74f5ff', // light cyan
  '#abd600', // lime dim
  '#849495', // outline/gris
  '#ffb3ac', // tertiary
  '#00f2ff', // primary container
];

/**
 * Devuelve un color de la paleta por índice (cíclico).
 * @param {number} index
 * @returns {string}
 */
export function paletteColor(index) {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
