import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { computeNetBalances, simplifyDebts, type SimplifiedDebt } from "./balances";

/** Load the raw inputs needed to compute a group's balances. */
const loadGroupLedger = async (ctx: QueryCtx, groupId: Id<"groups">) => {
  const [memberships, expenses, settlements] = await Promise.all([
    ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect(),
    ctx.db
      .query("expenses")
      .withIndex("by_group_created_at", (q) => q.eq("groupId", groupId))
      .collect(),
    ctx.db
      .query("settlements")
      .withIndex("by_group_created_at", (q) => q.eq("groupId", groupId))
      .collect(),
  ]);

  const memberIds = memberships.map((m) => m.userId as string);
  return { memberIds, expenses, settlements };
};

/** Net balance per participant in a group (positive = owed, negative = owes). */
export const loadGroupNet = async (
  ctx: QueryCtx,
  groupId: Id<"groups">,
): Promise<Map<string, number>> => {
  const { memberIds, expenses, settlements } = await loadGroupLedger(ctx, groupId);
  return computeNetBalances(memberIds, expenses, settlements);
};

/**
 * Net balances plus the simplified debt graph. Shared by the group and
 * settlement queries so balances are computed one consistent way.
 */
export const loadGroupBalances = async (ctx: QueryCtx, groupId: Id<"groups">) => {
  const net = await loadGroupNet(ctx, groupId);
  const debts: SimplifiedDebt[] = simplifyDebts(net);
  return { net, debts };
};

/** A single user's net balance in a group (positive = owed, negative = owes). */
export const loadUserGroupBalance = async (
  ctx: QueryCtx,
  groupId: Id<"groups">,
  userId: Id<"users">,
): Promise<number> => {
  const net = await loadGroupNet(ctx, groupId);
  return net.get(userId) ?? 0;
};
