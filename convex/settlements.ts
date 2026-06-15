import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireGroupMembership } from "./lib/auth";
import { loadGroupBalances } from "./lib/groupData";

export const listGroupSettlements = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireGroupMembership(ctx, args.groupId, user._id);

    const settlements = await ctx.db
      .query("settlements")
      .withIndex("by_group_created_at", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    return Promise.all(
      settlements.map(async (settlement) => ({
        ...settlement,
        fromUser: await ctx.db.get(settlement.fromUserId),
        toUser: await ctx.db.get(settlement.toUserId),
      })),
    );
  },
});

/**
 * Simplified debts that involve the current user, both directions, for the
 * settle-up screen. `direction: "owe"` means the user pays the other person;
 * `"owed"` means the other person pays the user.
 */
export const getSettleUp = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireGroupMembership(ctx, args.groupId, user._id);

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new ConvexError("Group not found");

    const { debts } = await loadGroupBalances(ctx, args.groupId);

    const mine = debts.filter((debt) => debt.fromUserId === user._id || debt.toUserId === user._id);

    const entries = await Promise.all(
      mine.map(async (debt) => {
        const oweOther = debt.fromUserId === user._id;
        const otherUserId = (oweOther ? debt.toUserId : debt.fromUserId) as Id<"users">;
        const otherUser = await ctx.db.get(otherUserId);
        return {
          otherUserId,
          otherUserName: otherUser
            ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
            : "Someone",
          otherUserAvatarUrl: otherUser?.avatarUrl,
          direction: oweOther ? ("owe" as const) : ("owed" as const),
          amountMinor: debt.amountMinor,
        };
      }),
    );

    return {
      currency: group.currency,
      currentUserId: user._id,
      debts: entries,
    };
  },
});

export const createSettlement = mutation({
  args: {
    groupId: v.id("groups"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amountMinor: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireGroupMembership(ctx, args.groupId, user._id);
    await requireGroupMembership(ctx, args.groupId, args.fromUserId);
    await requireGroupMembership(ctx, args.groupId, args.toUserId);

    if (args.fromUserId === args.toUserId) {
      throw new ConvexError("Payer and payee must be different");
    }
    if (args.amountMinor <= 0) throw new ConvexError("Amount must be greater than zero");

    // The current user can only record settlements that involve them.
    if (args.fromUserId !== user._id && args.toUserId !== user._id) {
      throw new ConvexError("You can only settle debts that involve you");
    }

    // Full-settle only: the amount must match an outstanding simplified debt for
    // this exact payer -> payee pair. This is the trust boundary — never rely on
    // the client to send a correct amount.
    const { debts } = await loadGroupBalances(ctx, args.groupId);
    const debt = debts.find(
      (entry) => entry.fromUserId === args.fromUserId && entry.toUserId === args.toUserId,
    );
    if (!debt) {
      throw new ConvexError("No outstanding balance to settle between these members");
    }
    if (debt.amountMinor !== args.amountMinor) {
      throw new ConvexError("Settlement amount must match the outstanding balance");
    }

    return ctx.db.insert("settlements", {
      groupId: args.groupId,
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      amountMinor: args.amountMinor,
      createdByUserId: user._id,
      createdAt: Date.now(),
    });
  },
});
