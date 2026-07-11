import {
  computeBudgetDrift,
  computeDebtPlan,
  computeGoalPlan,
  computeMonthlyComparison,
  debtOwedForAccount,
} from './financeService';

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

/**
 * Calcula alertas financieras a partir de los datos del usuario.
 * Devuelve objetos estructurados (sin traducir): la UI traduce con `msgKey`
 * y `values` (los montos se formatean en el componente con la moneda).
 *
 * @param {object} data { accounts, transactions, budgets, goals, debts, categories }
 * @param {Date} [ref=new Date()]
 * @returns {Array<{id:string, severity:'error'|'warning', icon:string, msgKey:string, href:string, values:object}>}
 */
export function computeAlerts(data = {}, ref = new Date()) {
  const {
    accounts = [],
    transactions = [],
    budgets = [],
    goals = [],
    debts = [],
    categories = [],
  } = data;
  const alerts = [];

  // Presupuestos excedidos o cerca del límite.
  for (const b of computeBudgetDrift(budgets, transactions, categories)) {
    if (b.breached) {
      alerts.push({
        id: `budget-over-${b.id}`,
        severity: 'error',
        icon: 'account_balance_wallet',
        msgKey: 'alerts.budgetExceeded',
        href: '/budgets',
        values: { category: b.categoryName, amount: Math.round((b.spent - b.limit) * 100) / 100 },
      });
    } else if (b.percent >= 80) {
      alerts.push({
        id: `budget-near-${b.id}`,
        severity: 'warning',
        icon: 'donut_small',
        msgKey: 'alerts.budgetNear',
        href: '/budgets',
        values: { category: b.categoryName, pct: Math.round(b.percent) },
      });
    }
  }

  // Deudas cuya cuota no cubre el interés.
  for (const debt of debts) {
    const plan = computeDebtPlan(debt, ref);
    if (plan.current > 0 && !plan.feasible) {
      alerts.push({
        id: `debt-infeasible-${debt.id}`,
        severity: 'error',
        icon: 'credit_card',
        msgKey: 'alerts.debtNotFeasible',
        href: '/debts',
        values: { name: debt.name },
      });
    }
  }

  // Metas activas vencidas sin completar.
  for (const goal of goals) {
    if (goal.status !== 'active') continue;
    const plan = computeGoalPlan(goal, ref);
    if (plan.overdue) {
      alerts.push({
        id: `goal-overdue-${goal.id}`,
        severity: 'warning',
        icon: 'flag',
        msgKey: 'alerts.goalOverdue',
        href: '/goals',
        values: { name: goal.name, amount: plan.remaining },
      });
    }
  }

  // Gasto del mes mayor que el ingreso.
  const comp = computeMonthlyComparison(transactions, ref);
  if (comp.current.balance < 0) {
    alerts.push({
      id: 'overspend-month',
      severity: 'warning',
      icon: 'trending_down',
      msgKey: 'alerts.overspend',
      href: '/transactions',
      values: { amount: Math.abs(comp.current.balance) },
    });
  }

  // Tarjetas de crédito con uso alto del cupo (>= 80%).
  for (const acc of accounts) {
    if (acc.type !== 'credit') continue;
    const cupo = Number(acc.initialBalance) || 0;
    const owed = debtOwedForAccount(acc.id, debts);
    if (cupo > 0 && owed >= 0.8 * cupo) {
      alerts.push({
        id: `credit-high-${acc.id}`,
        severity: 'warning',
        icon: 'credit_card',
        msgKey: 'alerts.creditHigh',
        href: '/wallets',
        values: { name: acc.name, pct: Math.round((owed / cupo) * 100) },
      });
    }
  }

  return alerts.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
