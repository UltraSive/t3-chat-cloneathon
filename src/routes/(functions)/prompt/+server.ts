import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { catchError } from "$lib/handle";
import { getModelById } from '$lib/server/drizzle/queries';
import convexClient from "$lib/server/convex"
import { api } from '$convex/_generated/api.js';

import { OPENROUTER_API_KEY } from '$env/static/private';

function createSystemPrompt(nickname: string, occupation: string, traits: string[], additionalInfo: string) {
  let prompt = "You are an assistant with the following preferences:\n";

  if (nickname) {
    prompt += `- User prefers to be called "${nickname}".\n`;
  }

  if (occupation) {
    prompt += `- User is an "${occupation}".\n`;
  }

  if (traits && traits.length > 0) {
    prompt += `- User wants you to exhibit the following traits: ${traits.join(", ")}.\n`;
  }

  if (additionalInfo) {
    prompt += `- Additional information: ${additionalInfo}.\n`;
  }

  if (!nickname && !occupation && !traits.length &&
    !additionalInfo) {
    prompt += "There are no specific preferences provided.\n";
  }

  prompt += "Please assist the user accordingly.";

  return prompt;
}

interface Message {
  role: string;
  content: string;
}

async function processRelay(model: string, messages: Message[], responseId: string) {
  const relayBody = {
    //model: "openai/gpt-4o-mini",
    model,
    messages,
    temperature: 1,
    //max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://chat.ultrasive.com',
      'X-Title': 'My App Chat Save',
    },
    body: JSON.stringify({
      ...relayBody,
      stream: true
    })
  });

  if (!response.body) {
    console.error("No openrelay response body")
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let content = '';
  let nextTask: (() => Promise<void>) | null = null;
  let processing = false;

  function enqueueLatestUpdate(status: string) {
    // Replace any existing pending task with the latest one
    nextTask = async () => {
      try {
        await convexClient.mutation(api.messages.updateMessage, {
          message: responseId,
          content,
          status
        });
      } catch (err) {
        console.error("Convex update error:", err);
      }
    };

    if (!processing) {
      processNextTask();
    }
  }

  async function processNextTask() {
    processing = true;

    while (nextTask) {
      const task = nextTask;
      nextTask = null; // Clear the task reference before running

      await task();
    }

    processing = false;
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let lineEnd;
    while ((lineEnd = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);

      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const message = JSON.parse(data);
          const delta = message.choices?.[0]?.delta?.content;

          if (delta) {
            content += delta;
            enqueueLatestUpdate("processing");
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }

  enqueueLatestUpdate("finished");
  /*await new Promise(resolve => setTimeout(resolve, 300));
  await convexClient.mutation(api.messages.updateMessage, {
    message: responseId,
    content,
    status: "finished"
  });*/
}

// Define a Zod schema for action
const chatSchema = z.object({
  thread: z.optional(z.string()),
  modify: z.optional(z.string()), // Used to edit a message or retry (if you use the same message)
  model: z.string(),
  message: z.string(),
  search: z.optional(z.boolean())
});

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;

  if (!user) {
    return json({ success: false, message: 'Unauthenticated request.' }, { status: 401 });
  }

  const body = await request.json();
  const validatedBody = chatSchema.safeParse(body);

  if (!validatedBody.success) {
    return json({ success: false, message: validatedBody.error.flatten() }, { status: 400 });
  }

  const data = validatedBody.data;
  const { thread, model, message } = data;

  const [modelErr, foundModel] = await catchError(getModelById(model));

  if (modelErr) {
    return json({ success: false, message: "Model not found" }, { status: 400 });
  }

  const [countErr, countQuery] = await catchError(convexClient.query(api.messages.getAssistantMessageCounts, {
    user: user.id,
    anchorDate: user.createdAt.getTime()
  }));

  if (countErr) {
    console.log(countErr);
    return json({ success: false, message: "Error calculating messages left" }, { status: 400 });
  }

  if (user.stripeSubscriptionId) {
    if (countQuery.totalCount > 1500) {
      return json({ success: false, message: "Message limit exceeded" }, { status: 400 });
    }
  } else {
    if (countQuery.totalCount > 10) {
      return json({ success: false, message: "Message limit exceeded" }, { status: 400 });
    }
  }

  let referencedThread;
  let formattedHistory: Message[] = [];

  if (thread) {
    const [threadErr, threadQuery] = await catchError(convexClient.query(api.threads.getThread, {
      thread,
    }));

    if (threadErr) {
      return json({ success: false, message: "Thread not found." }, { status: 400 });
    }

    if (threadQuery.user !== user.id) {
      return json({ success: false, message: "User does not have access to thread." }, { status: 400 });
    }

    referencedThread = threadQuery._id;

    const [historyErr, historyQuery] = await catchError(convexClient.query(api.messages.getFinishedMessagesFromThread, {
      thread: referencedThread,
      user: user.id,
    }));

    if (!historyErr) {
      formattedHistory = (historyQuery ?? []).map(({ role, content }) => ({
        role,
        content
      }));
    }
  } else {
    const [threadErr, threadMutation] = await catchError(convexClient.mutation(api.threads.createUserThread, {
      user: user.id,
    }));

    if (threadErr) {
      return json({ success: false, message: "Error creating thread" }, { status: 400 });
    }

    referencedThread = threadMutation;
  }

  const [userErr, userMutation] = await catchError(convexClient.mutation(api.messages.createUserMessage, {
    threadId: referencedThread,
    role: "user",
    content: message,
    status: "finished",
    user: user.id,
    model
  }));

  const [assistantErr, assistantMutation] = await catchError(convexClient.mutation(api.messages.createUserMessage, {
    threadId: referencedThread,
    role: "assistant",
    content: "",
    status: "processing",
    user: user.id,
    model
  }));

  if (assistantErr) {
    console.error(assistantErr)
    return json({ success: false, message: "Assistants message couldn't be created." }, { status: 400 });
  }

  const messages = [
    {
      role: "system",
      content: createSystemPrompt(user.nickname, user.occupation, user.traits, user.additionalInfo)
    },
    ...formattedHistory ?? [],
    {
      role: "user",
      content: message
    }
  ];

  console.log(messages);

  processRelay(model, messages, assistantMutation);

  return json({ success: true, thread: referencedThread }, { status: 200 });
};