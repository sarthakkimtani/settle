/**
 * Pairwise balance math for groups, in integer minor units.
 *
 * Convention: a member's net balance is positive when they are *owed* money
 * (a creditor) and negative when they *owe* money (a debtor). Net balances
 * across a group always sum to zero, which is what makes debt simplification
 * resolve cleanly.
 */

export type ExpenseInput = {
  amountMinor: number;
  paidByUserId: string;
};

export type SettlementInput = {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
};

export type SimplifiedDebt = {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
};

/**
 * Split an amount equally across `count` members, distributing the leftover
 * minor units one-at-a-time so the shares always sum back to `amountMinor`.
 * The first `remainder` members (by the given order) absorb the extra unit.
 */
const equalShares = (amountMinor: number, count: number): number[] => {
  if (count <= 0) return [];
  const base = Math.floor(amountMinor / count);
  const remainder = amountMinor - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
};

/**
 * Net balance per participant from all expenses (equal split across current
 * members) and settlements. `memberIds` are sorted for deterministic remainder
 * handling.
 *
 * Expense shares are only ever charged to *current* members, but the net map is
 * seeded with every participant — current members plus anyone who paid an
 * expense or took part in a settlement. That way a member who paid and then left
 * the group still carries their credit, so the balances keep summing to zero and
 * the simplified graph stays settleable.
 */
export const computeNetBalances = (
  memberIds: string[],
  expenses: ExpenseInput[],
  settlements: SettlementInput[],
): Map<string, number> => {
  const members = [...memberIds].sort();

  const participants = new Set<string>(members);
  for (const expense of expenses) participants.add(expense.paidByUserId);
  for (const settlement of settlements) {
    participants.add(settlement.fromUserId);
    participants.add(settlement.toUserId);
  }

  const net = new Map<string, number>([...participants].map((id) => [id, 0]));
  const add = (id: string, delta: number) => net.set(id, (net.get(id) ?? 0) + delta);

  for (const expense of expenses) {
    const shares = equalShares(expense.amountMinor, members.length);
    members.forEach((id, index) => add(id, -shares[index]));
    add(expense.paidByUserId, expense.amountMinor);
  }

  for (const settlement of settlements) {
    // The payer reduces what they owe (net up); the payee gets paid (net down).
    add(settlement.fromUserId, settlement.amountMinor);
    add(settlement.toUserId, -settlement.amountMinor);
  }

  return net;
};

/**
 * Greedily reduce net balances into a minimal set of transfers: repeatedly
 * match the largest creditor with the largest debtor until everyone is square.
 */
export const simplifyDebts = (net: Map<string, number>): SimplifiedDebt[] => {
  const creditors = [...net.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }));
  const debtors = [...net.entries()]
    .filter(([, amount]) => amount < 0)
    .map(([id, amount]) => ({ id, amount: -amount }));

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const debts: SimplifiedDebt[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const transfer = Math.min(creditor.amount, debtor.amount);

    if (transfer > 0) {
      debts.push({ fromUserId: debtor.id, toUserId: creditor.id, amountMinor: transfer });
    }

    creditor.amount -= transfer;
    debtor.amount -= transfer;
    if (creditor.amount === 0) ci += 1;
    if (debtor.amount === 0) di += 1;
  }

  return debts;
};
