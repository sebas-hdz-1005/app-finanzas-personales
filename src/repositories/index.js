/**
 * Punto único de acceso a los repositorios. Selecciona el adaptador
 * (firebase | demo) según NEXT_PUBLIC_DATA_BACKEND y expone un repositorio
 * por entidad. Los servicios dependen de esta interfaz, no de la implementación.
 */
import { isFirebaseBackend } from '@/lib/backend';
import { COLLECTIONS } from '@/constants';
import { createDemoRepository } from './demo/createDemoRepository';

let factory;
if (isFirebaseBackend) {
  // Importación diferida para no cargar firebase en modo demo.
  // eslint-disable-next-line global-require
  factory = require('./firebase/createFirebaseRepository').createFirebaseRepository;
} else {
  factory = createDemoRepository;
}

export const userRepository = factory(COLLECTIONS.users);
export const accountRepository = factory(COLLECTIONS.accounts);
export const categoryRepository = factory(COLLECTIONS.categories);
export const transactionRepository = factory(COLLECTIONS.transactions);
export const budgetRepository = factory(COLLECTIONS.budgets);
export const goalRepository = factory(COLLECTIONS.savingGoals);

export const repositories = {
  users: userRepository,
  accounts: accountRepository,
  categories: categoryRepository,
  transactions: transactionRepository,
  budgets: budgetRepository,
  savingGoals: goalRepository,
};
