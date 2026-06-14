import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireGroupMembership } from "./lib/auth";

export const listGroupExpenses = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireGroupMembership(ctx, args.groupId, user._id);

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group_created_at", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    return Promise.all(
      expenses.map(async (expense) => ({
        ...expense,
        paidBy: await ctx.db.get(expense.paidByUserId),
      })),
    );
  },
});

export const createExpense = mutation({
  args: {
    groupId: v.id("groups"),
    description: v.string(),
    category: v.optional(v.string()),
    amountMinor: v.number(),
    paidByUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireGroupMembership(ctx, args.groupId, user._id); // user
    await requireGroupMembership(ctx, args.groupId, args.paidByUserId); // payer

    if (args.amountMinor <= 0) throw new ConvexError("Amount must be greater than zero");

    const expenseId = await ctx.db.insert("expenses", {
      groupId: args.groupId,
      description: args.description,
      category: args.category,
      amountMinor: args.amountMinor,
      paidByUserId: args.paidByUserId,
      splitType: "equal",
      createdByUserId: user._id,
      createdAt: Date.now(),
    });

    return expenseId;
  },
});
