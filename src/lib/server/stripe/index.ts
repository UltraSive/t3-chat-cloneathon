import Stripe from 'stripe'
import db from "$lib/server/drizzle";
import { PRIVATE_STRIPE_KEY } from '$env/static/private';
import { users } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';

// export the stripe instance
export const stripe = new Stripe(PRIVATE_STRIPE_KEY);

export default stripe;

export async function ensureStripeCustomerId(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return null
  }

  if (!user.stripeCustomerId) {
    console.log('Creating stripe customer for user', userId)
    const customer = await stripe.customers.create({
      description: `Customer for user_id ${user.id}`,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: {
        userId: user.id,
      },
      // you can add more customer details here
    });
    await db
      .update(users)
      .set({
        stripeCustomerId: customer.id,
      })
      .where(eq(users.id, user.id));

    return customer.id;
  }

  return user.stripeCustomerId;
}