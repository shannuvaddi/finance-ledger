import {useCallback, useState} from 'react';
import {useApi} from './useApi';

export interface TransactionData {
  description: string;
  amount: number;
  category?: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  transaction?: TransactionData;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hey! I'm Chanakya, your finance assistant. Tell me about a transaction or ask me anything about your spending.",
    },
  ]);
  const { loading, error, request } = useApi<{ reply: string; transaction?: TransactionData }>();

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);

      const res = await request('/chat', 'POST', { content });
      if (res) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.reply,
          transaction: res.transaction ?? undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const fallback = parseFallbackTransaction(content);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallback ? 'Got it! Logged this for you:' : "I'm offline right now. I'll process this when connected.",
          transaction: fallback ?? undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    },
    [request],
  );

  return { messages, loading, error, sendMessage };
}

function parseFallbackTransaction(text: string): TransactionData | null {
  const amountMatch = text.match(/[\$₹]?([\d,]+(?:\.\d{2})?)/);
  if (!amountMatch) return null;
  const amount = -parseFloat(amountMatch[1].replace(',', ''));
  const description = text.replace(amountMatch[0], '').replace(/spent|paid|bought/gi, '').trim() || 'Transaction';
  return { description, amount, date: new Date().toISOString().split('T')[0], category: 'other' };
}
