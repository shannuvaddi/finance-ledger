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

  // `R` lets a caller declare the response shape of a single request when it
  // differs from the hook's `T` (e.g. a POST that returns one item, not a list).
  const request = useCallback(
    async <R = T>(endpoint: string, method: HttpMethod = 'GET', body?: unknown): Promise<R | null> => {
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
        // 204 No Content (e.g. DELETE) has no body to parse.
        const data = res.status === 204 ? null : await res.json();
        setState({ data: data as T, loading: false, error: null });
        return data as R;
      } catch (e: any) {
        setState({ data: null, loading: false, error: e.message });
        return null;
      }
    },
    [token],
  );

  return { ...state, request };
}
