import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const createUserMessage = mutation({
  args: {
    threadId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    status: v.optional(v.union(
      v.literal("finished"),
      v.literal("processing")
    )),
    user: v.string(),
  },
  handler: async (ctx, { threadId, role, content, user }) => {
    const threadIdType = threadId as Id<'threads'>;

    const thread = await ctx.db.get(threadIdType);
    if (!thread) {
      throw new Error("Thread not found.");
    }

    const now = new Date().toISOString();

    const messageId = await ctx.db.insert("messages", {
      thread: threadIdType,
      content,
      role,
      createdAt: now,
      status: "finished", // or "processing" based on your use case
      user,
    });

    // Optionally update the thread's lastMessageAt
    await ctx.db.patch(threadIdType, {
      lastMessageAt: now,
      updatedAt: now,
    });

    return messageId;
  },
});

export const updateMessage = mutation({
  args: {
    message: v.string(),
    content: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("finished"),
      v.literal("processing"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, { message, content, status }) => {
    const messageId = message as Id<'messages'>;

    const existing = await ctx.db.get(messageId);
    if (!existing) {
      throw new Error("Message not found.");
    }

    const updates: Partial<typeof existing> = {};
    if (content !== undefined) updates.content = content;
    if (status !== undefined) updates.status = status;

    await ctx.db.patch(messageId, updates);
    return { success: true };
  },
});

export const getMessagesFromThread = query({
  args: {
    thread: v.string(),
    user: v.string()
  },
  handler: async (ctx, { thread, user }) => {
    const threadId = thread as Id<'threads'>;

    // Step 1: Get the thread
    const result = await ctx.db.get(threadId);
    if (!result) {
      throw new Error("Thread not found");
    }

    // Step 2: Check if thread belongs to the user
    if (result.user !== user) {
      throw new Error("Unauthorized access to thread");
    }

    // Step 3: Get the messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("thread", threadId))
      .order("asc") // Order by createdAt ascending
      .collect();

    return messages;
  },
});