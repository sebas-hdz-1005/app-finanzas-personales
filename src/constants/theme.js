/**
 * Tokens de color del design system "Cyber-Fiducia" como valores JS,
 * para usarlos en gráficos SVG y lógica (no sólo en clases Tailwind).
 */
export const COLORS = {
  primaryFixedDim: '#7c6cf0', // lavanda (acento principal)
  primaryFixed: '#9b8cf5',
  secondaryFixed: '#38a97e', // menta — crecimiento/positivo
  secondaryFixedDim: '#2f9e75',
  error: '#d76a6a', // rosa — deuda/negativo
  outline: '#a8a5bd',
  onSurface: '#2c2a3d',
  surface: '#ffffff',
  surfaceContainer: '#efedf9',
};

/** Paleta cíclica para categorías/segmentos de gráficos. */
export const CHART_PALETTE = [
  '#7c6cf0', // cyan
  '#38a97e', // lime
  '#e08a8a', // red
  '#9b8cf5', // light cyan
  '#2f9e75', // lime dim
  '#a8a5bd', // outline/gris
  '#f0a878', // tertiary
  '#6d5ce0', // primary container
];

/**
 * Devuelve un color de la paleta por índice (cíclico).
 * @param {number} index
 * @returns {string}
 */
export function paletteColor(index) {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
