import { useEffect, useState } from 'react';
import { useApi } from './useApi';
import { Transaction } from './useTransactions';

// Mirrors finance-ledger-api InsightsResponse. Amounts are positive magnitudes.
export interface Totals {
  income: number;
  expenses: number;
  saved: number; // money moved into savings (not spending)
  net: number; // left over: income - expenses - saved
  savingsRate: number | null; // saved as % of income; null without income
  transactionCount: number;
  avgDailySpend: number;
  projectedExpenses: number;
}

export interface PeriodTotals {
  period: string; // YYYY-MM
  income: number;
  expenses: number;
  saved: number;
  net: number;
}

export interface PacePoint {
  day: number; // 1-based day of the period
  date: string | null;
  current: number | null; // cumulative spend; null after today
  previous: number | null;
}

export interface CategoryInsight {
  category: string;
  spent: number;
  previousSpent: number;
  share: number; // % of expenses
  budget: number | null;
  count: number;
}

export interface Insights {
  period: string;
  from: string;
  to: string;
  daysInPeriod: number;
  daysElapsed: number;
  summary: Totals;
  previous: Totals;
  trend: PeriodTotals[];
  pace: PacePoint[];
  categories: CategoryInsight[];
  weekdays: { day: string; spent: number; count: number }[]; // MON..SUN
  sources: { source: 'LEDGER' | 'CHAT' | 'VOICE'; count: number }[];
  topExpenses: Transaction[];
  budget: { totalBudget: number; spent: number; budgetedCount: number; overCount: number; nearCount: number } | null;
}

export function useInsights() {
  const api = useApi<Insights>();
  // useApi clears `data` on every request; keep the last result so a refetch holds the
  // previous render (dimmed) instead of flashing an empty screen.
  const [last, setLast] = useState<Insights | null>(null);
  useEffect(() => {
    if (api.data) setLast(api.data);
  }, [api.data]);

  const fetchInsights = (period: string, months = 6) => api.request(`/insights?period=${period}&months=${months}`);

  return { insights: api.data ?? last, loading: api.loading, error: api.error, fetchInsights };
}
