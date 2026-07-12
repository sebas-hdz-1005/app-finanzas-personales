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
      color: cat?.color || '#a8a5bd',
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

/** Suma del saldo adeudado de las deudas ligadas a una cuenta. */
export function debtOwedForAccount(accountId, debts = []) {
  if (!accountId) return 0;
  return round2(
    debts
      .filter((d) => d.accountId === accountId)
      .reduce((acc, d) => acc + (Number(d.currentAmount) || 0), 0),
  );
}

/**
 * Saldo disponible de una cuenta descontando la deuda ligada.
 * Para tarjetas de crédito, el saldo del cupo menos lo adeudado.
 */
export function computeAccountAvailable(account, transactions = [], debts = []) {
  const balance = computeAccountBalance(account, transactions);
  const owed = debtOwedForAccount(account.id, debts);
  return round2(balance - owed);
}

/**
 * Patrimonio neto realista: activos (cuentas que NO son de crédito) menos
 * TODAS las deudas. El cupo de las tarjetas no cuenta como dinero propio.
 */
export function computeNetWorthWithDebts(accounts = [], transactions = [], debts = []) {
  const assets = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((acc, a) => acc + computeAccountBalance(a, transactions), 0);
  const totalDebt = debts.reduce((acc, d) => acc + (Number(d.currentAmount) || 0), 0);
  return round2(assets - totalDebt);
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
      categoryColor: cat?.color || '#a8a5bd',
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

/** Meses completos entre `ref` y `date` (>= 0). */
export function monthsUntil(date, ref = new Date()) {
  const t = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(t.getTime())) return 0;
  const months = (t.getFullYear() - ref.getFullYear()) * 12 + (t.getMonth() - ref.getMonth());
  return Math.max(months, 0);
}

