import { categoryRepository } from '@/repositories';
import { categorySchema } from '@/validations/finance';
import { sanitizeString } from '@/utils/sanitize';

export const categoryService = {
  list(userId) {
    return categoryRepository.list(userId, { orderBy: 'createdAt', direction: 'asc' });
  },
  get(userId, id) {
    return categoryRepository.get(userId, id);
  },
  async create(userId, input) {
    const parsed = categorySchema.parse(input);
    return categoryRepository.create(userId, { ...parsed, name: sanitizeString(parsed.name, 40) });
  },
  async update(userId, id, input) {
    const parsed = categorySchema.parse(input);
    return categoryRepository.update(userId, id, { ...parsed, name: sanitizeString(parsed.name, 40) });
  },
  remove(userId, id) {
    return categoryRepository.remove(userId, id);
  },
};
