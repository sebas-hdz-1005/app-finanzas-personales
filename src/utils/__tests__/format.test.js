import {
  formatCurrency,
  formatAmount,
  formatDate,
  formatLedgerTimestamp,
  formatPercent,
  monthKey,
} from '@/utils/format';

describe('formatCurrency', () => {
  it('formatea positivos y negativos', () => {
    expect(formatCurrency(1000, 'MXN')).toContain('1,000');
    expect(formatCurrency(-50, 'MXN').startsWith('-')).toBe(true);
  });
  it('añade signo + cuando showSign', () => {
    expect(formatCurrency(10, 'MXN', { showSign: true }).startsWith('+')).toBe(true);
  });
  it('maneja valores no finitos como 0', () => {
    expect(formatCurrency(NaN, 'MXN')).toContain('0');
    expect(formatCurrency(Infinity, 'MXN')).toContain('0');
  });
  it('usa notación compacta', () => {
    expect(formatCurrency(22200, 'MXN', { compact: true })).toMatch(/22/);
  });
});

describe('formatAmount', () => {
  it('muestra signo por defecto', () => {
    expect(formatAmount(40000)).toBe('+40,000.00');
    expect(formatAmount(-2274)).toBe('-2,274.00');
  });
  it('puede ocultar el signo', () => {
    expect(formatAmount(1000, { showSign: false })).toBe('1,000.00');
  });
});

describe('formatDate / formatLedgerTimestamp', () => {
  it('formatea una fecha ISO', () => {
    expect(formatDate('2024-05-12')).toMatch(/2024/);
  });
  it('devuelve marcador para fechas inválidas', () => {
    expect(formatDate('no-fecha')).toBe('—');
  });
  it('formatea timestamp estilo ledger', () => {
    const ts = formatLedgerTimestamp('2024-05-12T14:44:02');
    expect(ts).toBe('2024.05.12 14:44:02');
  });
});

describe('formatPercent', () => {
  it('convierte ratio a porcentaje', () => {
    expect(formatPercent(0.25)).toBe('25.0%');
  });
  it('acepta porcentaje directo', () => {
    expect(formatPercent(75, { isRatio: false, decimals: 0 })).toBe('75%');
  });
});

describe('monthKey', () => {
  it('devuelve YYYY-MM', () => {
    expect(monthKey('2024-03-09')).toBe('2024-03');
  });
});
