import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase/config';

/**
 * Repositorio CRUD sobre una colección de Firestore, aislado por `userId`.
 * El aislamiento se refuerza además con las reglas de seguridad (firestore.rules).
 * @param {string} collectionName
 * @returns {import('../types').Repository}
 */
export function createFirebaseRepository(collectionName) {
  const col = () => collection(getFirebase().db, collectionName);

  const normalize = (snap) => {
    const data = snap.data();
    // Normaliza posibles Timestamp de Firestore a ISO string.
    const out = { id: snap.id, ...data };
    ['createdAt', 'updatedAt'].forEach((k) => {
      if (out[k] && typeof out[k].toDate === 'function') out[k] = out[k].toDate().toISOString();
    });
    return out;
  };

  return {
    async list(userId, { orderBy = 'createdAt', direction = 'desc' } = {}) {
      // Se filtra por userId (índice de campo único, automático) y se ORDENA EN
      // MEMORIA. Así se evita necesitar índices compuestos en Firestore
      // (equality + orderBy sobre otro campo los exigiría). Adecuado para el
      // volumen de datos por usuario de una app de finanzas personales.
      const q = query(col(), where('userId', '==', userId));
      const snap = await getDocs(q);
      const records = snap.docs.map(normalize);
      records.sort((a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av > bv ? 1 : -1;
        return direction === 'asc' ? cmp : -cmp;
      });
      return records;
    },

    async get(userId, id) {
      const ref = doc(getFirebase().db, collectionName, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const record = normalize(snap);
      if (record.userId !== userId) return null;
      return record;
    },

    async create(userId, data) {
      const payload = {
        userId,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const ref = await addDoc(col(), payload);
      return { id: ref.id, userId, ...data };
    },

    async createWithId(userId, id, data) {
      const ref = doc(getFirebase().db, collectionName, id);
      await setDoc(ref, {
        userId,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id, userId, ...data };
    },

    async update(userId, id, patch) {
      const ref = doc(getFirebase().db, collectionName, id);
      await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
      return { id, ...patch };
    },

    async remove(userId, id) {
      await deleteDoc(doc(getFirebase().db, collectionName, id));
      return { id };
    },
  };
}
