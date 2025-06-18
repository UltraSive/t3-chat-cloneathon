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

export const branchThread = mutation({
  args: {
    thread: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { thread, message }) => {
    const parentThreadId = thread as Id<'threads'>;
    const branchFromMessageId = message as Id<'messages'>;

    // 1. Validate inputs and fetch necessary data
    const parentThread = await ctx.db.get(parentThreadId);
    if (!parentThread) {
      throw new Error(`Parent thread with ID ${parentThreadId} not found.`);
    }

    const branchFromMessage = await ctx.db.get(branchFromMessageId);
    if (!branchFromMessage) {
      throw new Error(`Branch from message with ID ${branchFromMessageId} not found.`);
    }

    // Ensure the message belongs to the parent thread
    if (branchFromMessage.thread !== parentThreadId) {
      throw new Error(`Message ID ${branchFromMessageId} does not belong to thread ID ${parentThreadId}.`);
    }

    const now = new Date().toISOString();

    // 2. Create the new branched thread
    const newThreadId = await ctx.db.insert("threads", {
      description: `Branch from thread ${parentThread.description ? `'${parentThread.description}'` : parentThreadId}`,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      status: "processing", // Or "branched" if you prefer the new thread to start with that specific status
      parentThread: parentThreadId,
      user: parentThread.user, // Inherit user from parent thread
    });

    // 3. Clone messages from the parent thread up to the branchFromMessage (exclusive)
    // We need to fetch messages ordered by createdAt to ensure we get them in the correct sequence.
    // The 'by_thread' index (thread, createdAt) is perfect for this.
    let messagesToClone = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) =>
        q.eq("thread", parentThreadId)
          .lt("_creationTime", branchFromMessage._creationTime) // Filter by the parent thread
      )
      .order("asc") // Order by createdAt
      .collect();

    // Add in the cloned from message
    messagesToClone = [...messagesToClone, branchFromMessage];

    if (messagesToClone.length > 0) {
      // Use Promise.all to insert messages in parallel for efficiency
      const insertPromises = messagesToClone.map((msg) =>
        ctx.db.insert("messages", {
          // Keep relevant fields, but set new thread ID and fresh timestamps
          content: msg.content,
          createdAt: msg.createdAt, // Keep original creation time for historical accuracy within the new thread
          role: msg.role,
          status: msg.status, // Keep original status unless specified otherwise
          model: msg.model,
          token: msg.token,
          premium: msg.premium,
          user: msg.user,
          thread: newThreadId, // Assign to the new thread
        })
      );
      await Promise.all(insertPromises);
    }

    // 4. Update the status of the branchFromMessage in the parent thread
    await ctx.db.patch(branchFromMessageId, {
      status: "branched",
    });

    // Optionally, you might want to update the parent thread's status
    // For example, if branching means it's no longer actively "processing" in the same way.
    // await ctx.db.patch(parentThreadId, {
    //   status: "branched", // Or "finished" if no further activity is expected on the parent path
    //   updatedAt: now,
    // });

    return { newThreadId, parentThreadId, branchedMessageId: branchFromMessageId };
  },
});