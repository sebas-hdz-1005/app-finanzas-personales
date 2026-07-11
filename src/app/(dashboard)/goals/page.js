'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { goalStatusLabel } from '@/i18n/options';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { goalService } from '@/services';
import { computeGoalPlan } from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { GoalForm } from '@/components/forms/GoalForm';
import { ProgressBar } from '@/components/common/ProgressBar';
import { MoneyText } from '@/components/financial/MoneyText';
import { Badge } from '@/components/common/Badge';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/Toast';
import { formatDate, formatCurrency } from '@/utils/format';

const STATUS_TONE = { active: 'cyan', completed: 'success', paused: 'neutral' };

export default function GoalsPage() {
  const { user, currency } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, loading, error, reload } = useFinancialData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      // Auto-completar estado si se alcanzó la meta.
      const payload = { ...formData };
      if (Number(payload.currentAmount) >= Number(payload.targetAmount) && payload.status === 'active') {
        payload.status = 'completed';
      }
      if (editing) {
        await goalService.update(user.uid, editing.id, payload);
        toast.success(t('toasts.goalUpdated'));
      } else {
        await goalService.create(user.uid, payload);
        toast.success(t('toasts.goalCreated'));
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
      await goalService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.goalDeleted'));
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
        title={t('goals.title')}
        subtitle={t('goals.subtitle')}
        actions={
          <Button
            icon="add"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {t('goals.newGoal')}
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : data.goals.length === 0 ? (
        <Card>
          <EmptyState
            icon="flag"
            title={t('goals.emptyTitle')}
            description={t('goals.emptyDesc')}
            action={
              <Button icon="add" onClick={() => setFormOpen(true)}>
                {t('goals.createGoal')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {data.goals.map((goal) => {
            const p = computeGoalPlan(goal);
            const showPlan = goal.status === 'active' && p.remaining > 0;
            return (
              <Card key={goal.id} accent={goal.status === 'completed' ? 'success' : 'none'} className="flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <Badge tone={STATUS_TONE[goal.status]}>{goalStatusLabel(t, goal.status)}</Badge>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setEditing(goal); setFormOpen(true); }} className="text-outline hover:text-primary-fixed" aria-label={t('common.edit')}>
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                    <button type="button" onClick={() => setDeleting(goal)} className="text-outline hover:text-error" aria-label={t('common.delete')}>
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </div>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{goal.name}</h3>
                <p className="font-label-caps text-[10px] text-outline uppercase mb-4">
                  {t('goals.objective', { date: formatDate(goal.targetDate) })}
                </p>

                <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                  <MoneyText value={goal.currentAmount} currency={currency} tone="cyan" className="text-headline-md break-words" />
                  <span className="font-data-mono text-outline text-data-mono">
                    / <MoneyText value={goal.targetAmount} currency={currency} tone="neutral" className="text-data-mono" />
                  </span>
                </div>
                <ProgressBar value={p.percent} tone={goal.status === 'completed' ? 'success' : 'cyan'} height="h-2" />
                <div className="flex justify-between items-center pt-3 gap-2 flex-wrap">
                  <span className="font-data-mono text-data-mono text-primary-fixed">{p.percent.toFixed(0)}%</span>
                  <span className="font-data-mono text-[12px] text-outline">
                    {t('goals.remaining', { amount: formatCurrency(p.remaining, currency) })}
                  </span>
                </div>

                {/* Plan de ahorro mensual */}
                {showPlan && (
                  <div className="mt-4 pt-3 border-t border-black/5">
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                      <Icon name="savings" className="text-primary-fixed text-[18px] shrink-0" />
                      <span className="font-data-mono text-[13px] text-primary-fixed break-words">
                        {p.overdue
                          ? t('goals.overdue', { amount: formatCurrency(p.monthlyNeeded, currency) })
                          : t('goals.monthlySaving', { amount: formatCurrency(p.monthlyNeeded, currency) })}
                      </span>
                    </div>
                    {!p.overdue && p.monthsLeft > 0 && (
                      <p className="text-[11px] text-outline mt-1 font-data-mono">
                        {t('goals.monthsLeft', { months: p.monthsLeft })}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? t('goals.editGoal') : t('goals.newGoal')}>
        <GoalForm initialValues={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} submitting={submitting} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('goals.deleteTitle')}
        message={deleting ? t('goals.deleteMsg', { name: deleting.name }) : ''}
        loading={submitting}
      />
    </div>
  );
}