/** Devuelve una fecha ISO (YYYY-MM-DD) sumando `n` meses a `ref`. */
export function addMonthsISO(n, ref = new Date()) {
  if (!Number.isFinite(n)) return null;
  const d = new Date(ref.getFullYear(), ref.getMonth() + n, ref.getDate());
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Plan de una meta: cuánto ahorrar por mes para llegar a la fecha objetivo.
 * Si queda menos tiempo (un mes sin ahorrar), `monthlyNeeded` sube solo.
 * @param {object} goal
 * @param {Date} [ref=new Date()]
 */
export function computeGoalPlan(goal, ref = new Date()) {
  const { ratio, percent, remaining } = computeGoalProgress(goal);
  const months = monthsUntil(goal.targetDate, ref);
  let monthlyNeeded;
  if (remaining <= 0) monthlyNeeded = 0;
  else if (months <= 0) monthlyNeeded = remaining; // vencida o este mes → todo lo restante
  else monthlyNeeded = round2(remaining / months);
  return { ratio, percent, remaining, monthsLeft: months, monthlyNeeded, overdue: months <= 0 && remaining > 0 };
}

/**
 * Próxima fecha de pago (ISO) a partir de un día del mes (1-31).
 * Si el día ya pasó este mes, devuelve el del mes siguiente.
 * @param {number} day 1-31
 * @param {Date} [ref=new Date()]
 * @returns {string|null}
 */
export function nextDueDate(day, ref = new Date()) {
  const d = Number(day);
  if (!Number.isFinite(d) || d < 1 || d > 31) return null;
  const pad = (n) => String(n).padStart(2, '0');
  const lastDayOf = (y, m) => new Date(y, m + 1, 0).getDate();
  let year = ref.getFullYear();
  let month = ref.getMonth();
  const dueThisMonth = Math.min(d, lastDayOf(year, month));
  if (ref.getDate() > dueThisMonth) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  const dueDay = Math.min(d, lastDayOf(year, month));
  return `${year}-${pad(month + 1)}-${pad(dueDay)}`;
}

/**
 * Plan de pago de una deuda. Modo preferente: por NÚMERO DE CUOTAS (installments)
 * — deriva la cuota mensual (con o sin interés) y la fecha de liquidación.
 * Retrocompatible: si no hay `installments`, usa `monthlyPayment`.
 * @param {object} debt {initialAmount,currentAmount,installments,monthlyPayment,interestRate,paymentDay}
 * @param {Date} [ref=new Date()]
 */
export function computeDebtPlan(debt, ref = new Date()) {
  const current = Number(debt.currentAmount) || 0;
  const initial = Number(debt.initialAmount) || current || 0;
  const installments = Math.floor(Number(debt.installments) || 0);
  const annualRate = Number(debt.interestRate) || 0; // % anual
  const r = annualRate / 100 / 12; // tasa mensual
  const paid = Math.max(initial - current, 0);
  const progress = initial > 0 ? Math.min(paid / initial, 1) : 0;

  let payment = Number(debt.monthlyPayment) || 0;
  let monthsLeft = 0;
  let feasible = true;
  let totalInterest = 0;

  if (current <= 0) {
    monthsLeft = 0;
    payment = 0;
  } else if (installments > 0) {
    // Modo cuotas: la cuota se deriva del saldo y el número de cuotas.
    monthsLeft = installments;
    if (r > 0) {
      payment = round2((current * r) / (1 - (1 + r) ** -installments));
    } else {
      payment = round2(current / installments);
    }
    totalInterest = round2(payment * installments - current);
  } else if (payment <= 0) {
    feasible = false;
    monthsLeft = Infinity;
  } else if (r > 0) {
    if (payment <= current * r) {
      feasible = false;
      monthsLeft = Infinity;
    } else {
      monthsLeft = Math.ceil(-Math.log(1 - (r * current) / payment) / Math.log(1 + r));
      totalInterest = round2(payment * monthsLeft - current);
    }
  } else {
    monthsLeft = Math.ceil(current / payment);
  }

  const payoffDate = feasible && Number.isFinite(monthsLeft) ? addMonthsISO(monthsLeft, ref) : null;
  return {
    current: round2(current),
    initial: round2(initial),
    payment: round2(payment),
    paid: round2(paid),
    progress: round2(progress),
    percent: round2(progress * 100),
    installments,
    monthsLeft,
    feasible,
    totalInterest,
    payoffDate,
    nextDue: nextDueDate(debt.paymentDay, ref),
  };
}

/**
 * Totales agregados de una lista de deudas.
 * @param {Array<object>} debts
 */
export function computeDebtsSummary(debts = [], ref = new Date()) {
  let totalOwed = 0;
  let totalMonthly = 0;
  let maxMonths = 0;
  for (const d of debts) {
    const plan = computeDebtPlan(d, ref);
    totalOwed += plan.current;
    totalMonthly += plan.payment;
    if (Number.isFinite(plan.monthsLeft)) maxMonths = Math.max(maxMonths, plan.monthsLeft);
  }
  return { totalOwed: round2(totalOwed), totalMonthly: round2(totalMonthly), maxMonths, count: debts.length };
}

/**
 * Comparativa del mes actual vs. el mes anterior.
 * @param {Array<object>} transactions
 * @param {Date} [ref=new Date()]
 */
export function computeMonthlyComparison(transactions = [], ref = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (y, m) => `${y}-${pad(m + 1)}`;
  const curKey = keyOf(ref.getFullYear(), ref.getMonth());
  const prevD = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const prevKey = keyOf(prevD.getFullYear(), prevD.getMonth());

  const blank = () => ({ income: 0, expense: 0 });
  const cur = blank();
  const prev = blank();

  for (const tx of transactions) {
    const key =
      typeof tx.transactionDate === 'string' && /^\d{4}-\d{2}/.test(tx.transactionDate)
        ? tx.transactionDate.slice(0, 7)
        : null;
    const bucket = key === curKey ? cur : key === prevKey ? prev : null;
    if (!bucket) continue;
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') bucket.income += amt;
    else bucket.expense += amt;
  }

  const pct = (now, before) => {
    if (before === 0) return now === 0 ? 0 : 100;
    return round2(((now - before) / Math.abs(before)) * 100);
  };

  const current = {
    monthIndex: ref.getMonth(),
    income: round2(cur.income),
    expense: round2(cur.expense),
    balance: round2(cur.income - cur.expense),
  };
  const previous = {
    monthIndex: prevD.getMonth(),
    income: round2(prev.income),
    expense: round2(prev.expense),
    balance: round2(prev.income - prev.expense),
  };
  return {
    current,
    previous,
    delta: {
      income: pct(current.income, previous.income),
      expense: pct(current.expense, previous.expense),
      balance: pct(current.balance, previous.balance),
    },
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
