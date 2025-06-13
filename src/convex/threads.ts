import { query, internalQuery, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from './_generated/api'; 

export const createUserThread = mutation({
  args: {
    description: v.optional(v.string()),
    user: v.string(),
    parentThread: v.optional(v.string()),
  },
  handler: async (ctx, { description, user, parentThread }) => {
    const parentThreadId = parentThread as Id<'threads'>;

    const now = new Date().toISOString();

    const threadId = await ctx.db.insert("threads", {
      description,
      user,
      parentThread: parentThreadId,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      status: "processing",
    });

    return threadId;
  },
});

export const getUserPaginatedThreadsWithOldestMessage = query({
  args: {
    offset: v.number(),
    count: v.number(),
    user: v.string(),
  },
  handler: async (ctx, { offset, count, user }) => {
    // Step 1: Get threads for this user
    const userThreads = await ctx.db
      .query("threads")
      .withIndex("by_user_lastMessageAt", (q) => q.eq("user", user))
      .order("desc")
      .collect();

    const paginatedThreads = userThreads.slice(offset, offset + count);

    // Step 2: Get the oldest message in each thread
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

export const getUserThreadWithMessages = query({
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

    return { thread: result, messages };
  },
});