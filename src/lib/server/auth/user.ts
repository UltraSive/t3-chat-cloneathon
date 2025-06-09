import db from "$lib/server/drizzle";
import { users, oauthAccounts } from '$lib/server/drizzle/schema';
import type { User, Session, NewSession } from '$lib/server/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function getUserFromEmail(email: string): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function getUserFromId(id: string): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function createUserFromProvider(provider: string, id: string, email: string, name: string): Promise<User> {
  // Create new user and oauth account
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
    })
    .returning();

  await db.insert(oauthAccounts).values({
    providerId: provider,
    providerUserId: id,
    userId: newUser.id,
  });

  return newUser;
}

export async function getUserFromProviderId(provider: string, id: string): Promise<User | null> {
  const account = await db.query.oauthAccounts.findFirst({
    where: and(
      eq(oauthAccounts.providerId, provider),
      eq(oauthAccounts.providerUserId, id)
    ),
    with: {
      user: true,
    },
  });

  return account?.user ?? null;
}