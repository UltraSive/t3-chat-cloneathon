import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit'
import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth/session';

export const GET: RequestHandler = async (event) => {
  const sessionId = event.cookies.get("session");
  if (!sessionId) {
    throw redirect(302, '/')
  }

  await invalidateSession(sessionId);
  deleteSessionTokenCookie(event);
  throw redirect(302, '/');
}