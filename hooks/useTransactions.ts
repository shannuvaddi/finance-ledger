import { useApi } from './useApi';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export function useTransactions() {
  const { data, loading, error, request } = useApi<Transaction[]>();

  const fetchTransactions = () => request('/transactions');
  const createTransaction = (description: string, amount: number) =>
    request('/transactions', 'POST', { description, amount, date: new Date().toISOString() });

  return { transactions: data, loading, error, fetchTransactions, createTransaction };
}
