import {useCallback, useState} from 'react';
import {useAuth} from '@/context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// 'transaction' logs an entry (no spending history is loaded); 'query' answers
// questions about spending and never creates a transaction.
export type ChatContext = 'transaction' | 'query';

export interface TransactionData {
  description: string;
  amount: number;
  category?: string;
  type?: 'credit' | 'debit';
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  transaction?: TransactionData;
  isError?: boolean;
}

interface ChatApiResponse {
  reply: string;
  transaction?: TransactionData;
}

export function useChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! I'm Chanakya, your finance assistant. Tell me about a transaction or ask me anything about your spending.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, context: ChatContext = 'query', period?: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${BASE_URL}/chat`, {
          method: 'POST',
          headers,
          // `period` scopes the query context to the selected month on the backend.
          body: JSON.stringify({ content, context, period }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          // Backend fails loudly (e.g. 422 when no transaction could be identified).
          // Surface its message instead of fabricating a success.
          const msg = data?.error || `Something went wrong (HTTP ${res.status}).`;
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: 'assistant', content: msg, isError: true },
          ]);
          setError(msg);
          return;
        }

        const body = data as ChatApiResponse;
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: body.reply,
            transaction: body.transaction ?? undefined,
          },
        ]);
      } catch (e: any) {
        const msg = e?.message || 'Network request failed';
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm offline right now. Please try again when connected.", isError: true },
        ]);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  return { messages, loading, error, sendMessage };
}
