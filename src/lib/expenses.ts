import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getCategory } from "@/lib/categories";
import { formatMoney } from "@/lib/currency";

export type ExpenseWithPayer = Doc<"expenses"> & { paidBy: Doc<"users"> | null };

export type SettlementWithUsers = Doc<"settlements"> & {
  fromUser: Doc<"users"> | null;
  toUser: Doc<"users"> | null;
};

export type ExpenseShareTone = "lent" | "borrowed" | "neutral";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/** One row in the dated activity list — either an expense or a settlement. */
export type ActivityRowData = {
  id: string;
  createdAt: number;
  icon: IoniconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  rightLabel: string;
  rightAmount: string;
  tone: ExpenseShareTone;
};

export type ActivitySection = {
  key: string;
  title: string;
  rows: ActivityRowData[];
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
): ActivityRowData => {
  const isPayer = expense.paidByUserId === context.currentUserId;
  const payerName = isPayer ? "You" : expense.paidBy?.firstName.trim() || "Someone";

  // Equal split across current members; your net = paid − your share.
  const share = expense.amountMinor / Math.max(context.memberCount, 1);
  const netMinor = isPayer ? expense.amountMinor - share : -share;
  const absMinor = Math.round(Math.abs(netMinor));

  const tone: ExpenseShareTone = absMinor === 0 ? "neutral" : netMinor > 0 ? "lent" : "borrowed";
  const category = getCategory(expense.category);

  return {
    id: expense._id,
    createdAt: expense.createdAt,
    icon: category.icon,
    iconColor: category.color,
    iconBackground: category.backgroundColor,
    title: expense.description,
    subtitle: `${payerName} paid ${formatMoney(expense.amountMinor, context.currency)}`,
    rightLabel: tone === "lent" ? "you lent" : tone === "borrowed" ? "you borrowed" : "settled",
    rightAmount: formatMoney(absMinor, context.currency),
    tone,
  };
};

export const mapSettlementToRow = (
  settlement: SettlementWithUsers,
  context: Pick<ExpenseRowContext, "currentUserId" | "currency">,
): ActivityRowData => {
  const fromYou = settlement.fromUserId === context.currentUserId;
  const toYou = settlement.toUserId === context.currentUserId;
  const payerName = fromYou ? "You" : settlement.fromUser?.firstName.trim() || "Someone";
  const payeeName = toYou ? "you" : settlement.toUser?.firstName.trim() || "someone";

  return {
    id: settlement._id,
    createdAt: settlement.createdAt,
    icon: "swap-horizontal",
    iconColor: "#3E9479",
    iconBackground: "#D8F1EC",
    title: "Settle up",
    subtitle: `${payerName} paid ${payeeName}`,
    rightLabel: "settled",
    rightAmount: formatMoney(settlement.amountMinor, context.currency),
    tone: "neutral",
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

export const buildActivitySections = (
  rows: ActivityRowData[],
  order: ExpenseSortOrder,
): ActivitySection[] => {
  const sorted = [...rows].sort((a, b) =>
    order === "latest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
  );

  const sections: ActivitySection[] = [];
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
