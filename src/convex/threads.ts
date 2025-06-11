import { query, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from './_generated/api'; 

export const getPaginatedThreadsWithOldestMessage = query({
  args: {
    offset: v.number(),
    count: v.number(),
  },
  handler: async (ctx, { offset, count }) => {
    // Step 1: Get latest threads with offset + limit
    const allThreads = await ctx.db
      .query("threads")
      .withIndex("by_lastMessageAt")
      .order("desc")
      .collect();

    const paginatedThreads = allThreads.slice(offset, offset + count);

    // Step 2: For each thread, fetch the oldest message
    const results = await Promise.all(
      paginatedThreads.map(async (thread) => {
        const oldestMessage = await ctx.db
          .query("messages")
          .withIndex("by_thread", (q) => q.eq("thread", thread._id))
          .order("asc")
          .take(1);

        return {
          thread,
          oldestMessage: oldestMessage[0] ?? null,
        };
      })
    );

    return results;
  },
});

export const getThread = query({
  args: {
    thread: v.string(),
  },
  handler: async (ctx, { thread }) => {
    const threadId = thread as Id<'threads'>;

    const result = await ctx.db.get(threadId);
    if (!result) {
      throw new Error("Thread not found");
    }

    return result;
  },
});

export const getThreadWithMessages = query({
  args: {
    threadId: v.id("threads"),
    userId: v.string()
  },
  handler: async (ctx, { threadId, userId }) => {
    // Step 1: Get the thread
    const thread = await ctx.db.get(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Step 2: Check if thread belongs to the user
    if (thread.user !== userId) {
      throw new Error("Unauthorized access to thread");
    }

    // Step 3: Get the messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("thread", threadId))
      .order("asc") // Order by createdAt ascending
      .collect();

    return { thread, messages };
  },
});