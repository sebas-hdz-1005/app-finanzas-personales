'use client';

import { useState } from 'react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { MobileNav, MobileDrawer } from './MobileNav';
import { Footer } from './Footer';
import { GlowBackground } from './GlowBackground';
import { Modal } from '@/components/common/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { transactionService } from '@/services';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { useToast } from '@/components/common/Toast';
import { useTranslation } from '@/i18n/LanguageProvider';

/** Estructura general de la app autenticada (nav + contenido + quick add). */
export function AppShell({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
  const { data } = useFinancialData();
  const [quickOpen, setQuickOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleQuickAdd = async (formData) => {
    setSubmitting(true);
    try {
      await transactionService.create(user.uid, formData);
      emitDataChanged();
      toast.success(t('toasts.txCreated'));
      setQuickOpen(false);
    } catch (err) {
      toast.error(err?.message || t('toasts.txError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <GlowBackground />
      <TopNav onQuickAdd={() => setQuickOpen(true)} onOpenMobileMenu={() => setDrawerOpen(true)} />
      <SideNav />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="md:ml-64 pt-24 pb-24 md:pb-20 px-margin-mobile md:px-gutter min-h-screen">
        <div className="max-w-container-max mx-auto">{children}</div>
      </main>

      <MobileNav />
      <Footer />

      <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title={t('transactions.registerMovement')}>
        <TransactionForm
          accounts={data.accounts}
          categories={data.categories}
          onSubmit={handleQuickAdd}
          onCancel={() => setQuickOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </>
  );
}
