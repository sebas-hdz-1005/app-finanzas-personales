export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Cuenta corriente' },
  { value: 'savings', label: 'Ahorros' },
  { value: 'credit', label: 'Tarjeta de crédito' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'investment', label: 'Inversión' },
];

export const TRANSACTION_TYPES = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
];

export const TRANSACTION_STATUSES = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendiente' },
];

export const BUDGET_PERIODS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
];

export const GOAL_STATUSES = [
  { value: 'active', label: 'Activa' },
  { value: 'completed', label: 'Completada' },
  { value: 'paused', label: 'Pausada' },
];

export const CURRENCIES = [
  { value: 'MXN', label: 'Peso mexicano (MXN)' },
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'COP', label: 'Peso colombiano (COP)' },
  { value: 'ARS', label: 'Peso argentino (ARS)' },
];

export const DEFAULT_CURRENCY = 'MXN';

/** Nombre de colecciones (Firestore) / almacenes (demo). */
export const COLLECTIONS = {
  users: 'users',
  accounts: 'accounts',
  categories: 'categories',
  transactions: 'transactions',
  budgets: 'budgets',
  savingGoals: 'savingGoals',
};
