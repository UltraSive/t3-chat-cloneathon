import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { catchError } from "$lib/handle";

import convexClient from "$lib/server/convex"
import { api } from '$convex/_generated/api.js';

import { OPENROUTER_API_KEY } from '$env/static/private';



// Define a Zod schema for action
const chatSchema = z.object({
  thread: z.optional(z.string()),
  model: z.string(),
  message: z.string()
});

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;

  if (!user) {
    return json({ success: false, message: 'Unauthenticated request.' }, { status: 401 });
  }

  const body = await request.json();
  const validatedBody = chatSchema.safeParse(body);

  if (!validatedBody.success) {
    return new Response(JSON.stringify({ error: validatedBody.error.format() }), {
      status: 400,
    });
  }

  const data = validatedBody.data;
  const { thread, model, message } = data;

  const [threadErr, threadQuery] = await catchError(convexClient.query(api.threads.getThread, {
    thread,
  }));

  if (threadErr) {
    return json({ success: false, message: "Thread not found." }, { status: 400 });
  }

  if (threadQuery.user !== user.id) {
    return json({ success: false, message: "User does not have access to thread." }, { status: 400 });
  }

  const [userErr, userMutation] = await catchError(convexClient.mutation(api.messages.createMessage, {
    threadId: threadQuery._id,
    role: "user",
    content: message,
    status: "finished",
    user: user.id
  }));

  const [assistantErr, assistantMutation] = await catchError(convexClient.mutation(api.messages.createMessage, {
    threadId: threadQuery._id,
    role: "assistant",
    content: "",
    status: "processing",
    user: user.id
  }));

  if (assistantErr) {
    console.error(assistantErr)
    return json({ success: false, message: "Assistants message couldn't be created." }, { status: 400 });
  }

  const relayBody = {
    //model: "openai/gpt-4o-mini",
    model,
    messages: [{
      role: "user",
      content: message
    }],
    temperature: 1,
    max_tokens: 256,
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
    return json({ success: false, message: 'No response body.' }, { status: 500 });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let content = ''; // 👈 initialize accumulator

  let updateTimer: NodeJS.Timeout | null = null;
  function scheduleUpdate() {
    if (updateTimer) return;
    updateTimer = setTimeout(async () => {
      updateTimer = null;
      try {
        await convexClient.mutation(api.messages.updateMessage, {
          message: assistantMutation,
          content,
          status: "processing"
        });
      } catch (err) {
        console.error("Convex update error:", err);
      }
    }, 250);
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
            content += delta; // 👈 append to full content
            scheduleUpdate();
          }

          await convexClient.mutation(api.messages.updateMessage, {
            message: assistantMutation,
            content,
            status: "processing"
          })
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }

  await convexClient.mutation(api.messages.updateMessage, {
    message: assistantMutation,
    content,
    status: "finished"
  })

  return json({ success: true }, { status: 200 });
};