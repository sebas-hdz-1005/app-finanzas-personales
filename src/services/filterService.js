/**
 * Filtrado y búsqueda de transacciones (puro).
 */

/**
 * @param {Array<object>} transactions
 * @param {object} filters
 * @param {'all'|'income'|'expense'} [filters.type]
 * @param {string} [filters.search] texto (título/descr)
 * @param {string} [filters.categoryId]
 * @param {'all'|'confirmed'|'pending'} [filters.status]
 * @param {string} [filters.from] ISO date
 * @param {string} [filters.to] ISO date
 * @param {Map<string,object>} [categoriesById] para buscar por nombre de categoría
 * @returns {Array<object>}
 */
export function filterTransactions(transactions = [], filters = {}, categoriesById) {
  const {
    type = 'all',
    search = '',
    categoryId = 'all',
    status = 'all',
    from,
    to,
  } = filters;
  const term = search.trim().toLowerCase();

  return transactions.filter((tx) => {
    if (type !== 'all' && tx.type !== type) return false;
    if (categoryId !== 'all' && tx.categoryId !== categoryId) return false;
    if (status !== 'all' && tx.status !== status) return false;

    if (from && tx.transactionDate < from) return false;
    if (to && tx.transactionDate > to) return false;

    if (term) {
      const catName = categoriesById?.get(tx.categoryId)?.name?.toLowerCase() || '';
      const haystack = `${tx.title || ''} ${tx.description || ''} ${catName} ${tx.id}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

/**
 * Rango de fechas para presets ("30d", "quarter", "year").
 * @param {'all'|'30d'|'quarter'|'year'} preset
 * @param {Date} [ref=new Date()]
 * @returns {{from?: string, to?: string}}
 */
export function dateRangeFromPreset(preset, ref = new Date()) {
  // Cálculo en UTC para que sea determinista independiente de la zona horaria.
  const toISO = (d) => d.toISOString().slice(0, 10);
  const to = toISO(ref);
  switch (preset) {
    case '30d': {
      const from = new Date(ref.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: toISO(from), to };
    }
    case 'quarter': {
      const from = new Date(ref);
      from.setUTCMonth(from.getUTCMonth() - 3);
      return { from: toISO(from), to };
    }
    case 'year': {
      const from = new Date(Date.UTC(ref.getUTCFullYear(), 0, 1));
      return { from: toISO(from), to };
    }
    default:
      return {};
  }
}
