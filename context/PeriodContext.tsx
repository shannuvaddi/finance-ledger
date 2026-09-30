import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storage } from '../hooks/useSecureStorage';
import {
  Period,
  currentPeriod,
  formatPeriodParam,
  parsePeriodParam,
  shiftPeriod,
} from '../constants/period';

interface PeriodContextType {
  period: Period;
  periodParam: string; // "YYYY-MM" — what we send to the API
  setPeriod: (p: Period) => void;
  next: () => void;
  prev: () => void;
  ready: boolean; // true once any persisted override has been hydrated
}

const PeriodContext = createContext<PeriodContextType>({
  period: currentPeriod(),
  periodParam: formatPeriodParam(currentPeriod()),
  setPeriod: () => {},
  next: () => {},
  prev: () => {},
  ready: false,
});

const PERIOD_KEY = 'selected_period';

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  // Default to the period containing today; a persisted choice overrides it once hydrated.
  const [period, setPeriodState] = useState<Period>(() => currentPeriod());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.getItem(PERIOD_KEY);
        if (stored) setPeriodState(parsePeriodParam(stored));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setPeriod = useCallback((p: Period) => {
    setPeriodState(p);
    void storage.setItem(PERIOD_KEY, formatPeriodParam(p));
  }, []);

  const next = useCallback(() => setPeriod(shiftPeriod(period, 1)), [period, setPeriod]);
  const prev = useCallback(() => setPeriod(shiftPeriod(period, -1)), [period, setPeriod]);

  return (
    <PeriodContext.Provider
      value={{ period, periodParam: formatPeriodParam(period), setPeriod, next, prev, ready }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export const usePeriod = () => useContext(PeriodContext);
