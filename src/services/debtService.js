import { debtRepository } from '@/repositories';
import { debtSchema } from '@/validations/finance';
import { sanitizeString } from '@/utils/sanitize';

export const debtService = {
  list(userId) {
    return debtRepository.list(userId, { orderBy: 'createdAt', direction: 'desc' });
  },
  get(userId, id) {
    return debtRepository.get(userId, id);
  },
  async create(userId, input) {
    const parsed = debtSchema.parse(input);
    return debtRepository.create(userId, { ...parsed, name: sanitizeString(parsed.name, 60) });
  },
  async update(userId, id, input) {
    const parsed = debtSchema.parse(input);
    return debtRepository.update(userId, id, { ...parsed, name: sanitizeString(parsed.name, 60) });
  },
  remove(userId, id) {
    return debtRepository.remove(userId, id);
  },
};
