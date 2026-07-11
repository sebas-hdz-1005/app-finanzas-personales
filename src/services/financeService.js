/**
 * Lógica financiera pura (sin dependencias de UI ni de persistencia).
 * Totalmente testeable. Recibe arreglos de entidades y devuelve derivaciones.
 */

/** Redondea a 2 decimales evitando errores de coma flotante. */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/** Valor con signo de una transacción (positivo ingreso, negativo gasto). */
export function signedAmount(tx) {
  const amt = Number(tx.amount) || 0;
  return tx.type === 'income' ? amt : -amt;
}

/**
 * Totales de ingresos, gastos y disponible.
 * @param {Array<object>} transactions
 * @returns {{ totalIncome: number, totalExpense: number, available: number, count: number }}
 */
export function computeTotals(transactions = []) {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') totalIncome += amt;
    else totalExpense += amt;
  }
  return {
    totalIncome: round2(totalIncome),
    totalExpense: round2(totalExpense),
    available: round2(totalIncome - totalExpense),
    count: transactions.length,
  };
}

/**
 * Distribución de gastos por categoría (para el donut y la tabla).
 * @param {Array<object>} transactions
 * @param {Array<object>} categories
 * @returns {Array<{categoryId:string,name:string,icon:string,color:string,amount:number,percent:number}>}
 */
export function computeCategoryDistribution(transactions = [], categories = []) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map();
  let grandTotal = 0;

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    const amt = Number(tx.amount) || 0;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) || 0) + amt);
    grandTotal += amt;
  }

  const rows = [...totals.entries()].map(([categoryId, amount]) => {
    const cat = byId.get(categoryId);
    return {
      categoryId,
      name: cat?.name || 'Sin categoría',
      icon: cat?.icon || 'more_horiz',
      color: cat?.color || '#849495',
      amount: round2(amount),
      percent: grandTotal > 0 ? round2((amount / grandTotal) * 100) : 0,
    };
  });

  return rows.sort((a, b) => b.amount - a.amount);
}

/**
 * Saldo actual de una cuenta = saldo inicial + movimientos de esa cuenta.
 * @param {object} account
 * @param {Array<object>} transactions
 * @returns {number}
 */
export function computeAccountBalance(account, transactions = []) {
  const initial = Number(account.initialBalance) || 0;
  const delta = transactions
    .filter((tx) => tx.accountId === account.id)
    .reduce((acc, tx) => acc + signedAmount(tx), 0);
  return round2(initial + delta);
}

/**
 * Suma de saldos actuales de todas las cuentas.
 * @param {Array<object>} accounts
 * @param {Array<object>} transactions
 * @returns {number}
 */
export function computeNetWorth(accounts = [], transactions = []) {
  return round2(
    accounts.reduce((acc, a) => acc + computeAccountBalance(a, transactions), 0),
  );
}

/**
 * Flujo mensual (Spending Flux) de los últimos `months` meses.
 * @param {Array<object>} transactions
 * @param {number} [months=6]
 * @param {Date} [refDate=new Date()]
 * @returns {Array<{key:string,label:string,expense:number,income:number}>}
 */
export function computeMonthlyFlux(transactions = [], months = 6, refDate = new Date()) {
  const MONTH_LABELS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const pad = (n) => String(n).padStart(2, '0');
  const buckets = [];
  const index = new Map();

  // Buckets a partir del mes de referencia (año/mes locales, consistentes con las fechas ingresadas).
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth();
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(refYear, refMonth - i, 1);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const bucket = { key, monthIndex: d.getMonth(), label: MONTH_LABELS[d.getMonth()], expense: 0, income: 0 };
    buckets.push(bucket);
    index.set(key, bucket);
  }

  // Clave de mes de la transacción: se toma directamente del string "YYYY-MM-DD"
  // para respetar la fecha elegida por el usuario, sin desfases de zona horaria.
  const monthKeyOf = (value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}/.test(value)) return value.slice(0, 7);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  };

  for (const tx of transactions) {
    const key = monthKeyOf(tx.transactionDate);
    const bucket = key && index.get(key);
    if (!bucket) continue;
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') bucket.income += amt;
    else bucket.expense += amt;
  }

  return buckets.map((b) => ({ ...b, expense: round2(b.expense), income: round2(b.income) }));
}

/**
 * Deriva de presupuesto: cuánto se ha gastado vs el límite por categoría.
 * @param {Array<object>} budgets
 * @param {Array<object>} transactions
 * @param {Array<object>} categories
 * @returns {Array<object>}
 */
export function computeBudgetDrift(budgets = [], transactions = [], categories = []) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return budgets.map((budget) => {
    const spent = transactions
      .filter((tx) => tx.type === 'expense' && tx.categoryId === budget.categoryId)
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    const limit = Number(budget.limitAmount) || 0;
    const ratio = limit > 0 ? spent / limit : 0;
    const cat = byId.get(budget.categoryId);
    return {
      ...budget,
      categoryName: cat?.name || 'Sin categoría',
      categoryColor: cat?.color || '#849495',
      categoryIcon: cat?.icon || 'more_horiz',
      spent: round2(spent),
      limit: round2(limit),
      ratio: round2(ratio),
      percent: round2(ratio * 100),
      remaining: round2(limit - spent),
      breached: spent > limit,
    };
  });
}

/**
 * Progreso de una meta de ahorro (0..1).
 * @param {object} goal
 * @returns {{ratio:number, percent:number, remaining:number}}
 */
export function computeGoalProgress(goal) {
  const target = Number(goal.targetAmount) || 0;
  const current = Number(goal.currentAmount) || 0;
  const ratio = target > 0 ? Math.min(current / target, 1) : 0;
  return {
    ratio: round2(ratio),
    percent: round2(ratio * 100),
    remaining: round2(Math.max(target - current, 0)),
  };
}

/**
 * Añade un saldo corriente (running balance) a una lista de transacciones,
 * ordenadas de más reciente a más antigua (como en el ledger del diseño).
 * @param {Array<object>} transactions ya ordenadas desc por fecha
 * @param {number} startingBalance saldo actual (tope de la lista)
 * @returns {Array<object>} transacciones con campo `balance`
 */
export function withRunningBalance(transactions = [], startingBalance = 0) {
  let balance = startingBalance;
  return transactions.map((tx) => {
    const row = { ...tx, balance: round2(balance) };
    balance -= signedAmount(tx);
    return row;
  });
}
