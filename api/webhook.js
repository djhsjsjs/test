const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (obj.subscription) {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);
        const active = ['active', 'trialing'].includes(subscription.status);
        await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            premium_granted: active ? 'true' : 'false'
          }
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const active = ['active', 'trialing'].includes(obj.status);
      await stripe.subscriptions.update(obj.id, {
        metadata: { ...obj.metadata, premium_granted: active ? 'true' : 'false' }
      });
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
      await stripe.subscriptions.update(obj.id, {
        metadata: { ...obj.metadata, premium_granted: 'false' }
      });
    }

    if (event.type === 'invoice.paid' && obj.subscription) {
      const subscription = await stripe.subscriptions.retrieve(obj.subscription);
      if (['active', 'trialing'].includes(subscription.status)) {
        await stripe.subscriptions.update(subscription.id, {
          metadata: { ...subscription.metadata, premium_granted: 'true' }
        });
      }
    }

    if (event.type === 'invoice.payment_failed' && obj.subscription) {
      const subscription = await stripe.subscriptions.retrieve(obj.subscription);
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...subscription.metadata, premium_granted: 'false' }
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

// Stripe signature verification needs the original request body.
module.exports.config = { api: { bodyParser: false } };
