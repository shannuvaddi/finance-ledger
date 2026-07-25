import {useApi} from './useApi';

export type TransactionSource = 'LEDGER' | 'CHAT' | 'VOICE';

// Debit = money out (spent), credit = money in (received). The backend parser
// derives this from the text; `amount` is signed to match (negative = debit).
export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category?: string;
  source?: TransactionSource;
  type?: TransactionType;
  date: string;
}

export interface TransactionFilters {
  source?: TransactionSource;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

function buildQuery(filters?: TransactionFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  // The API applies `source` OR a `from`+`to` range (source takes precedence),
  // so we only send what's set and let category/sort be handled client-side.
  if (filters.source) params.set('source', filters.source);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useTransactions() {
  const { data, loading, error, request } = useApi<Transaction[]>();

  const fetchTransactions = (filters?: TransactionFilters) =>
    request(`/transactions${buildQuery(filters)}`);

  const createTransaction = (description: string, amount: number, category?: string) =>
    request<Transaction>('/transactions', 'POST', {
      description,
      amount,
      category,
      date: new Date().toISOString().split('T')[0],
    });

  const deleteTransaction = (id: string) => request(`/transactions/${id}`, 'DELETE');

  return { transactions: data, loading, error, fetchTransactions, createTransaction, deleteTransaction };
}
