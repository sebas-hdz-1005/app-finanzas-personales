import {
  round2,
  signedAmount,
  computeTotals,
  computeCategoryDistribution,
  computeAccountBalance,
  computeNetWorth,
  computeMonthlyFlux,
  computeBudgetDrift,
  computeGoalProgress,
  withRunningBalance,
} from '@/services/financeService';

const categories = [
  { id: 'c1', name: 'Hogar', type: 'expense', icon: 'home', color: '#7c6cf0' },
  { id: 'c2', name: 'Comida', type: 'expense', icon: 'restaurant', color: '#38a97e' },
  { id: 'c3', name: 'Salario', type: 'income', icon: 'payments', color: '#2f9e75' },
];

const txns = [
  { id: 't1', type: 'income', amount: 40000, categoryId: 'c3', accountId: 'a1', status: 'confirmed', transactionDate: '2024-05-01' },
  { id: 't2', type: 'expense', amount: 2000, categoryId: 'c1', accountId: 'a1', status: 'confirmed', transactionDate: '2024-05-02' },
  { id: 't3', type: 'expense', amount: 1000, categoryId: 'c2', accountId: 'a1', status: 'confirmed', transactionDate: '2024-05-03' },
  { id: 't4', type: 'expense', amount: 1000, categoryId: 'c1', accountId: 'a2', status: 'pending', transactionDate: '2024-05-04' },
];

describe('round2', () => {
  it('redondea a 2 decimales sin errores de coma flotante', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(2000 / 3)).toBe(666.67);
    expect(round2(100)).toBe(100);
    expect(round2(1 / 3)).toBe(0.33);
  });
});

describe('signedAmount', () => {
  it('positivo para ingresos, negativo para gastos', () => {
    expect(signedAmount({ type: 'income', amount: 100 })).toBe(100);
    expect(signedAmount({ type: 'expense', amount: 100 })).toBe(-100);
  });
});

describe('computeTotals', () => {
  it('suma ingresos, gastos y disponible', () => {
    const t = computeTotals(txns);
    expect(t.totalIncome).toBe(40000);
    expect(t.totalExpense).toBe(4000);
    expect(t.available).toBe(36000);
    expect(t.count).toBe(4);
  });

  it('maneja lista vacía', () => {
    expect(computeTotals([])).toEqual({ totalIncome: 0, totalExpense: 0, available: 0, count: 0 });
  });
});

describe('computeCategoryDistribution', () => {
  it('agrupa gastos por categoría con porcentajes que suman ~100', () => {
    const dist = computeCategoryDistribution(txns, categories);
    // Hogar = 2000 + 1000 = 3000; Comida = 1000; total gastos = 4000
    const hogar = dist.find((d) => d.categoryId === 'c1');
    const comida = dist.find((d) => d.categoryId === 'c2');
    expect(hogar.amount).toBe(3000);
    expect(hogar.percent).toBe(75);
    expect(comida.percent).toBe(25);
    expect(dist[0].amount).toBeGreaterThanOrEqual(dist[1].amount); // ordenado desc
  });

  it('ignora ingresos', () => {
    const dist = computeCategoryDistribution(txns, categories);
    expect(dist.find((d) => d.categoryId === 'c3')).toBeUndefined();
  });
});

describe('computeAccountBalance / computeNetWorth', () => {
  it('calcula saldo de cuenta desde saldo inicial + movimientos', () => {
    const a1 = { id: 'a1', initialBalance: 0 };
    // a1: +40000 -2000 -1000 = 37000
    expect(computeAccountBalance(a1, txns)).toBe(37000);
  });

  it('suma patrimonio de varias cuentas', () => {
    const accounts = [
      { id: 'a1', initialBalance: 0 },
      { id: 'a2', initialBalance: 500 },
    ];
    // a2: 500 - 1000 = -500 ; total = 37000 + (-500) = 36500
    expect(computeNetWorth(accounts, txns)).toBe(36500);
  });
});

describe('computeMonthlyFlux', () => {
  it('agrupa gastos e ingresos por mes', () => {
    const ref = new Date('2024-05-15');
    const flux = computeMonthlyFlux(txns, 3, ref);
    expect(flux).toHaveLength(3);
    const may = flux[flux.length - 1];
    expect(may.expense).toBe(4000);
    expect(may.income).toBe(40000);
  });
});

describe('computeBudgetDrift', () => {
  it('marca presupuestos superados', () => {
    const budgets = [
      { id: 'b1', categoryId: 'c1', limitAmount: 2500 }, // gastado 3000 → superado
      { id: 'b2', categoryId: 'c2', limitAmount: 5000 }, // gastado 1000 → ok
    ];
    const drift = computeBudgetDrift(budgets, txns, categories);
    const b1 = drift.find((d) => d.id === 'b1');
    const b2 = drift.find((d) => d.id === 'b2');
    expect(b1.spent).toBe(3000);
    expect(b1.breached).toBe(true);
    expect(b1.percent).toBe(120);
    expect(b2.breached).toBe(false);
    expect(b2.remaining).toBe(4000);
  });
});

describe('computeGoalProgress', () => {
  it('calcula ratio, porcentaje y restante (tope 100%)', () => {
    expect(computeGoalProgress({ targetAmount: 1000, currentAmount: 250 })).toEqual({
      ratio: 0.25,
      percent: 25,
      remaining: 750,
    });
    const done = computeGoalProgress({ targetAmount: 1000, currentAmount: 1500 });
    expect(done.percent).toBe(100);
    expect(done.remaining).toBe(0);
  });
});

describe('withRunningBalance', () => {
  it('asigna saldo corriente descendente', () => {
    const rows = withRunningBalance(
      [
        { id: 'x', type: 'expense', amount: 100 },
        { id: 'y', type: 'income', amount: 50 },
      ],
      1000,
    );
    expect(rows[0].balance).toBe(1000);
    expect(rows[1].balance).toBe(1100); // 1000 - (-100)
  });
});
