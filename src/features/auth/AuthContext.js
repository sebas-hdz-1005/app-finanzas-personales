'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authAdapter, mapAuthError } from '@/lib/auth';
import { userService } from '@/services/userService';
import { seedUserData } from '@/services/seedService';
import { DEFAULT_CURRENCY } from '@/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const p = await userService.get(currentUser.uid);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsub = authAdapter.onAuthChange(async (u) => {
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });
    return () => (typeof unsub === 'function' ? unsub() : undefined);
  }, [loadProfile]);

  const login = useCallback(
    async (email, password) => {
      try {
        const u = await authAdapter.signIn(email, password);
        await loadProfile(u);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: mapAuthError(error) };
      }
    },
    [loadProfile],
  );

  const register = useCallback(async (name, email, password) => {
    try {
      const u = await authAdapter.signUp(name, email, password);
      // Perfil + datos base (categorías + cuenta) para un onboarding usable.
      await userService.ensureProfile(u.uid, {
        name,
        email,
        photoURL: u.photoURL,
        currency: DEFAULT_CURRENCY,
      });
      await seedUserData(u.uid, { currency: DEFAULT_CURRENCY });
      await loadProfile(u);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapAuthError(error) };
    }
  }, [loadProfile]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const u = await authAdapter.signInWithGoogle();
      // Perfil + datos base en el primer ingreso (idempotente para usuarios existentes).
      await userService.ensureProfile(u.uid, {
        name: u.displayName || 'Usuario',
        email: u.email || '',
        photoURL: u.photoURL,
        currency: DEFAULT_CURRENCY,
      });
      await seedUserData(u.uid, { currency: DEFAULT_CURRENCY });
      await loadProfile(u);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapAuthError(error) };
    }
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await authAdapter.signOutUser();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await authAdapter.sendReset(email);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapAuthError(error) };
    }
  }, []);

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      currency: profile?.currency || DEFAULT_CURRENCY,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      refreshProfile,
    }),
    [user, profile, loading, login, loginWithGoogle, register, logout, resetPassword, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
