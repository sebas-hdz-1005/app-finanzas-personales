import { computeAlerts } from '@/services/alertService';

const ref = new Date('2024-05-15');

const base = {
  categories: [
    { id: 'c1', name: 'Comida', type: 'expense' },
    { id: 'c2', name: 'Hogar', type: 'expense' },
  ],
  transactions: [
    { type: 'expense', amount: 1500, categoryId: 'c1', transactionDate: '2024-05-02' },
    { type: 'expense', amount: 500, categoryId: 'c1', transactionDate: '2024-05-04' },
    { type: 'expense', amount: 900, categoryId: 'c2', transactionDate: '2024-05-03' },
    { type: 'income', amount: 100, categoryId: 'c1', transactionDate: '2024-05-05' },
  ],
  budgets: [
    { id: 'b1', categoryId: 'c1', limitAmount: 1000 }, // gastado 2000 → excedido
    { id: 'b2', categoryId: 'c2', limitAmount: 1000 }, // gastado 900 → 90%
  ],
  debts: [
    { id: 'd1', name: 'Nu', accountId: 'card', currentAmount: 10000, initialAmount: 10000, monthlyPayment: 150, interestRate: 24 },
  ],
  accounts: [{ id: 'card', type: 'credit', name: 'Nu', initialBalance: 10000 }],
  goals: [
    { id: 'g1', name: 'Viaje', status: 'active', targetAmount: 1000, currentAmount: 200, targetDate: '2024-04-01' },
  ],
};

describe('computeAlerts', () => {
  it('genera las alertas esperadas y ordena errores primero', () => {
    const alerts = computeAlerts(base, ref);
    const keys = alerts.map((a) => a.msgKey);

    expect(keys).toContain('alerts.budgetExceeded');
    expect(keys).toContain('alerts.budgetNear');
    expect(keys).toContain('alerts.debtNotFeasible');
    expect(keys).toContain('alerts.goalOverdue');
    expect(keys).toContain('alerts.overspend');
    expect(keys).toContain('alerts.creditHigh');

    // Los errores van antes que las advertencias.
    const severities = alerts.map((a) => a.severity);
    const firstWarning = severities.indexOf('warning');
    const lastError = severities.lastIndexOf('error');
    expect(lastError).toBeLessThan(firstWarning);
  });

  it('sin problemas no devuelve alertas', () => {
    const clean = {
      categories: [{ id: 'c1', name: 'Comida', type: 'expense' }],
      transactions: [{ type: 'income', amount: 1000, categoryId: 'c1', transactionDate: '2024-05-02' }],
      budgets: [],
      debts: [],
      accounts: [{ id: 'a1', type: 'checking', initialBalance: 500 }],
      goals: [],
    };
    expect(computeAlerts(clean, ref)).toEqual([]);
  });

  it('maneja datos vacíos', () => {
    expect(computeAlerts({}, ref)).toEqual([]);
  });
});
