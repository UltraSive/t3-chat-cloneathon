import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { catchError } from "$lib/handle";
import convexClient from "$lib/server/convex"
import { api } from '$convex/_generated/api.js';


// Define a Zod schema for action
const branchSchema = z.object({
  thread: z.string(),
  message: z.string()
});

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;

  if (!user) {
    return json({ success: false, message: 'Unauthenticated request.' }, { status: 401 });
  }

  const body = await request.json();
  const validatedBody = branchSchema.safeParse(body);

  if (!validatedBody.success) {
    return json({ success: false, message: validatedBody.error.flatten() }, { status: 400 });
  }

  const data = validatedBody.data;
  const { thread, message } = data;

  const [branchErr, branchMutation] = await catchError(convexClient.mutation(api.threads.branchThread, {
    thread,
    message
  }));

  if (branchErr) {
    return json({ success: false, message: "Error creating branch" }, { status: 400 });
  }

  return json({ success: true, branched: branchMutation.newThreadId }, { status: 200 });
};