'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { debtTypeLabel } from '@/i18n/options';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { debtService } from '@/services';
import { computeDebtPlan, computeDebtsSummary } from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DebtForm } from '@/components/forms/DebtForm';
import { ProgressBar } from '@/components/common/ProgressBar';
import { MoneyText } from '@/components/financial/MoneyText';
import { Badge } from '@/components/common/Badge';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/Toast';
import { formatCurrency, formatDate } from '@/utils/format';

const TYPE_ICONS = {
  credit_card: 'credit_card',
  loan: 'account_balance',
  mortgage: 'home',
  personal: 'handshake',
  other: 'request_quote',
};

export default function DebtsPage() {
  const { user, currency } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, loading, error, reload } = useFinancialData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => computeDebtsSummary(data.debts), [data.debts]);
  const accountsById = useMemo(
    () => new Map(data.accounts.map((a) => [a.id, a])),
    [data.accounts],
  );

  const monthsText = (m) => (m === 1 ? t('debts.oneMonth') : t('debts.monthsValue', { months: m }));

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await debtService.update(user.uid, editing.id, formData);
        toast.success(t('toasts.debtUpdated'));
      } else {
        await debtService.create(user.uid, formData);
        toast.success(t('toasts.debtCreated'));
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
      await debtService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.debtDeleted'));
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
        title={t('debts.title')}
        subtitle={t('debts.subtitle')}
        actions={
          <Button icon="add" onClick={() => { setEditing(null); setFormOpen(true); }}>
            {t('debts.newDebt')}
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : data.debts.length === 0 ? (
        <Card>
          <EmptyState
            icon="credit_card"
            title={t('debts.emptyTitle')}
            description={t('debts.emptyDesc')}
            action={<Button icon="add" onClick={() => setFormOpen(true)}>{t('debts.createDebt')}</Button>}
          />
        </Card>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            <Card accent="error" className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label-caps text-label-caps text-outline uppercase">{t('debts.totalOwed')}</p>
                <MoneyText value={summary.totalOwed} currency={currency} tone="expense" className="text-headline-lg break-words" />
              </div>
              <Icon name="trending_down" className="text-error text-4xl opacity-50 shrink-0" />
            </Card>
            <Card className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label-caps text-label-caps text-outline uppercase">{t('debts.totalMonthly')}</p>
                <MoneyText value={summary.totalMonthly} currency={currency} tone="cyan" className="text-headline-lg break-words" />
              </div>
              <Icon name="event_repeat" className="text-primary-fixed text-4xl opacity-50 shrink-0" />
            </Card>
          </div>

          {/* Deudas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {data.debts.map((debt) => {
              const plan = computeDebtPlan(debt);
              const paidOff = plan.current <= 0;
              return (
                <Card key={debt.id} accent={paidOff ? 'success' : plan.feasible ? 'none' : 'error'} className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                        <Icon name={TYPE_ICONS[debt.type] || 'credit_card'} className="text-error" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-headline-md text-headline-md text-on-surface truncate">{debt.name}</h3>
                        <p className="font-label-caps text-[10px] text-outline uppercase truncate">
                          {debtTypeLabel(t, debt.type)}
                          {debt.accountId && accountsById.get(debt.accountId)
                            ? ` · ${accountsById.get(debt.accountId).name}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => { setEditing(debt); setFormOpen(true); }} className="text-outline hover:text-primary-fixed" aria-label={t('common.edit')}>
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button type="button" onClick={() => setDeleting(debt)} className="text-outline hover:text-error" aria-label={t('common.delete')}>
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <MoneyText value={plan.current} currency={currency} tone="expense" className="text-headline-md break-words" />
                    <span className="font-data-mono text-[12px] text-outline shrink-0">
                      {t('debts.paidLabel')} {plan.percent.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar value={plan.percent} tone={paidOff ? 'success' : 'cyan'} height="h-2" />

                  <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <p className="text-[10px] font-label-caps text-outline uppercase">{t('debts.monthlyPayment')}</p>
                      <MoneyText value={plan.payment} currency={currency} tone="neutral" className="text-data-mono" />
                    </div>
                    <div>
                      <p className="text-[10px] font-label-caps text-outline uppercase">{t('debts.monthsLeftLabel')}</p>
                      {paidOff ? (
                        <Badge tone="success">{t('debts.paidOff')}</Badge>
                      ) : plan.feasible ? (
                        <p className="font-data-mono text-on-surface">{monthsText(plan.monthsLeft)}</p>
                      ) : (
                        <Badge tone="error">∞</Badge>
                      )}
                    </div>
                  </div>

                  {!paidOff && plan.feasible && plan.payoffDate && (
                    <p className="mt-3 text-[12px] text-secondary-fixed font-data-mono flex items-center gap-1">
                      <Icon name="event_available" className="text-[15px]" />
                      {t('debts.payoffDate', { date: formatDate(plan.payoffDate) })}
                    </p>
                  )}
                  {!paidOff && plan.feasible && plan.totalInterest > 0 && (
                    <p className="mt-1 text-[11px] text-outline font-data-mono">
                      {t('debts.totalInterest', { amount: formatCurrency(plan.totalInterest, currency) })}
                    </p>
                  )}
                  {!paidOff && !plan.feasible && (
                    <p className="mt-3 text-[12px] text-error flex items-start gap-1">
                      <Icon name="warning" className="text-[15px] shrink-0" />
                      <span>{t('debts.notFeasible')}. {t('debts.notFeasibleHint')}</span>
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? t('debts.editDebt') : t('debts.newDebt')}>
        <DebtForm accounts={data.accounts} initialValues={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('debts.deleteTitle')}
        message={deleting ? t('debts.deleteMsg', { name: deleting.name }) : ''}
        loading={submitting}
      />
    </div>
  );
}
