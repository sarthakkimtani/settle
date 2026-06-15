import { formatMoney } from "@/lib/currency";
import type { GroupBalanceTone } from "@/lib/groups";

export type NetBalance = {
  /** Short label for cards, e.g. "You are owed" / "You owe" / "Settled up". */
  label: string;
  /** Absolute amount, formatted in the group's currency. */
  amount: string;
  tone: GroupBalanceTone;
};

const toneFor = (balanceMinor: number): GroupBalanceTone =>
  balanceMinor > 0 ? "positive" : balanceMinor < 0 ? "negative" : "neutral";

/** Describe a net balance (positive = owed, negative = owes) for a group card. */
export const describeNetBalance = (balanceMinor: number, currency: string): NetBalance => {
  const tone = toneFor(balanceMinor);
  return {
    label: tone === "positive" ? "You are owed" : tone === "negative" ? "You owe" : "Settled up",
    amount:
      tone === "neutral"
        ? formatMoney(0, currency, { trimWhole: true })
        : formatMoney(Math.abs(balanceMinor), currency, { trimWhole: true }),
    tone,
  };
};

/** Full sentence for the group details header, e.g. "You are owed $30 overall". */
export const describeNetBalanceSentence = (balanceMinor: number, currency: string): string => {
  if (balanceMinor === 0) return "You're all settled up";
  const amount = formatMoney(Math.abs(balanceMinor), currency, { trimWhole: true });
  return balanceMinor > 0
    ? `You are owed ${amount} overall`
    : `You owe ${amount} overall`;
};
