'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { budgetPeriodLabel } from '@/i18n/options';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { budgetService, clearBudgets } from '@/services';
import { computeBudgetDrift } from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { ProgressBar } from '@/components/common/ProgressBar';
import { MoneyText } from '@/components/financial/MoneyText';
import { Badge } from '@/components/common/Badge';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/Toast';

export default function BudgetsPage() {
  const { user, currency } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, loading, error, reload } = useFinancialData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const handleClearAll = async () => {
    setSubmitting(true);
    try {
      await clearBudgets(user.uid);
      emitDataChanged();
      toast.success(t('toasts.budgetsCleared'));
      setClearOpen(false);
    } catch (err) {
      toast.error(err?.message || t('toasts.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const drift = useMemo(
    () => computeBudgetDrift(data.budgets, data.transactions, data.categories),
    [data.budgets, data.transactions, data.categories],
  );

  const periodLabel = (p) => budgetPeriodLabel(t, p);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await budgetService.update(user.uid, editing.id, formData);
        toast.success(t('toasts.budgetUpdated'));
      } else {
        await budgetService.create(user.uid, formData);
        toast.success(t('toasts.budgetCreated'));
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
      await budgetService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.budgetDeleted'));
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
        title={t('budgets.title')}
        subtitle={t('budgets.subtitle')}
        actions={
          <>
            {drift.length > 0 && (
              <Button variant="danger" icon="delete_sweep" onClick={() => setClearOpen(true)}>
                {t('budgets.clearAll')}
              </Button>
            )}
            <Button
              icon="add"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              {t('budgets.newBudget')}
            </Button>
          </>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : drift.length === 0 ? (
        <Card>
          <EmptyState
            icon="donut_small"
            title={t('budgets.emptyTitle')}
            description={t('budgets.emptyDesc')}
            action={
              <Button icon="add" onClick={() => setFormOpen(true)}>
                {t('budgets.createBudget')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {drift.map((b) => (
            <Card key={b.id} accent={b.breached ? 'error' : 'none'}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${b.categoryColor}1a` }}
                  >
                    <Icon name={b.categoryIcon} style={{ color: b.categoryColor }} />
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{b.categoryName}</h3>
                    <p className="font-label-caps text-[10px] text-outline uppercase">{periodLabel(b.period)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditing(b); setFormOpen(true); }} className="text-outline hover:text-primary-fixed" aria-label={t('common.edit')}>
                    <Icon name="edit" className="text-[18px]" />
                  </button>
                  <button type="button" onClick={() => setDeleting(b)} className="text-outline hover:text-error" aria-label={t('common.delete')}>
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <MoneyText value={b.spent} currency={currency} tone="expense" className="text-headline-md" />
                <span className="font-data-mono text-data-mono text-outline">
                  / {' '}
                  <MoneyText value={b.limit} currency={currency} tone="neutral" className="text-data-mono" />
                </span>
              </div>
              <ProgressBar value={b.percent} tone={b.breached ? 'error' : b.percent > 80 ? 'cyan' : 'success'} height="h-2" />
              <div className="flex justify-between items-center mt-3">
                <Badge tone={b.breached ? 'error' : 'success'}>{t('budgets.used', { pct: b.percent.toFixed(0) })}</Badge>
                <span className="font-data-mono text-[12px] text-outline">
                  {b.breached ? t('budgets.exceeded') : t('budgets.remaining')}:{' '}
                  <span className={b.breached ? 'text-error' : 'text-secondary-fixed'}>
                    <MoneyText value={Math.abs(b.remaining)} currency={currency} tone={b.breached ? 'expense' : 'income'} className="text-[12px]" />
                  </span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? t('budgets.editBudget') : t('budgets.newBudget')}>
        <BudgetForm categories={data.categories} initialValues={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('budgets.deleteTitle')}
        message={deleting ? t('budgets.deleteMsg', { name: deleting.categoryName }) : ''}
        loading={submitting}
      />

      <ConfirmDialog
        open={clearOpen}
        onCancel={() => setClearOpen(false)}
        onConfirm={handleClearAll}
        title={t('budgets.clearAllTitle')}
        message={t('budgets.clearAllMsg')}
        confirmLabel={t('budgets.clearAll')}
        loading={submitting}
      />
    </div>
  );
}
