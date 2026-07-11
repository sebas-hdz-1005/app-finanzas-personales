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

/** Paleta cíclica para categorías/segmentos de gráficos (hues distintos, legibles en claro). */
export const CHART_PALETTE = [
  '#7c6cf0', // lavanda
  '#2fae9e', // teal
  '#e0728c', // rosa
  '#e0a53f', // ámbar
  '#4aa3e0', // azul cielo
  '#e07a5f', // coral
  '#9b6dd6', // púrpura
  '#59b85f', // verde
  '#e06fb0', // magenta
  '#5c6bc0', // índigo
  '#d98b3a', // naranja
  '#26a5b8', // cian
  '#c05f8f', // malva
  '#8aa15c', // oliva
  '#38a97e', // menta
  '#7c8aa5', // pizarra
];

/**
 * Devuelve un color de la paleta por índice (cíclico).
 * @param {number} index
 * @returns {string}
 */
export function paletteColor(index) {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
