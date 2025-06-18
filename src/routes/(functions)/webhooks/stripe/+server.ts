import { stripe } from '$lib/server/stripe'
import { error, json } from '@sveltejs/kit'
import { db } from '$lib/server/drizzle';
import { users } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getUserByStripeCustomerId } from '$lib/server/drizzle/queries';

import { PRIVATE_STRIPE_WEBHOOK_SECRET } from '$env/static/private';

// endpoint to handle incoming webhooks
export async function POST({ request }) {
  // extract body
  const body = await request.text();
  //console.log(body);

  // get the signature from the header
  const signature = request.headers.get('stripe-signature')
  //console.log(signature);

  // var to hold event data.
  let event

  // verify it
  try {
    event = stripe.webhooks.constructEvent(body, signature, PRIVATE_STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    // signature is invalid!
    console.warn('⚠️  Webhook signature verification failed.', err.message)

    // return, because it's a bad request
    error(400, 'Invalid request');
  }

  // signature has been verified, so we can process events
  // Handle the event
  switch (event.type) {
    /*case 'invoice.paid':
      const invoicePaid = event.data.object;
      console.log("Invoice Paid: ", invoicePaid);
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      break;
      */
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      console.log("Checkout session completed: ", checkoutSessionCompleted);

      const checkoutSessionCustomerId = checkoutSessionCompleted.customer
      const checkoutSessionSubscriptionId = checkoutSessionCompleted.items.data[0].subscription
      console.log("Subscription Id: ", checkoutSessionSubscriptionId);

      const checkoutSessionUser = await getUserByStripeCustomerId(checkoutSessionCustomerId);

      await db
        .update(users)
        .set({
          stripeSubscriptionId: checkoutSessionCustomerId,
          subscribedAt: new Date()
        })
        .where(eq(users.id, checkoutSessionUser.id));
      break;
    case 'customer.subscription.deleted':
      const customerSubscriptionDeleted = event.data.object;
      console.log("Checkout session completed: ", customerSubscriptionDeleted);

      const stripeCustomerId = customerSubscriptionDeleted.customer
      const stripeSubscriptionId = customerSubscriptionDeleted.items.data[0].subscription
      console.log("Subscription Id: ", stripeSubscriptionId);

      const user = await getUserByStripeCustomerId(stripeCustomerId);

      await db
        .update(users)
        .set({
          stripeSubscriptionId: null,
          subscribedAt: null
        })
        .where(eq(users.id, user.id));
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // return a 200 with an empty JSON response
  return json({ success: true });
}