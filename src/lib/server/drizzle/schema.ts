import { pgTable, uuid, varchar, text, timestamp, integer, boolean, primaryKey, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const userPlanEnum = pgEnum('user_plan', ['free', 'pro']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
}));

// OAuthAccount table
export const oauthAccounts = pgTable('oauth_account', {
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.providerId, table.providerUserId] }),
    userIdx: index('oauth_account_user_idx').on(table.userId),
  };
});

export type OAuthAccount = InferSelectModel<typeof oauthAccounts>;
export type NewOAuthAccount = InferInsertModel<typeof oauthAccounts>;

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));

// Sessions table
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Individual models table
export const models = pgTable('models', {
  id: varchar('id', { length: 255 }).primaryKey(),
  provider: varchar('provider', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(), // internal model ID (e.g., "gpt-4")
  type: varchar('name', { length: 255 }),
  info: text('info'),
  contextLength: integer('context_length').notNull(),
  premium: boolean('premium'),
});

export type Model = InferSelectModel<typeof models>;
export type NewModel = InferInsertModel<typeof models>;