import { accountRepository } from '@/repositories';
import { accountSchema } from '@/validations/finance';
import { sanitizeString } from '@/utils/sanitize';

export const accountService = {
  list(userId) {
    return accountRepository.list(userId, { orderBy: 'createdAt', direction: 'asc' });
  },
  get(userId, id) {
    return accountRepository.get(userId, id);
  },
  async create(userId, input) {
    const parsed = accountSchema.parse(input);
    return accountRepository.create(userId, {
      ...parsed,
      name: sanitizeString(parsed.name, 60),
      currentBalance: parsed.initialBalance,
    });
  },
  async update(userId, id, input) {
    const parsed = accountSchema.parse(input);
    return accountRepository.update(userId, id, {
      ...parsed,
      name: sanitizeString(parsed.name, 60),
    });
  },
  remove(userId, id) {
    return accountRepository.remove(userId, id);
  },
};
