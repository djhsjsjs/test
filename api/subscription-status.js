const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const id = String(req.query.subscriptionId || '');
    if (!id) return res.status(400).json({ error: 'subscriptionId is required.' });
    const sub = await stripe.subscriptions.retrieve(id);
    const premium = sub.metadata?.premium_granted === 'true' && ['active', 'trialing'].includes(sub.status);
    return res.status(200).json({
      premium,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      customerId: sub.customer
    });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Could not check subscription.' });
  }
};
