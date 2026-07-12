'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  accountService,
  categoryService,
  transactionService,
  budgetService,
  goalService,
  debtService,
} from '@/services';
import { useDataChanged } from '@/hooks/useDataChanged';

const EMPTY = { accounts: [], categories: [], transactions: [], budgets: [], goals: [], debts: [] };

const FinancialDataContext = createContext({
  data: EMPTY,
  loading: true,
  error: null,
  reload: () => {},
});

/**
 * Fuente ÚNICA de datos financieros para toda la sesión autenticada.
 * Lee las colecciones **una sola vez** al montar (o al cambiar de usuario) y
 * vuelve a leer sólo cuando los datos cambian (mutaciones) o se pide `reload`.
 * Como vive en el layout autenticado, persiste entre navegaciones: cambiar de
 * página NO dispara nuevas lecturas. Esto reduce drásticamente las lecturas de
 * Firestore respecto a que cada página cargara sus propios datos.
 */
export function FinancialDataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const firstLoadDone = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      setData(EMPTY);
      setLoading(false);
      firstLoadDone.current = false;
      return;
    }
    // Sólo mostramos "cargando" en la primera carga; los refrescos posteriores
    // (tras una mutación) actualizan en silencio sin parpadeo.
    if (!firstLoadDone.current) setLoading(true);
    setError(null);
    try {
      const [accounts, categories, transactions, budgets, goals, debts] = await Promise.all([
        accountService.list(user.uid),
        categoryService.list(user.uid),
        transactionService.list(user.uid),
        budgetService.list(user.uid),
        goalService.list(user.uid),
        debtService.list(user.uid),
      ]);
      if (mounted.current) {
        setData({ accounts, categories, transactions, budgets, goals, debts });
        firstLoadDone.current = true;
      }
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err : new Error('Error al cargar'));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useDataChanged(load);

  const value = useMemo(() => ({ data, loading, error, reload: load }), [data, loading, error, load]);

  return <FinancialDataContext.Provider value={value}>{children}</FinancialDataContext.Provider>;
}

/**
 * Lee los datos financieros de la caché compartida.
 * Misma API que antes: { data, loading, error, reload }.
 */
export function useFinancialData() {
  return useContext(FinancialDataContext);
}
