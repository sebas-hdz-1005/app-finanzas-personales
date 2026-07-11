import { goalRepository } from '@/repositories';
import { goalSchema } from '@/validations/finance';
import { sanitizeString } from '@/utils/sanitize';

export const goalService = {
  list(userId) {
    return goalRepository.list(userId, { orderBy: 'createdAt', direction: 'desc' });
  },
  get(userId, id) {
    return goalRepository.get(userId, id);
  },
  async create(userId, input) {
    const parsed = goalSchema.parse(input);
    return goalRepository.create(userId, { ...parsed, name: sanitizeString(parsed.name, 60) });
  },
  async update(userId, id, input) {
    const parsed = goalSchema.parse(input);
    return goalRepository.update(userId, id, { ...parsed, name: sanitizeString(parsed.name, 60) });
  },
  remove(userId, id) {
    return goalRepository.remove(userId, id);
  },
};
