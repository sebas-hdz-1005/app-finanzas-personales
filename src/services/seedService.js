import {
  categoryRepository,
  accountRepository,
  transactionRepository,
  budgetRepository,
  goalRepository,
  debtRepository,
} from '@/repositories';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/categories';
import { DEFAULT_CURRENCY } from '@/constants';

/** Fecha ISO (YYYY-MM-DD) hace `daysAgo` días. */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * Siembra las categorías base para un usuario. Idempotente por nombre+tipo.
 * @returns {Promise<Map<string,string>>} mapa "tipo:nombre" → categoryId
 */
export async function seedCategories(userId) {
  const existing = await categoryRepository.list(userId);
  const map = new Map(existing.map((c) => [`${c.type}:${c.name}`, c.id]));

  const toCreate = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, type: 'expense' })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, type: 'income' })),
  ];

  for (const cat of toCreate) {
    const key = `${cat.type}:${cat.name}`;
    if (map.has(key)) continue;
    const created = await categoryRepository.create(userId, cat);
    map.set(key, created.id);
  }
  return map;
}

/**
 * Siembra un conjunto completo de datos de demostración (categorías, cuenta,
 * transacciones, presupuestos y una meta). Seguro de re-ejecutar: sólo agrega
 * transacciones de ejemplo si el usuario aún no tiene ninguna.
 * @param {string} userId
 * @param {object} [opts]
 * @param {string} [opts.currency]
 * @returns {Promise<{seeded:boolean}>}
 */
export async function seedUserData(userId, opts = {}) {
  const currency = opts.currency || DEFAULT_CURRENCY;
  const catMap = await seedCategories(userId);

  // Cuenta principal (crear si no existe).
  let accounts = await accountRepository.list(userId);
  let mainAccount = accounts[0];
  if (!mainAccount) {
    mainAccount = await accountRepository.create(userId, {
      name: 'Cuenta Principal',
      type: 'checking',
      initialBalance: 20000,
      currentBalance: 20000,
      currency,
    });
  }

  // Tarjeta de crédito de ejemplo (con cupo), para vincularle la deuda.
  let creditAccount = accounts.find((a) => a.type === 'credit');
  if (!creditAccount) {
    creditAccount = await accountRepository.create(userId, {
      name: 'Tarjeta Nu',
      type: 'credit',
      initialBalance: 20000, // cupo
      currentBalance: 20000,
      currency,
    });
  }

  // Si ya hay transacciones, no duplicar.
  const existingTx = await transactionRepository.list(userId);
  if (existingTx.length > 0) return { seeded: false };

  const cat = (type, name) => catMap.get(`${type}:${name}`);

  const sampleTransactions = [
    { type: 'income', category: ['income', 'Salario'], title: 'Cyber_Corp / Nómina mensual', amount: 40000, status: 'confirmed', date: daysAgo(28) },
    { type: 'expense', category: ['expense', 'Hogar'], title: 'Modernist Loft / Renta', amount: 2274, status: 'confirmed', date: daysAgo(27) },
    { type: 'expense', category: ['expense', 'Alimentación'], title: 'Supermercado Nexus', amount: 8250, status: 'confirmed', date: daysAgo(24) },
    { type: 'expense', category: ['expense', 'Salud'], title: 'Clínica Vitalink', amount: 5000, status: 'pending', date: daysAgo(20) },
    { type: 'expense', category: ['expense', 'Servicios'], title: 'Grid Nexus / Energía', amount: 1550, status: 'confirmed', date: daysAgo(18) },
    { type: 'expense', category: ['expense', 'Transporte'], title: 'HyperLoop / Pase mensual', amount: 850, status: 'confirmed', date: daysAgo(15) },
    { type: 'expense', category: ['expense', 'Entretenimiento'], title: 'Neon Arcade', amount: 420, status: 'confirmed', date: daysAgo(12) },
    { type: 'expense', category: ['expense', 'Alimentación'], title: 'Neon Bistro #04', amount: 425, status: 'confirmed', date: daysAgo(9) },
    { type: 'income', category: ['income', 'Extra'], title: 'Freelance / Consultoría', amount: 3500, status: 'confirmed', date: daysAgo(6) },
    { type: 'expense', category: ['expense', 'Deuda'], title: 'Tarjeta de crédito / Pago', amount: 3936, status: 'confirmed', date: daysAgo(3) },
    { type: 'expense', category: ['expense', 'Otros'], title: 'Suscripciones varias', amount: 260, status: 'confirmed', date: daysAgo(1) },
  ];

  for (const t of sampleTransactions) {
    await transactionRepository.create(userId, {
      accountId: mainAccount.id,
      categoryId: cat(t.category[0], t.category[1]) || null,
      type: t.type,
      title: t.title,
      description: '',
      amount: t.amount,
      status: t.status,
      transactionDate: t.date,
    });
  }

  // Presupuestos de ejemplo.
  const existingBudgets = await budgetRepository.list(userId);
  if (existingBudgets.length === 0) {
    const monthStart = new Date();
    monthStart.setDate(1);
    const start = monthStart.toISOString().slice(0, 10);
    const budgetTargets = [
      ['expense', 'Alimentación', 9000],
      ['expense', 'Hogar', 3000],
      ['expense', 'Entretenimiento', 500],
    ];
    for (const [type, name, limit] of budgetTargets) {
      const categoryId = cat(type, name);
      if (!categoryId) continue;
      await budgetRepository.create(userId, {
        categoryId,
        limitAmount: limit,
        period: 'monthly',
        startDate: start,
        endDate: '',
      });
    }
  }

  // Meta de ahorro de ejemplo.
  const existingGoals = await goalRepository.list(userId);
  if (existingGoals.length === 0) {
    await goalRepository.create(userId, {
      name: 'Fondo de emergencia',
      targetAmount: 60000,
      currentAmount: 17726,
      targetDate: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
      status: 'active',
    });
  }

  // Deuda de ejemplo.
  const existingDebts = await debtRepository.list(userId);
  if (existingDebts.length === 0) {
    await debtRepository.create(userId, {
      name: 'Tarjeta Nu',
      type: 'credit_card',
      accountId: creditAccount.id,
      initialAmount: 15000,
      currentAmount: 13936,
      installments: 8,
      interestRate: 24,
      paymentDay: 15,
    });
  }

  // Recalcular saldo de la cuenta principal.
  const allTx = await transactionRepository.list(userId);
  const delta = allTx.reduce(
    (acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount),
    0,
  );
  await accountRepository.update(userId, mainAccount.id, {
    currentBalance: Math.round((mainAccount.initialBalance + delta) * 100) / 100,
  });

  return { seeded: true };
}

/** Elimina todos los registros de un repositorio para el usuario. */
async function clearRepo(repo, userId) {
  const records = await repo.list(userId);
  await Promise.all(records.map((r) => repo.remove(userId, r.id)));
  return records.length;
}

/** Borra todos los presupuestos del usuario. */
export async function clearBudgets(userId) {
  const count = await clearRepo(budgetRepository, userId);
  return { count };
}

/**
 * Borra TODOS los datos financieros del usuario (no el perfil ni la sesión).
 * @param {string} userId
 */
export async function clearAllData(userId) {
  const repos = [
    transactionRepository,
    budgetRepository,
    goalRepository,
    debtRepository,
    categoryRepository,
    accountRepository,
  ];
  let total = 0;
  for (const repo of repos) {
    // eslint-disable-next-line no-await-in-loop
    total += await clearRepo(repo, userId);
  }
  return { total };
}
