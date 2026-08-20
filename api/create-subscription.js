const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, userId } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({ error: 'Stripe price is not configured. Add STRIPE_PRICE_ID in Vercel.' });
    }

    const customer = await stripe.customers.create({
      email: normalizedEmail,
      metadata: { dealcheck_user_id: String(userId || '').slice(0, 120) }
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      metadata: {
        dealcheck_user_id: String(userId || '').slice(0, 120),
        premium_granted: 'false'
      },
      expand: ['latest_invoice.payment_intent']
    });

    const paymentIntent = subscription.latest_invoice?.payment_intent;
    if (!paymentIntent?.client_secret) {
      return res.status(500).json({ error: 'Stripe did not return a payment client secret.' });
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Could not create the subscription.' });
  }
};
