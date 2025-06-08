import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  threads: defineTable({
    createdAt: v.int64(),
    updatedAt: v.int64(),
    lastMessageAt: v.int64(),
    status: v.union(
      v.literal("finished"),
      v.literal("processing"),
    ),
    parentThread: v.optional(v.id("threads")),
    user: v.id("users"),
  }),
  messages: defineTable({
    content: v.string(),
    createdAt: v.int64(),
    role: v.union(
      v.literal("user"), 
      v.literal("assistant"), // assistant messages are used to provide responses in the conversation from models
      v.literal("system"), // system messages are used to set context for the conversation
    ),
    status: v.union(
      v.literal("finished"),
      v.literal("processing"),
    ),
    user: v.id("users"),
  }),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  sessions: defineTable({
    token: v.string(),
    user: v.id("users"),
    createdAt: v.int64(),
    expiresAt: v.int64(),
  }).index("by_token", ["token"]),
});