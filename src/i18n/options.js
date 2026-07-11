/**
 * Constructores de opciones de select con etiquetas traducidas.
 * Reciben la función `t` y devuelven `{ value, label }[]`.
 */

export const accountTypeOptions = (t) =>
  ['checking', 'savings', 'credit', 'cash', 'investment'].map((v) => ({
    value: v,
    label: t(`options.accountType.${v}`),
  }));

export const transactionTypeOptions = (t) =>
  ['expense', 'income'].map((v) => ({ value: v, label: t(`options.txType.${v}`) }));

export const transactionStatusOptions = (t) =>
  ['confirmed', 'pending'].map((v) => ({ value: v, label: t(`options.txStatus.${v}`) }));

export const budgetPeriodOptions = (t) =>
  ['monthly', 'weekly', 'yearly'].map((v) => ({ value: v, label: t(`options.budgetPeriod.${v}`) }));

export const goalStatusOptions = (t) =>
  ['active', 'completed', 'paused'].map((v) => ({ value: v, label: t(`options.goalStatus.${v}`) }));

/** Etiqueta traducida individual. */
export const accountTypeLabel = (t, v) => t(`options.accountType.${v}`);
export const budgetPeriodLabel = (t, v) => t(`options.budgetPeriod.${v}`);
export const goalStatusLabel = (t, v) => t(`options.goalStatus.${v}`);
