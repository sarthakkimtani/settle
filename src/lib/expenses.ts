import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getCategory, type ExpenseCategory } from "@/lib/categories";
import { formatMoney } from "@/lib/currency";

export type ExpenseWithPayer = Doc<"expenses"> & { paidBy: Doc<"users"> | null };

export type ExpenseShareTone = "lent" | "borrowed" | "neutral";

export type ExpenseRowData = {
  id: Id<"expenses">;
  description: string;
  category: ExpenseCategory;
  paidLabel: string;
  shareLabel: string;
  shareAmount: string;
  tone: ExpenseShareTone;
  createdAt: number;
};

export type ExpenseSection = {
  key: string;
  title: string;
  rows: ExpenseRowData[];
};

export type ExpenseSortOrder = "latest" | "oldest";

export type ExpenseRowContext = {
  currentUserId: Id<"users">;
  memberCount: number;
  currency: string;
};

export const mapExpenseToRow = (
  expense: ExpenseWithPayer,
  context: ExpenseRowContext,
): ExpenseRowData => {
  const isPayer = expense.paidByUserId === context.currentUserId;
  const payerName = isPayer ? "You" : expense.paidBy?.firstName.trim() || "Someone";

  // Equal split across current members; your net = paid − your share.
  const share = expense.amountMinor / Math.max(context.memberCount, 1);
  const netMinor = isPayer ? expense.amountMinor - share : -share;
  const absMinor = Math.round(Math.abs(netMinor));

  const tone: ExpenseShareTone = absMinor === 0 ? "neutral" : netMinor > 0 ? "lent" : "borrowed";

  return {
    id: expense._id,
    description: expense.description,
    category: getCategory(expense.category),
    paidLabel: `${payerName} paid ${formatMoney(expense.amountMinor, context.currency)}`,
    shareLabel: tone === "lent" ? "you lent" : tone === "borrowed" ? "you borrowed" : "settled",
    shareAmount: formatMoney(absMinor, context.currency),
    tone,
    createdAt: expense.createdAt,
  };
};

const DAY_MS = 86_400_000;

const startOfDay = (timestamp: number) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const formatDayTitle = (timestamp: number, now = Date.now()): string => {
  const dayDiff = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY_MS);
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  const date = new Date(timestamp);
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${monthDay}, ${weekday}`;
};

export const buildExpenseSections = (
  rows: ExpenseRowData[],
  order: ExpenseSortOrder,
): ExpenseSection[] => {
  const sorted = [...rows].sort((a, b) =>
    order === "latest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
  );

  const sections: ExpenseSection[] = [];
  for (const row of sorted) {
    const key = String(startOfDay(row.createdAt));
    const last = sections[sections.length - 1];
    if (last?.key === key) {
      last.rows.push(row);
    } else {
      sections.push({ key, title: formatDayTitle(row.createdAt), rows: [row] });
    }
  }
  return sections;
};
