'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  accountService,
  categoryService,
  transactionService,
  budgetService,
  goalService,
} from '@/services';
import { useDataChanged } from './useDataChanged';

const EMPTY = { accounts: [], categories: [], transactions: [], budgets: [], goals: [] };

/**
 * Carga los datos financieros del usuario actual con estados de carga/error y
 * refresco reactivo ante cambios (evento global).
 * @returns {{data: typeof EMPTY, loading: boolean, error: Error|null, reload: () => void}}
 */
export function useFinancialData() {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

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
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [accounts, categories, transactions, budgets, goals] = await Promise.all([
        accountService.list(user.uid),
        categoryService.list(user.uid),
        transactionService.list(user.uid),
        budgetService.list(user.uid),
        goalService.list(user.uid),
      ]);
      if (mounted.current) setData({ accounts, categories, transactions, budgets, goals });
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

  return { data, loading, error, reload: load };
}
