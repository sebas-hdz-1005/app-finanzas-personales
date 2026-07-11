'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useTranslation } from '@/i18n/LanguageProvider';
import {
  computeTotals,
  computeCategoryDistribution,
  computeMonthlyFlux,
  computeMonthlyComparison,
  computeDebtsSummary,
} from '@/services/financeService';
import { Card } from '@/components/common/Card';
import { StatCard, DataNode } from '@/components/financial/StatCard';
import { MonthlyComparison } from '@/components/financial/MonthlyComparison';
import { MoneyText } from '@/components/financial/MoneyText';
import { DonutChart } from '@/components/charts/DonutChart';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { LoadingState } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/format';

export default function DashboardPage() {
  const { currency, profile, user } = useAuth();
  const { t, months } = useTranslation();
  const router = useRouter();
  const { data, loading, error, reload } = useFinancialData();
  const firstName = (profile?.name || user?.displayName || t('nav.operator')).split(' ')[0];

  const model = useMemo(() => {
    const totals = computeTotals(data.transactions);
    const distribution = computeCategoryDistribution(data.transactions, data.categories);
    const flux = computeMonthlyFlux(data.transactions, 4);
    const fixedIncome = data.transactions
      .filter((tx) => tx.type === 'income' && tx.status === 'confirmed')
      .reduce((a, tx) => a + tx.amount, 0);
    const comparison = computeMonthlyComparison(data.transactions);
    const debts = computeDebtsSummary(data.debts);
    return { totals, distribution, flux, fixedIncome, comparison, debts };
  }, [data]);

  if (loading) return <LoadingState label={t('dashboard.syncing')} />;
  if (error) return <ErrorState onRetry={reload} />;

  const hasData = data.transactions.length > 0;
  const { totals, distribution, flux } = model;
  const topCategories = distribution.slice(0, 5);
  const savingsRate =
    totals.totalIncome > 0 ? Math.round((totals.available / totals.totalIncome) * 100) : 0;

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            {t('dashboard.greeting', { name: firstName })}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <StatCard
          label={t('dashboard.costsTotal')}
          value={totals.totalExpense}
          currency={currency}
          tone="error"
          icon="trending_up"
          breakdown={[
            { label: t('dashboard.movements'), value: `${data.transactions.filter((tx) => tx.type === 'expense').length}` },
            { label: t('dashboard.categories'), value: `${distribution.length}` },
          ]}
        />
        <StatCard
          label={t('dashboard.incomeTotal')}
          value={totals.totalIncome}
          currency={currency}
          tone="income"
          icon="payments"
          breakdown={[
            { label: t('dashboard.confirmed'), value: formatCurrency(model.fixedIncome, currency, { compact: true }) },
            { label: t('dashboard.movements'), value: `${data.transactions.filter((tx) => tx.type === 'income').length}` },
          ]}
        />
        <StatCard
          label={t('dashboard.available')}
          value={totals.available}
          currency={currency}
          tone="success"
          icon="verified"
        >
          <div className="mt-4 p-3 bg-secondary-fixed/10 border border-secondary-fixed/20 rounded-lg">
            <p className="font-body-md text-body-md text-secondary-fixed">
              {t('dashboard.savingsRate', { rate: savingsRate })}
            </p>
            <div className="w-full bg-black/5 h-1 mt-2 rounded-pill overflow-hidden">
              <div
                className="bg-secondary-fixed h-full shadow-[0_0_10px_#38a97e]"
                style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
              />
            </div>
          </div>
        </StatCard>
      </div>

      {!hasData ? (
        <Card>
          <EmptyState
            icon="rocket_launch"
            title={t('dashboard.emptyTitle')}
            description={t('dashboard.emptyDesc')}
            action={
              <Link href="/settings">
                <Button icon="database">{t('dashboard.loadDemo')}</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Comparativa mensual + resumen de deuda */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2">
              <MonthlyComparison comparison={model.comparison} currency={currency} />
            </div>
            <Card accent={model.debts.totalOwed > 0 ? 'error' : 'none'} className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-caps text-label-caps text-outline uppercase">{t('debts.totalOwed')}</p>
                  <MoneyText
                    value={model.debts.totalOwed}
                    currency={currency}
                    tone={model.debts.totalOwed > 0 ? 'expense' : 'neutral'}
                    className="text-headline-lg break-words"
                  />
                </div>
                <Icon name="credit_card" className="text-error opacity-50" />
              </div>
              <Link href="/debts" className="mt-4">
                <Button variant="outline" size="sm" icon="visibility" fullWidth>
                  {t('common.viewAll')}
                </Button>
              </Link>
            </Card>
          </div>

          {/* Donut + tablas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <Card className="lg:col-span-4 flex flex-col items-center justify-center min-h-[400px]">
              <h4 className="font-headline-md text-headline-md text-on-surface self-start mb-6">
                {t('dashboard.expensePercent')}
              </h4>
              {distribution.length > 0 ? (
                <>
                  <DonutChart
                    segments={distribution.map((d) => ({ label: d.name, value: d.amount, color: d.color }))}
                    total={totals.totalExpense}
                    currency={currency}
                  />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-8 w-full">
                    {distribution.slice(0, 6).map((d) => (
                      <div key={d.categoryId} className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color, boxShadow: `0 0 5px ${d.color}` }} />
                        <span className="text-[10px] font-label-caps text-outline uppercase truncate">
                          {d.name} ({d.percent.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState icon="donut_small" title={t('dashboard.noExpensesTitle')} description={t('dashboard.noExpensesDesc')} />
              )}
            </Card>

            <div className="lg:col-span-8 flex flex-col gap-gutter">
              <Card className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-headline-md text-headline-md text-on-surface">{t('dashboard.expenseByCategory')}</h4>
                  <Link href="/transactions">
                    <Button variant="outline" size="sm" icon="filter_list">
                      {t('common.viewAll')}
                    </Button>
                  </Link>
                </div>
                <div className="overflow-x-auto scroll-hide">
                  <table className="w-full text-left">
                    <thead className="border-b border-black/10">
                      <tr>
                        <th className="py-3 font-label-caps text-label-caps text-outline">{t('dashboard.category')}</th>
                        <th className="py-3 font-label-caps text-label-caps text-outline text-right">%</th>
                        <th className="py-3 font-label-caps text-label-caps text-outline text-right">{t('dashboard.amount')}</th>
                        <th className="py-3 font-label-caps text-label-caps text-outline text-right">{t('dashboard.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-data-mono text-data-mono">
                      {topCategories.map((c) => (
                        <tr
                          key={c.categoryId}
                          onClick={() => router.push(`/transactions?category=${c.categoryId}&type=expense`)}
                          className="hover:bg-black/5 transition-colors cursor-pointer"
                          title={t('dashboard.viewCategoryExpenses')}
                        >
                          <td className="py-4 text-on-surface">
                            <div className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                              <Icon name={c.icon} className="text-on-surface-variant text-[18px]" />
                              <span className="truncate">{c.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right text-outline">{c.percent.toFixed(1)}%</td>
                          <td className="py-4 text-right text-on-surface">{formatCurrency(c.amount, currency)}</td>
                          <td className="py-4 text-right">
                            <Badge tone={c.percent > 30 ? 'error' : 'success'}>
                              {c.percent > 30 ? t('dashboard.high') : t('dashboard.ok')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-headline-md text-headline-md text-on-surface">{t('dashboard.monthlyFlux')}</h4>
                  <span className="font-label-caps text-label-caps text-outline">{t('dashboard.expensesByMonth')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {flux.map((m) => (
                    <div key={m.key} className="p-3 bg-black/5 border border-black/5 rounded-lg">
                      <p className="text-[10px] text-outline font-label-caps">{months[m.monthIndex]}</p>
                      <p className={`font-data-mono ${m.expense > 0 ? 'text-error' : 'text-outline'}`}>
                        {formatCurrency(m.expense, currency, { compact: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Nodos de datos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
            <DataNode icon="account_balance_wallet" label={t('dashboard.activeAccounts')} value={`${data.accounts.length}`} tone="cyan" />
            <DataNode icon="savings" label={t('dashboard.savingsRateShort')} value={`${savingsRate}%`} tone="success" />
            <DataNode icon="flag" label={t('dashboard.activeGoals')} value={`${data.goals.filter((g) => g.status === 'active').length}`} tone="cyan" />
            <DataNode
              icon="credit_card"
              label={t('debts.title')}
              value={`${data.debts.length}`}
              tone={model.debts.totalOwed > 0 ? 'error' : 'neutral'}
            />
          </div>
        </>
      )}
    </div>
  );
}
