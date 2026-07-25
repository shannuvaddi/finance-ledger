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