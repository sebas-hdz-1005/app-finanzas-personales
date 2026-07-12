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
  computeGoalPlan,
  computeDebtPlan,
  computeDebtsSummary,
  nextDueDate,
  computeMonthlyComparison,
  debtOwedForAccount,
  computeAccountAvailable,
  computeNetWorthWithDebts,
  monthsUntil,
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

describe('monthsUntil / computeGoalPlan', () => {
  it('cuenta meses hasta la fecha objetivo', () => {
    expect(monthsUntil('2024-08-01', new Date('2024-05-01'))).toBe(3);
    expect(monthsUntil('2024-01-01', new Date('2024-05-01'))).toBe(0); // pasada → 0
  });

  it('calcula el ahorro mensual necesario', () => {
    const ref = new Date('2024-05-01');
    const plan = computeGoalPlan(
      { targetAmount: 1200, currentAmount: 200, targetDate: '2024-09-01' },
      ref,
    );
    // remaining 1000, 4 meses → 250/mes
    expect(plan.remaining).toBe(1000);
    expect(plan.monthsLeft).toBe(4);
    expect(plan.monthlyNeeded).toBe(250);
  });

  it('si la meta venció y falta dinero, pide todo lo restante', () => {
    const ref = new Date('2024-10-01');
    const plan = computeGoalPlan(
      { targetAmount: 1000, currentAmount: 400, targetDate: '2024-09-01' },
      ref,
    );
    expect(plan.overdue).toBe(true);
    expect(plan.monthlyNeeded).toBe(600);
  });
});

describe('computeDebtPlan', () => {
  it('sin interés: meses = deuda / cuota (redondeo arriba)', () => {
    const plan = computeDebtPlan({ initialAmount: 1000, currentAmount: 1000, monthlyPayment: 300 });
    expect(plan.monthsLeft).toBe(4); // ceil(1000/300)
    expect(plan.feasible).toBe(true);
    expect(plan.payoffDate).toBeTruthy();
  });

  it('calcula progreso a partir de lo ya pagado', () => {
    const plan = computeDebtPlan({ initialAmount: 1000, currentAmount: 250, monthlyPayment: 250 });
    expect(plan.paid).toBe(750);
    expect(plan.percent).toBe(75);
  });

  it('con interés: cuota que no cubre el interés → no factible', () => {
    // deuda 10000, 2% mensual → interés 200; cuota 150 < 200
    const plan = computeDebtPlan({
      initialAmount: 10000,
      currentAmount: 10000,
      monthlyPayment: 150,
      interestRate: 24, // 24% anual = 2% mensual
    });
    expect(plan.feasible).toBe(false);
    expect(plan.monthsLeft).toBe(Infinity);
  });

  it('con interés factible: interés total positivo', () => {
    const plan = computeDebtPlan({
      initialAmount: 10000,
      currentAmount: 10000,
      monthlyPayment: 1000,
      interestRate: 12,
    });
    expect(plan.feasible).toBe(true);
    expect(plan.monthsLeft).toBeGreaterThan(10);
    expect(plan.totalInterest).toBeGreaterThan(0);
  });

  it('por cuotas (sin interés): cuota = saldo / cuotas, meses = cuotas', () => {
    const plan = computeDebtPlan({ initialAmount: 12000, currentAmount: 12000, installments: 12 });
    expect(plan.payment).toBe(1000);
    expect(plan.monthsLeft).toBe(12);
    expect(plan.feasible).toBe(true);
    expect(plan.installments).toBe(12);
  });

  it('por cuotas con interés: cuota mayor que saldo/cuotas', () => {
    const plan = computeDebtPlan({ initialAmount: 12000, currentAmount: 12000, installments: 12, interestRate: 24 });
    expect(plan.payment).toBeGreaterThan(1000);
    expect(plan.monthsLeft).toBe(12);
    expect(plan.totalInterest).toBeGreaterThan(0);
  });

  it('nextDueDate devuelve el próximo día de pago', () => {
    expect(nextDueDate(15, new Date('2024-05-10'))).toBe('2024-05-15'); // aún no pasa
    expect(nextDueDate(15, new Date('2024-05-20'))).toBe('2024-06-15'); // ya pasó → mes siguiente
    expect(nextDueDate(31, new Date('2024-02-10'))).toBe('2024-02-29'); // se ajusta a fin de mes
    expect(nextDueDate(null)).toBeNull();
  });

  it('summary agrega deuda total y cuota total', () => {
    const s = computeDebtsSummary([
      { initialAmount: 1000, currentAmount: 1000, monthlyPayment: 200 },
      { initialAmount: 500, currentAmount: 300, monthlyPayment: 100 },
    ]);
    expect(s.totalOwed).toBe(1300);
    expect(s.totalMonthly).toBe(300);
    expect(s.count).toBe(2);
  });
});

describe('deudas ligadas a cuentas', () => {
  const debts = [
    { id: 'd1', accountId: 'a1', currentAmount: 7000000 },
    { id: 'd2', accountId: 'a1', currentAmount: 1000000 },
    { id: 'd3', currentAmount: 500000 }, // sin cuenta
  ];

  it('debtOwedForAccount suma sólo las deudas de esa cuenta', () => {
    expect(debtOwedForAccount('a1', debts)).toBe(8000000);
    expect(debtOwedForAccount('a2', debts)).toBe(0);
    expect(debtOwedForAccount('', debts)).toBe(0);
  });

  it('computeAccountAvailable resta la deuda al cupo', () => {
    const card = { id: 'a1', type: 'credit', initialBalance: 10000000 };
    // cupo 10M − deuda 8M = 2M disponible
    expect(computeAccountAvailable(card, [], debts)).toBe(2000000);
  });

  it('net worth excluye el cupo de tarjetas y resta todas las deudas', () => {
    const accounts = [
      { id: 'chk', type: 'checking', initialBalance: 3000000 },
      { id: 'a1', type: 'credit', initialBalance: 10000000 },
    ];
    // activos = 3M (checking); crédito excluido. Deudas = 8.5M → neto -5.5M
    expect(computeNetWorthWithDebts(accounts, [], debts)).toBe(-5500000);
  });
});

describe('computeMonthlyComparison', () => {
  it('compara mes actual vs anterior con % de cambio', () => {
    const ref = new Date('2024-05-15');
    const txs = [
      { type: 'income', amount: 1000, transactionDate: '2024-05-03' },
      { type: 'expense', amount: 400, transactionDate: '2024-05-10' },
      { type: 'income', amount: 800, transactionDate: '2024-04-05' },
      { type: 'expense', amount: 200, transactionDate: '2024-04-20' },
    ];
    const c = computeMonthlyComparison(txs, ref);
    expect(c.current.income).toBe(1000);
    expect(c.current.expense).toBe(400);
    expect(c.previous.income).toBe(800);
    expect(c.delta.income).toBe(25); // (1000-800)/800
    expect(c.delta.expense).toBe(100); // (400-200)/200
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
