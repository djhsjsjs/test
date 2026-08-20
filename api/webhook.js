const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;
    if (event.type === 'invoice.paid') {
      const subscriptionId = obj.subscription;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await stripe.subscriptions.update(subscriptionId, {
            metadata: { ...subscription.metadata, premium_granted: 'true' }
          });
        }
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
      await stripe.subscriptions.update(obj.id, {
        metadata: { ...obj.metadata, premium_granted: 'false' }
      });
    }

    if (event.type === 'invoice.payment_failed') {
      await stripe.subscriptions.update(obj.subscription, {
        metadata: { ...((await stripe.subscriptions.retrieve(obj.subscription)).metadata), premium_granted: 'false' }
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
