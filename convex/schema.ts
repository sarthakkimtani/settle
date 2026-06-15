import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  groups: defineTable({
    name: v.string(),
    currency: v.string(),
    description: v.optional(v.string()),
    avatarUrls: v.array(v.string()),
    memberCount: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"]),

  expenses: defineTable({
    groupId: v.id("groups"),
    description: v.string(),
    category: v.optional(v.string()),
    amountMinor: v.number(),
    paidByUserId: v.id("users"),
    splitType: v.literal("equal"),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
  }).index("by_group_created_at", ["groupId", "createdAt"]),

  settlements: defineTable({
    groupId: v.id("groups"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amountMinor: v.number(),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
  }).index("by_group_created_at", ["groupId", "createdAt"]),
});
