import { budgetRepository } from '@/repositories';
import { budgetSchema } from '@/validations/finance';

export const budgetService = {
  list(userId) {
    return budgetRepository.list(userId, { orderBy: 'createdAt', direction: 'desc' });
  },
  get(userId, id) {
    return budgetRepository.get(userId, id);
  },
  async create(userId, input) {
    const parsed = budgetSchema.parse(input);
    return budgetRepository.create(userId, parsed);
  },
  async update(userId, id, input) {
    const parsed = budgetSchema.parse(input);
    return budgetRepository.update(userId, id, parsed);
  },
  remove(userId, id) {
    return budgetRepository.remove(userId, id);
  },
};
