import {useCallback, useState} from 'react';
import {useAuth} from '@/context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = unknown>() {
  const { token } = useAuth();
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async (endpoint: string, method: HttpMethod = 'GET', body?: unknown): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || `HTTP ${res.status}`);
        }
        const data: T = await res.json();
        setState({ data, loading: false, error: null });
        return data;
      } catch (e: any) {
        setState({ data: null, loading: false, error: e.message });
        return null;
      }
    },
    [token],
  );

  return { ...state, request };
}
