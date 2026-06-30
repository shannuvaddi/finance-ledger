import {useApi} from './useApi';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category?: string;
  date: string;
}

export function useTransactions() {
  const { data, loading, error, request } = useApi<Transaction[]>();

  const fetchTransactions = () => request('/transactions');

  const createTransaction = (description: string, amount: number, category?: string) =>
    request('/transactions', 'POST', { description, amount, category, date: new Date().toISOString().split('T')[0] });

  const deleteTransaction = (id: string) => request(`/transactions/${id}`, 'DELETE');

  return { transactions: data, loading, error, fetchTransactions, createTransaction, deleteTransaction };
}
