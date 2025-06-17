import { stripe } from '$lib/server/stripe'
import { error, json } from '@sveltejs/kit'
import db from '$lib/server/drizzle'

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

      let user = await db.user.findUnique({
        where: {
          id: checkoutSessionCompleted.metadata.userId,
        },
      });

      const cartItems = JSON.parse(checkoutSessionCompleted.metadata.cartItems);
      console.log(cartItems);

      const subscription = await stripe.subscriptions.retrieve(checkoutSessionCompleted.subscription);

      for (let id of cartItems) {
        console.log("id: ", id);
        const cartItem = await db.cartItem.findUnique({
          where: {
            id: id,
          },
        })
        console.log("cartItem: ", cartItem)

        // get the item details
        const itemDetails = await getItem(cartItem);
        console.log("item details: ", itemDetails);

        let serviceId; // placeholder for the service id
        let serviceStatus = 'ALLOCATED'; // placeholder for the service status
        let stripeSubscriptionItem; // placeholder for the stripe subscription item id
      }
      break;
    case 'customer.subscription.deleted':
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // return a 200 with an empty JSON response
  return json({ success: true });
}