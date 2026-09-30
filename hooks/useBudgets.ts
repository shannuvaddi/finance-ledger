import { useApi } from './useApi';

// One row per canonical category. `budget`/`remaining` are null when no budget is set.
export interface CategorySpend {
  category: string;
  budget: number | null;
  spent: number;
  remaining: number | null;
}

export interface BudgetOverview {
  period: string; // YYYY-MM
  from: string;
  to: string;
  categories: CategorySpend[];
}

export function useBudgets() {
  // Two instances: `overview` holds the list; `mutate` runs POST/DELETE so a mutation
  // doesn't clobber the overview state (useApi resets data to null on each request).
  const overview = useApi<BudgetOverview>();
  const mutate = useApi();

  const fetchOverview = (period: string) => overview.request(`/budgets?period=${period}`);
  const setBudget = (category: string, amount: number) =>
    mutate.request('/budgets', 'POST', { category, amount });
  const deleteBudget = (id: string) => mutate.request(`/budgets/${id}`, 'DELETE');

  return {
    overview: overview.data,
    loading: overview.loading,
    error: overview.error,
    saving: mutate.loading,
    fetchOverview,
    setBudget,
    deleteBudget,
  };
}
