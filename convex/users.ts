import { ConvexError, v } from "convex/values";

import { internalMutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return;
    }

    await ctx.db.insert("users", args);
  },
});

export const checkMemberEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new ConvexError("User not found");

    const email = args.email.trim().toLowerCase();
    if (!email) return { exists: false };

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    return { exists: user !== null };
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
