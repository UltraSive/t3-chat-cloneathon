import { db } from '$lib/server/drizzle';
import { sessions } from '$lib/server/drizzle/schema';
import type { User, Session, NewSession } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { RequestEvent } from "@sveltejs/kit";

export const sessionCookieName = "session";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string, userId: string): Promise<NewSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const now = new Date();

  const [inserted] = await db
    .insert(sessions)
    .values({
      id: sessionId,
      userId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days
    })
    .returning();
    
  return inserted;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: {
      user: true,
    },
  });
  if (!session) {
    return { session: null, user: null };
  }
  const user = session.user;
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessions)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessions.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(token: string): Promise<void> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
  const isLocalhost = event.url.hostname === "localhost";

  event.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    ...(isLocalhost ? {} : { domain: `.${event.url.hostname}` }) // Set domain only if not localhost
  });
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
  const isLocalhost = event.url.hostname === "localhost";

  event.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    ...(isLocalhost ? {} : { domain: `.${event.url.hostname}` }) // Set domain only if not localhost
  });
}