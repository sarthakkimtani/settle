import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError("Not authenticated");
  }

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!currentUser) throw new ConvexError("User not found");

  return currentUser;
};

export const requireGroupMembership = async (
  ctx: QueryCtx,
  groupId: Id<"groups">,
  userId: Id<"users">,
) => {
  const membership = await ctx.db
    .query("groupMembers")
    .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", userId))
    .unique();
  if (!membership) throw new ConvexError("Not a member of this group");

  return membership;
};
