import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { stripe, ensureStripeCustomerId } from "$lib/server/stripe"
import { PUBLIC_STRIPE_PRICE_ID } from "$env/static/public";

export const GET: RequestHandler = async ({ locals, url }) => {
  const { user } = locals;

  if (!user || user.stripeSubscriptionId) {
    throw redirect(302, "/");
  }

  const stripeCustomerId = await ensureStripeCustomerId(user.id);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId!,
    line_items: [{ price: PUBLIC_STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${url.origin}`,
    cancel_url: `${url.origin}/settings/account`
  });

  throw redirect(303, session.url!);
};