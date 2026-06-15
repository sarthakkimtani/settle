import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireGroupMembership } from "./lib/auth";
import { isValidCurrency } from "./lib/currency";
import { loadUserGroupBalance } from "./lib/groupData";

export const createGroup = mutation({
  args: {
    name: v.string(),
    currency: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!isValidCurrency(args.currency)) throw new ConvexError("Invalid currency");

    const now = Date.now();
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      currency: args.currency,
      description: args.description,
      avatarUrls: user.avatarUrl ? [user.avatarUrl] : [],
      memberCount: 1,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: user._id,
      role: "admin",
      joinedAt: now,
    });

    return { groupId };
  },
});

export const getGroups = query({
  handler: async (ctx, _) => {
    const user = await getCurrentUser(ctx);

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const groups = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.groupId)),
    );

    const present = groups.filter((group): group is NonNullable<typeof group> => group !== null);

    return Promise.all(
      present.map(async (group) => ({
        ...group,
        balanceMinor: await loadUserGroupBalance(ctx, group._id, user._id),
      })),
    );
  },
});

export const getGroupDetails = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, { groupId }) => {
    const user = await getCurrentUser(ctx);
    await requireGroupMembership(ctx, groupId, user._id);

    const group = await ctx.db.get(groupId);
    if (!group) throw new ConvexError("Group not found");

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
    const users = await Promise.all(memberships.map((item) => ctx.db.get(item.userId)));
    const balanceMinor = await loadUserGroupBalance(ctx, groupId, user._id);

    return {
      group,
      currentUserId: user._id,
      balanceMinor,
      members: users.flatMap((member) =>
        member
          ? [
              {
                id: member._id,
                name: `${member.firstName} ${member.lastName}`.trim(),
                email: member.email,
                avatarUrl: member.avatarUrl,
              },
            ]
          : [],
      ),
    };
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const membership = await requireGroupMembership(ctx, args.groupId, user._id);
    if (membership.role !== "admin") {
      throw new ConvexError("Only admins can update groups");
    }

    await ctx.db.patch(args.groupId, {
      name: args.name,
      description: args.description,
      updatedAt: Date.now(),
    });

    return args.groupId;
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const user = await getCurrentUser(ctx);
    const group = await ctx.db.get(groupId);
    if (!group) throw new ConvexError("Group not found");

    if (group.createdBy !== user._id) {
      throw new ConvexError("Not authorized");
    }

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    await Promise.all(memberships.map((membership) => ctx.db.delete(membership._id)));
    await ctx.db.delete(groupId);
    return { success: true };
  },
});
