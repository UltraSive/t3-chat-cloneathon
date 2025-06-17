import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { stripe, ensureStripeCustomerId } from "$lib/server/stripe"

export const GET: RequestHandler = async ({ locals, url }) => {
  const { user } = locals;

  if (!user || !user.stripeSubscriptionId) {
    throw redirect(302, "/");
  }

  const stripeCustomerId = await ensureStripeCustomerId(user.id);

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId!,
    return_url: `${url.origin}/settings/account`, // Where to redirect after exiting the portal
  });

  console.log(session);

  throw redirect(303, session.url!);
};