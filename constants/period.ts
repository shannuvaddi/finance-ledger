// The billing cycle starts on the 22nd. The period labelled "August 2026" spans
// Jul 22 -> Aug 21. The frontend only needs to pick the DEFAULT period from today and
// render labels/navigation — the backend owns the date-range math (it resolves `period`).

export const CYCLE_START_DAY = 22;

// `month` is 1-12 and refers to the LABEL month (e.g. { year: 2026, month: 8 } = "August 2026").
export interface Period {
  year: number;
  month: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** The period whose range contains `today`: on/after the cycle day rolls into next month. */
export function currentPeriod(today: Date = new Date()): Period {
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12
  if (today.getDate() >= CYCLE_START_DAY) {
    return shiftPeriod({ year, month }, 1);
  }
  return { year, month };
}

/** "2026-08" */
export function formatPeriodParam(p: Period): string {
  return `${p.year}-${String(p.month).padStart(2, '0')}`;
}

export function parsePeriodParam(s: string): Period {
  const [year, month] = s.split('-').map(Number);
  return { year, month };
}

/** "August 2026" */
export function periodLabel(p: Period): string {
  return `${MONTH_NAMES[p.month - 1]} ${p.year}`;
}

/** Move `delta` months, rolling the year over. */
export function shiftPeriod(p: Period, delta: number): Period {
  // Convert to a 0-based absolute month index, shift, convert back.
  const idx = p.year * 12 + (p.month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}
