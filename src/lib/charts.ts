import type { Id } from "@/convex/_generated/dataModel";
import { getCategory } from "@/lib/categories";
import { formatMoney } from "@/lib/currency";
import type { ExpenseWithPayer } from "@/lib/expenses";
import type { GroupMember } from "@/lib/groups";

export type ChartSlice = {
  key: string;
  label: string;
  color: string;
  amountMinor: number;
  amountLabel: string;
  percent: number;
};

const PERSON_PALETTE = [
  "#4EA085",
  "#7C3AED",
  "#1D4ED8",
  "#B45309",
  "#BE185D",
  "#0F766E",
  "#C2410C",
  "#9F1239",
];

const toSlices = (
  totals: { key: string; label: string; color: string; amountMinor: number }[],
  currency: string,
): ChartSlice[] => {
  const grandTotal = totals.reduce((sum, item) => sum + item.amountMinor, 0);
  return totals
    .filter((item) => item.amountMinor > 0)
    .sort((a, b) => b.amountMinor - a.amountMinor)
    .map((item) => ({
      ...item,
      amountLabel: formatMoney(item.amountMinor, currency, { trimWhole: true }),
      percent: grandTotal > 0 ? item.amountMinor / grandTotal : 0,
    }));
};

/** Total group spend grouped by expense category. */
export const buildCategoryChart = (
  expenses: ExpenseWithPayer[],
  currency: string,
): ChartSlice[] => {
  const byCategory = new Map<string, number>();
  for (const expense of expenses) {
    const id = getCategory(expense.category).id;
    byCategory.set(id, (byCategory.get(id) ?? 0) + expense.amountMinor);
  }

  const totals = [...byCategory.entries()].map(([id, amountMinor]) => {
    const category = getCategory(id);
    return { key: id, label: category.label, color: category.color, amountMinor };
  });

  return toSlices(totals, currency);
};

/** Total group spend grouped by who paid. */
export const buildPersonChart = (
  expenses: ExpenseWithPayer[],
  members: GroupMember[],
  currency: string,
): ChartSlice[] => {
  const byPayer = new Map<string, number>();
  for (const expense of expenses) {
    const id = expense.paidByUserId as string;
    byPayer.set(id, (byPayer.get(id) ?? 0) + expense.amountMinor);
  }

  const nameOf = (id: string) =>
    members.find((member) => member.id === (id as Id<"users">))?.name ?? "Someone";

  // Color by the member's fixed position in the roster so a person keeps the
  // same color regardless of expense order or which expenses are present. Payers
  // no longer in the group fall back to the end of the palette, by id, stably.
  const rosterIndex = (id: string) =>
    members.findIndex((member) => member.id === (id as Id<"users">));
  const colorFor = (id: string) => {
    const index = rosterIndex(id);
    const slot = index >= 0 ? index : members.length + [...byPayer.keys()].sort().indexOf(id);
    return PERSON_PALETTE[slot % PERSON_PALETTE.length];
  };

  const totals = [...byPayer.entries()].map(([id, amountMinor]) => ({
    key: id,
    label: nameOf(id),
    color: colorFor(id),
    amountMinor,
  }));

  return toSlices(totals, currency);
};
