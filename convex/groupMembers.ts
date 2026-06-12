import { ConvexError, v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const updateGroupMetadata = async (ctx: MutationCtx, groupId: Id<"groups">) => {
  const memberships = await ctx.db
    .query("groupMembers")
    .withIndex("by_group", (q) => q.eq("groupId", groupId))
    .collect();

  const users = await Promise.all(memberships.map((m) => ctx.db.get(m.userId)));
  const avatarUrls = users.map((user) => user?.avatarUrl).filter((url): url is string => !!url);

  await ctx.db.patch(groupId, {
    memberCount: memberships.length,
    avatarUrls: [...new Set(avatarUrls)].slice(0, 4),
    updatedAt: Date.now(),
  });
};

export const addGroupMembers = mutation({
  args: {
    groupId: v.id("groups"),
    memberEmails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new ConvexError("User not found");

    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", currentUser._id),
      )
      .unique();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new ConvexError("Only admins can add members");
    }

    const emails = [...new Set(args.memberEmails.map((e) => e.trim().toLowerCase()))];

    const resolvedMembers = await Promise.all(
      emails.map(async (email) => ({
        email,
        user: await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique(),
      })),
    );
    const missingEmails = resolvedMembers
      .filter(({ user }) => user === null)
      .map(({ email }) => email);
    const users = resolvedMembers
      .map(({ user }) => user)
      .filter((user): user is NonNullable<typeof user> => user !== null);

    for (const user of users) {
      const existing = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", user._id))
        .unique();

      if (existing) continue;

      await ctx.db.insert("groupMembers", {
        groupId: args.groupId,
        userId: user._id,
        role: "member",
        joinedAt: Date.now(),
      });
    }

    await updateGroupMetadata(ctx, args.groupId);
    return { groupId: args.groupId, missingEmails };
  },
});

export const removeGroupMembers = mutation({
  args: {
    groupId: v.id("groups"),
    memberEmails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new ConvexError("User not found");

    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", currentUser._id),
      )
      .unique();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new ConvexError("Only admins can remove members");
    }

    const emails = [...new Set(args.memberEmails.map((e) => e.trim().toLowerCase()))];

    const users = (
      await Promise.all(
        emails.map((email) =>
          ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique(),
        ),
      )
    ).filter((u): u is NonNullable<typeof u> => u !== null);

    for (const user of users) {
      const membership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_user", (q) => q.eq("groupId", args.groupId).eq("userId", user._id))
        .unique();

      if (!membership) continue;
      // admins cannot be removed
      if (membership.role === "admin") continue;

      await ctx.db.delete(membership._id);
    }

    await updateGroupMetadata(ctx, args.groupId);
    return args.groupId;
  },
});
