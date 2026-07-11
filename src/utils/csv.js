/**
 * Exportación de transacciones a CSV (cliente).
 */

function escapeCsv(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/**
 * Genera y descarga un CSV con las transacciones dadas.
 * @param {Array<object>} transactions
 * @param {Map<string,object>} categoriesById
 */
export function downloadTransactionsCsv(transactions = [], categoriesById) {
  const header = ['Fecha', 'Tipo', 'Categoría', 'Título', 'Monto', 'Estado'];
  const lines = transactions.map((tx) => [
    tx.transactionDate,
    tx.type === 'income' ? 'Ingreso' : 'Gasto',
    categoriesById?.get(tx.categoryId)?.name || 'Sin categoría',
    tx.title,
    tx.type === 'income' ? tx.amount : -tx.amount,
    tx.status,
  ]);

  const csv = [header, ...lines].map((row) => row.map(escapeCsv).join(',')).join('\n');

  if (typeof window === 'undefined') return;
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neon_ledger_transacciones_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
