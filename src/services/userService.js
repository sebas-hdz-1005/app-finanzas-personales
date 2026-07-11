import { userRepository } from '@/repositories';
import { profileSchema } from '@/validations/finance';
import { sanitizeString } from '@/utils/sanitize';
import { DEFAULT_CURRENCY } from '@/constants';

export const userService = {
  get(userId) {
    return userRepository.get(userId, userId);
  },

  /**
   * Crea (idempotente) el documento de perfil del usuario tras el registro.
   */
  async ensureProfile(userId, { name, email, photoURL = null, currency = DEFAULT_CURRENCY }) {
    const existing = await userRepository.get(userId, userId);
    if (existing) return existing;
    return userRepository.createWithId(userId, userId, {
      name: sanitizeString(name, 80),
      email: sanitizeString(email, 254).toLowerCase(),
      photoURL,
      currency,
    });
  },

  async updateProfile(userId, input) {
    const parsed = profileSchema.parse(input);
    return userRepository.update(userId, userId, {
      name: sanitizeString(parsed.name, 80),
      currency: parsed.currency,
    });
  },
};
