// Formats an amount as Swedish kronor, e.g. -250 kr, +35 000 kr, -1 234,50 kr.
// Uses a space as the thousands separator and a comma for decimals (Swedish convention),
// and keeps the +/- sign so income and expenses read distinctly.
export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '+';
  const abs = Math.abs(amount);
  const hasCents = !Number.isInteger(abs);
  const [intPart, decPart] = abs.toFixed(hasCents ? 2 : 0).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const decimals = decPart ? `,${decPart}` : '';
  return `${sign}${grouped}${decimals} kr`;
}
/** Unsigned amount, e.g. 1 234 kr. */
export function formatKr(amount: number): string {
  return formatCurrency(Math.abs(amount)).replace('+', '');
}

/** Compact unsigned amount for axes and tiles: 850, 12,5k, 1,2M. */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));
  if (abs >= 1_000_000) return `${fmt(Math.round(abs / 100_000) / 10)}M`;
  if (abs >= 1_000) return `${fmt(Math.round(abs / 100) / 10)}k`;
  return String(Math.round(abs));
}

/** A "nice" axis maximum and tick step covering `max` in about `ticks` steps. */
export function niceScale(max: number, ticks = 4): { max: number; step: number } {
  if (max <= 0) return { max: ticks, step: 1 };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  return { max: step * Math.ceil(max / step), step };
}
