import { query } from "./_generated/server";
import { v } from "convex/values";

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
