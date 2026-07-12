import {
  transactionRepository,
  accountRepository,
} from '@/repositories';
import { transactionSchema } from '@/validations/finance';
import { sanitizeString } from '@/utils/sanitize';
import { computeAccountBalance } from './financeService';

/**
 * Recalcula y persiste el saldo actual de una cuenta a partir de sus transacciones.
 * @param {string} userId
 * @param {string} accountId
 */
async function recalcAccountBalance(userId, accountId) {
  if (!accountId) return;
  const [account, transactions] = await Promise.all([
    accountRepository.get(userId, accountId),
    transactionRepository.list(userId),
  ]);
  if (!account) return;
  const currentBalance = computeAccountBalance(account, transactions);
  await accountRepository.update(userId, accountId, { currentBalance });
}

export const transactionService = {
  list(userId, opts) {
    return transactionRepository.list(userId, { orderBy: 'transactionDate', direction: 'desc', ...opts });
  },

  get(userId, id) {
    return transactionRepository.get(userId, id);
  },

  /**
   * Crea una transacción validada y actualiza el saldo de la cuenta.
   */
  async create(userId, input) {
    const parsed = transactionSchema.parse(input);
    const data = {
      ...parsed,
      title: sanitizeString(parsed.title, 120),
      description: sanitizeString(parsed.description || '', 500),
    };
    const created = await transactionRepository.create(userId, data);
    await recalcAccountBalance(userId, data.accountId);
    return created;
  },

  async update(userId, id, input) {
    const parsed = transactionSchema.parse(input);
    const previous = await transactionRepository.get(userId, id);
    const data = {
      ...parsed,
      title: sanitizeString(parsed.title, 120),
      description: sanitizeString(parsed.description || '', 500),
    };
    const updated = await transactionRepository.update(userId, id, data);
    // Recalcular saldos de la cuenta anterior y la nueva (si cambió).
    await recalcAccountBalance(userId, data.accountId);
    if (previous && previous.accountId && previous.accountId !== data.accountId) {
      await recalcAccountBalance(userId, previous.accountId);
    }
    return updated;
  },

  async remove(userId, id) {
    const previous = await transactionRepository.get(userId, id);
    await transactionRepository.remove(userId, id);
    if (previous?.accountId) await recalcAccountBalance(userId, previous.accountId);
    return { id };
  },

  /** Marca una transacción como pagada (estado confirmado). No cambia el saldo. */
  setStatus(userId, id, status) {
    return transactionRepository.update(userId, id, { status });
  },
};
