import { readAll, writeAll, generateId } from './store';

/**
 * Crea un repositorio CRUD genérico sobre el almacén demo, aislado por `userId`.
 * @param {string} collection nombre de la colección
 * @returns {import('../types').Repository}
 */
export function createDemoRepository(collection) {
  return {
    async list(userId, { orderBy = 'createdAt', direction = 'desc' } = {}) {
      const records = readAll(collection).filter((r) => r.userId === userId);
      records.sort((a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        if (av === bv) return 0;
        const cmp = av > bv ? 1 : -1;
        return direction === 'asc' ? cmp : -cmp;
      });
      return records;
    },

    async get(userId, id) {
      const record = readAll(collection).find((r) => r.id === id && r.userId === userId);
      return record || null;
    },

    async create(userId, data) {
      const now = new Date().toISOString();
      const record = {
        id: generateId(),
        userId,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const records = readAll(collection);
      records.push(record);
      writeAll(collection, records);
      return record;
    },

    async createWithId(userId, id, data) {
      const now = new Date().toISOString();
      const record = { id, userId, ...data, createdAt: now, updatedAt: now };
      const records = readAll(collection).filter((r) => r.id !== id);
      records.push(record);
      writeAll(collection, records);
      return record;
    },

    async update(userId, id, patch) {
      const records = readAll(collection);
      const idx = records.findIndex((r) => r.id === id && r.userId === userId);
      if (idx === -1) throw new Error('Registro no encontrado');
      const updated = { ...records[idx], ...patch, updatedAt: new Date().toISOString() };
      records[idx] = updated;
      writeAll(collection, records);
      return updated;
    },

    async remove(userId, id) {
      const records = readAll(collection);
      const next = records.filter((r) => !(r.id === id && r.userId === userId));
      writeAll(collection, next);
      return { id };
    },
  };
}
