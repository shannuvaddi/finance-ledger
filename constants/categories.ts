import { Ionicons } from '@expo/vector-icons';

type CategoryMeta = { icon: keyof typeof Ionicons.glyphMap; color: string };

// Mirrors the backend's canonical categories (finance-ledger-api Category enum).
const CATEGORIES: Record<string, CategoryMeta> = {
  groceries: { icon: 'cart-outline', color: '#43A047' },
  dining: { icon: 'restaurant-outline', color: '#E65100' },
  transport: { icon: 'bus-outline', color: '#1E88E5' },
  shopping: { icon: 'bag-handle-outline', color: '#D81B60' },
  bills: { icon: 'flash-outline', color: '#F9A825' },
  housing: { icon: 'home-outline', color: '#8D6E63' },
  emi: { icon: 'card-outline', color: '#546E7A' },
  entertainment: { icon: 'film-outline', color: '#8E24AA' },
  health: { icon: 'medkit-outline', color: '#E53935' },
  education: { icon: 'school-outline', color: '#3949AB' },
  subscriptions: { icon: 'repeat-outline', color: '#00897B' },
  travel: { icon: 'airplane-outline', color: '#039BE5' },
  salary: { icon: 'briefcase-outline', color: '#2E7D32' },
  freelance: { icon: 'laptop-outline', color: '#00ACC1' },
  savings: { icon: 'shield-checkmark-outline', color: '#7CB342' },
  other: { icon: 'pricetag-outline', color: '#A1887F' },
};

// Categories offered per entry kind in the add-transaction form.
export const EXPENSE_CATEGORIES = [
  'groceries', 'dining', 'transport', 'shopping', 'bills', 'housing', 'emi',
  'entertainment', 'health', 'education', 'subscriptions', 'travel', 'other',
];
export const INCOME_CATEGORIES = ['salary', 'freelance', 'other'];

/** Display name: "EMI" for emi, otherwise the capitalized key ("groceries" -> "Groceries"). */
export function categoryLabel(category?: string | null): string {
  const c = (category || 'other').toLowerCase();
  return c === 'emi' ? 'EMI' : c.charAt(0).toUpperCase() + c.slice(1);
}

export function categoryMeta(category?: string | null): CategoryMeta {
  return CATEGORIES[(category || 'other').toLowerCase()] ?? CATEGORIES.other;
}
