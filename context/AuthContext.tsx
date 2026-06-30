import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {storage} from '../hooks/useSecureStorage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  authenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  googleAuth: (idToken: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  user: null,
  token: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  googleAuth: async () => null,
  logout: () => {},
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await storage.getItem(TOKEN_KEY);
        const storedUser = await storage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistAuth = async (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    await storage.setItem(TOKEN_KEY, authToken);
    await storage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Login failed';
      await persistAuth(data.token, { email: data.email, name: data.name });
      return null;
    } catch {
      return 'Network error. Please try again.';
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Registration failed';
      await persistAuth(data.token, { email: data.email, name: data.name });
      return null;
    } catch {
      return 'Network error. Please try again.';
    }
  }, []);

  const googleAuth = useCallback(async (idToken: string): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Google sign-in failed';
      await persistAuth(data.token, { email: data.email, name: data.name });
      return null;
    } catch {
      return 'Network error. Please try again.';
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated: !!token, user, token, loading, login, register, googleAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
