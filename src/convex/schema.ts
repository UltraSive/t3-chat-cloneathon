import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    description: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    lastMessageAt: v.string(),
    status: v.union(
      v.literal("finished"),
      v.literal("processing"),
      v.literal("archived")
    ),
    parentThread: v.optional(v.id("threads")),
    user: v.string(),
  }).index("by_lastMessageAt", ["lastMessageAt"])
  .index("by_user_lastMessageAt", ["user", "lastMessageAt"]),
  messages: defineTable({
    content: v.string(),
    createdAt: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"), // assistant messages are used to provide responses in the conversation from models
      v.literal("system"), // system messages are used to set context for the conversation
    ),
    status: v.union(
      v.literal("finished"),
      v.literal("processing"),
      v.literal("failed"),
      v.literal("archived"),
      v.literal("shared")
    ),
    model: v.optional(v.string()),
    user: v.string(),
    thread: v.id("threads"),
  }).index("by_thread", ["thread", "createdAt"]),
});