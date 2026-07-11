/**
 * @typedef {Object} Repository
 * @property {(userId: string, opts?: {orderBy?: string, direction?: 'asc'|'desc'}) => Promise<Array<object>>} list
 * @property {(userId: string, id: string) => Promise<object|null>} get
 * @property {(userId: string, data: object) => Promise<object>} create
 * @property {(userId: string, id: string, data: object) => Promise<object>} [createWithId]
 * @property {(userId: string, id: string, patch: object) => Promise<object>} update
 * @property {(userId: string, id: string) => Promise<{id: string}>} remove
 */

export {};
