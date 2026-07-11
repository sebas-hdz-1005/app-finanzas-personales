'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import { emitDataChanged } from '@/hooks/useDataChanged';
import { transactionService } from '@/services';
import { filterTransactions, dateRangeFromPreset } from '@/services/filterService';
import { computeTotals, withRunningBalance, computeNetWorth } from '@/services/financeService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { LedgerTable } from '@/components/tables/LedgerTable';
import { Pagination } from '@/components/tables/Pagination';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/Toast';
import { formatCurrency, formatMonthYear } from '@/utils/format';
import { downloadTransactionsCsv } from '@/utils/csv';

const PAGE_SIZE = 8;

export default function TransactionsPage() {
  const { user, currency } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { data, loading, error, reload } = useFinancialData();

  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    preset: '30d',
    categoryId: 'all',
    customRange: null, // {from, to, label} al llegar con ?from&to
  });
  const [page, setPage] = useState(1);

  // Filtro inicial desde la URL (?category=ID&type=expense&from=..&to=..),
  // p. ej. al llegar desde "Gastos por categoría" del panel.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const type = params.get('type');
    const from = params.get('from');
    const to = params.get('to');
    if (category || type || (from && to)) {
      setFilters((f) => ({
        ...f,
        categoryId: category || f.categoryId,
        type: type === 'income' || type === 'expense' ? type : f.type,
        preset: 'all',
        customRange: from && to ? { from, to, label: from.slice(0, 7) } : null,
      }));
    }
  }, []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categoriesById = useMemo(
    () => new Map(data.categories.map((c) => [c.id, c])),
    [data.categories],
  );

  const filtered = useMemo(() => {
    const range = filters.customRange
      ? { from: filters.customRange.from, to: filters.customRange.to }
      : dateRangeFromPreset(filters.preset);
    return filterTransactions(
      data.transactions,
      { type: filters.type, search: filters.search, categoryId: filters.categoryId, ...range },
      categoriesById,
    );
  }, [data.transactions, filters, categoriesById]);

  const totals = useMemo(() => computeTotals(filtered), [filtered]);
  const netWorth = useMemo(
    () => computeNetWorth(data.accounts, data.transactions),
    [data.accounts, data.transactions],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rowsWithBalance = withRunningBalance(pageRows, netWorth);

  const setFilter = (name, value) => {
    // Cambiar el preset de fecha desactiva el rango del mes (venido de la URL).
    setFilters((f) => ({ ...f, [name]: value, ...(name === 'preset' ? { customRange: null } : {}) }));
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (tx) => {
    setEditing(tx);
    setFormOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await transactionService.update(user.uid, editing.id, formData);
        toast.success(t('toasts.txUpdated'));
      } else {
        await transactionService.create(user.uid, formData);
        toast.success(t('toasts.txCreated'));
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
      await transactionService.remove(user.uid, deleting.id);
      emitDataChanged();
      toast.success(t('toasts.txDeleted'));
      setDeleting(null);
    } catch (err) {
      toast.error(err?.message || t('toasts.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'all', label: t('transactions.allCategories') },
    ...data.categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-gutter">
      <PageHeader
        title={t('transactions.title')}
        subtitle={t('transactions.subtitle')}
        actions={
          <>
            <Button
              variant="ghost"
              icon="download"
              onClick={() => downloadTransactionsCsv(filtered, categoriesById)}
              disabled={filtered.length === 0}
            >
              {t('transactions.exportCsv')}
            </Button>
            <Button icon="add" onClick={openCreate}>
              {t('common.quickAdd')}
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <Card className="md:col-span-3 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <Input
            icon="search"
            placeholder={t('transactions.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="font-data-mono"
            aria-label={t('transactions.searchAria')}
          />
          <div className="flex gap-2">
            <Select
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value)}
              options={[
                { value: 'all', label: t('transactions.typeAll') },
                { value: 'expense', label: t('transactions.typeExpense') },
                { value: 'income', label: t('transactions.typeIncome') },
              ]}
              aria-label={t('transactions.filterType')}
              className="py-2.5"
            />
            <Select
              value={filters.preset}
              onChange={(e) => setFilter('preset', e.target.value)}
              options={[
                { value: '30d', label: t('transactions.preset30d') },
                { value: 'quarter', label: t('transactions.presetQuarter') },
                { value: 'year', label: t('transactions.presetYear') },
                { value: 'all', label: t('transactions.presetAll') },
              ]}
              aria-label={t('transactions.filterDate')}
              className="py-2.5"
            />
          </div>
          <Select
            value={filters.categoryId}
            onChange={(e) => setFilter('categoryId', e.target.value)}
            options={categoryOptions}
            aria-label={t('transactions.filterCategory')}
            className="py-2.5 md:max-w-[200px]"
          />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-label-caps font-label-caps text-outline mb-1">{t('transactions.filteredVolume')}</p>
            <p className="font-data-mono text-headline-md text-primary-fixed">
              {formatCurrency(totals.totalIncome + totals.totalExpense, currency)}
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary-fixed text-headline-lg">monitoring</span>
        </Card>
      </div>

      {/* Chip de mes activo (viene del panel) */}
      {filters.customRange && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-primary/10 text-primary-fixed font-label-caps text-label-caps">
            <Icon name="calendar_month" className="text-[16px]" />
            {t('period.showing', { month: formatMonthYear(filters.customRange.label) })}
            <button
              type="button"
              onClick={() => setFilter('customRange', null)}
              aria-label={t('common.clearFilters')}
              className="hover:text-primary"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </span>
        </div>
      )}

      {/* Tabla */}
      <Card className="p-0 overflow-hidden neon-glow">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title={data.transactions.length === 0 ? t('transactions.emptyTitle') : t('transactions.noResultsTitle')}
            description={
              data.transactions.length === 0
                ? t('transactions.emptyDescNew')
                : t('transactions.emptyDescNoResults')
            }
            action={
              data.transactions.length === 0 ? (
                <Button icon="add" onClick={openCreate}>
                  {t('transactions.registerMovement')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  icon="filter_alt_off"
                  onClick={() => setFilters({ type: 'all', search: '', preset: 'all', categoryId: 'all', customRange: null })}
                >
                  {t('common.clearFilters')}
                </Button>
              )
            }
          />
        ) : (
          <>
            <LedgerTable
              rows={rowsWithBalance}
              categoriesById={categoriesById}
              onEdit={openEdit}
              onDelete={setDeleting}
              currency={currency}
            />
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      {/* Modal crear/editar */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t('transactions.editTransaction') : t('transactions.registerMovement')}
      >
        <TransactionForm
          accounts={data.accounts}
          categories={data.categories}
          initialValues={editing}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={t('transactions.deleteTitle')}
        message={deleting ? t('transactions.deleteMsg', { title: deleting.title }) : ''}
        loading={submitting}
      />
    </div>
  );
}
