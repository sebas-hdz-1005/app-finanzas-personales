'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { accountTypeLabel } from '@/i18n/options';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { accountService } from '@/services';
import { computeAccountBalance, computeNetWorth } from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AccountForm } from '@/components/forms/AccountForm';
import { MoneyText } from '@/components/financial/MoneyText';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/Toast';

const TYPE_ICONS = {
  checking: 'account_balance',
  savings: 'savings',
  credit: 'credit_card',
  cash: 'payments',
  investment: 'trending_up',
};

export default function WalletsPage() {
  const { user, currency } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, loading, error, reload } = useFinancialData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const netWorth = useMemo(
    () => computeNetWorth(data.accounts, data.transactions),
    [data.accounts, data.transactions],
  );
  const txCountByAccount = useMemo(() => {
    const map = new Map();
    for (const tx of data.transactions) map.set(tx.accountId, (map.get(tx.accountId) || 0) + 1);
    return map;
  }, [data.transactions]);

  const typeLabel = (value) => accountTypeLabel(t, value);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await accountService.update(user.uid, editing.id, formData);
        toast.success(t('toasts.accountUpdated'));
      } else {
        await accountService.create(user.uid, formData);
        toast.success(t('toasts.accountCreated'));
      }
      emitDataChanged();
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err?.message || t('toasts.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await accountService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.accountDeleted'));
      setDeleting(null);
    } catch (err) {
      toast.error(err?.message || t('toasts.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-gutter">
      <PageHeader
        title={t('wallets.title')}
        subtitle={t('wallets.subtitle')}
        actions={
          <Button
            icon="add"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {t('wallets.newAccount')}
          </Button>
        }
      />

      <Card accent="cyan" className="flex items-center justify-between">
        <div>
          <p className="font-label-caps text-label-caps text-outline uppercase">{t('wallets.netWorth')}</p>
          <MoneyText value={netWorth} currency={currency} tone="cyan" className="text-display-lg" />
        </div>
        <Icon name="account_balance_wallet" className="text-primary-fixed text-5xl opacity-50" />
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : data.accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon="account_balance_wallet"
            title={t('wallets.emptyTitle')}
            description={t('wallets.emptyDesc')}
            action={
              <Button icon="add" onClick={() => setFormOpen(true)}>
                {t('wallets.createAccount')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {data.accounts.map((acc) => {
            const balance = computeAccountBalance(acc, data.transactions);
            return (
              <Card key={acc.id} className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name={TYPE_ICONS[acc.type] || 'account_balance'} className="text-primary-fixed" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(acc);
                        setFormOpen(true);
                      }}
                      className="text-outline hover:text-primary-fixed"
                      aria-label={`${t('common.edit')} ${acc.name}`}
                    >
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(acc)}
                      className="text-outline hover:text-error"
                      aria-label={`${t('common.delete')} ${acc.name}`}
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{acc.name}</h3>
                <p className="font-label-caps text-label-caps text-outline uppercase mb-4">
                  {typeLabel(acc.type)} · {acc.currency}
                </p>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <p className="text-[10px] font-label-caps text-outline uppercase">{t('wallets.currentBalance')}</p>
                  <MoneyText value={balance} currency={acc.currency} tone="auto" className="text-headline-md" />
                  <p className="text-[11px] text-outline mt-1 font-data-mono">
                    {t('wallets.movementsCount', { count: txCountByAccount.get(acc.id) || 0 })}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('wallets.editAccount') : t('wallets.newAccount')}
      >
        <AccountForm
          initialValues={editing}
          defaultCurrency={currency}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('wallets.deleteTitle')}
        message={deleting ? t('wallets.deleteMsg', { name: deleting.name }) : ''}
        loading={submitting}
      />
    </div>
  );
}
