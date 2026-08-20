const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name, userId } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email обязателен' });

    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { dealcheck_user_id: userId || '' }
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.WEEKLY_PRICE_ID }],
      trial_period_days: 7,
      add_invoice_items: [{ price: process.env.TRIAL_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      metadata: { dealcheck_user_id: userId || '', premium_granted: 'false' },
      expand: ['latest_invoice.payment_intent']
    });

    const paymentIntent = subscription.latest_invoice?.payment_intent;
    if (!paymentIntent?.client_secret) {
      return res.status(500).json({ error: 'Stripe не вернул client_secret для оплаты.' });
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Ошибка создания подписки' });
  }
};
