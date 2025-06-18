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
    model: v.string(),
  },
  handler: async (ctx, { threadId, role, content, user, model }) => {
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
      model
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

export const modifyMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newContent: v.string(),
  },
  handler: async (ctx, { messageId, newContent }) => {
    // 1. Validate and fetch the original message
    const originalMessage = await ctx.db.get(messageId);
    if (!originalMessage) {
      throw new Error(`Message with ID ${messageId} not found.`);
    }

    const threadId = originalMessage.thread;
    const now = new Date().toISOString();

    // 2. Update the original message's content
    await ctx.db.patch(messageId, {
      content: newContent,
      updatedAt: now, // Optionally update the timestamp
    });

    // 3. Fetch and update subsequent messages
    const subsequentMessages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) =>
        q.eq("thread", threadId) // Filter by the relevant thread
      )
      .filter((msg) => new Date(msg.createdAt).getTime() > new Date(originalMessage.createdAt).getTime())
      .collect();

    // 4. Update status of subsequent messages to "archived"
    if (subsequentMessages.length > 0) {
      const updatePromises = subsequentMessages.map((msg) =>
        ctx.db.patch(msg.id, {
          status: "archived",
        })
      );
      await Promise.all(updatePromises);
    }
    
    return { messageId, updatedContent: newContent, archivedCount: subsequentMessages.length };
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

export const getFinishedMessagesFromThread = query({
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

    // Step 3: Get messages for each status
    const finishedMessages = await ctx.db
      .query("messages")
      .withIndex("by_thread_status_createdAt", (q) =>
        q.eq("thread", threadId).eq("status", "finished")
      )
      .order("asc")
      .collect();

    const branchedMessages = await ctx.db
      .query("messages")
      .withIndex("by_thread_status_createdAt", (q) =>
        q.eq("thread", threadId).eq("status", "branched")
      )
      .order("asc")
      .collect();

    const sharedMessages = await ctx.db
      .query("messages")
      .withIndex("by_thread_status_createdAt", (q) =>
        q.eq("thread", threadId).eq("status", "shared")
      )
      .order("asc")
      .collect();

    // Combine the messages
    const combinedMessages = [...finishedMessages, ...branchedMessages, ...sharedMessages];

    // Sort based on createdAt safely
    const sortedMessages = combinedMessages.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      // Ensure both dates are valid before subtracting
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0; // Handle invalid date cases
      }

      return dateA.getTime() - dateB.getTime(); // Sort ascending based on createdAt
    });

    return sortedMessages;
  },
});

export const getAssistantMessageCounts = query({
  args: {
    user: v.string(),
    anchorDate: v.number(), // Expecting ISO string format for the anchor date
    window: v.optional(v.union(v.literal("monthly"), v.literal("daily")))
  },
  handler: async (ctx, { user, anchorDate }) => {
    // Step 1: Parse the anchor date
    const anchorDateTime = new Date(anchorDate);

    // Step 2: Determine the current window based on the anchor date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate the start of the window
    const startWindow = new Date(anchorDateTime);
    startWindow.setHours(anchorDateTime.getHours(), anchorDateTime.getMinutes(), anchorDateTime.getSeconds(), 0);

    // Check if the start window is within the same month as the current date
    if (startWindow.getFullYear() === currentYear && startWindow.getMonth() === currentMonth) {
      // If start window is within the current month, do nothing
    } else {
      // If start window is in the past, loop until we find the next window
      while (startWindow < currentDate) {
        const nextMonth = startWindow.getMonth() + 1;
        const nextYear = nextMonth === 12 ? startWindow.getFullYear() + 1 : startWindow.getFullYear();
        startWindow.setMonth(nextMonth);
        startWindow.setFullYear(nextYear);
      }
    }

    // Calculate the end of the window
    const endWindow = new Date(startWindow);
    endWindow.setMonth(endWindow.getMonth() + 1);

    console.log(startWindow, endWindow);

    // Step 3: Query for messages from the user with the assistant role in the calculated date range
    const finishedMessages = await ctx.db
      .query("messages")
      .withIndex("by_user_role_status", (q) =>
        q.eq("user", user)
          .eq("role", "assistant")
          .eq("status", "finished") // First query for finished status
          .gt("_creationTime", startWindow.getTime()) // Start of window
          .lt("_creationTime", endWindow.getTime()) // End of window
      )
      .collect();

    const processingMessages = await ctx.db
      .query("messages")
      .withIndex("by_user_role_status", (q) =>
        q.eq("user", user)
          .eq("role", "assistant")
          .eq("status", "processing") // Second query for processing status
          .gt("_creationTime", startWindow.getTime()) // Start of window
          .lt("_creationTime", endWindow.getTime()) // End of window
      )
      .collect();

    // Combine results
    const allMessages = [...finishedMessages, ...processingMessages];

    // Step 4: Count the total messages
    const totalCount = allMessages.length;

    // Step 5: Count the premium messages
    const premiumCount = allMessages.filter(message => message.premium === true).length;

    // Step 6: Return the results
    return {
      totalCount,
      premiumCount
    };
  },
});