# DEALCHECK MVP — test build

This build combines the DEALCHECK product specification with the supplied Stripe test checkout.

## Current test monetization
- $3.00 charged now
- 7-day trial period
- then $30.00/week
- Stripe test mode

The pricing is deliberately kept exactly as requested for the current test. Replace the Stripe prices later when the final commercial model is approved.

## Product flow
1. Landing page
2. Product URL OR screenshot
3. Manual fallback: product name + price + currency
4. AI analysis using fresh web evidence
5. Free result
6. Premium paywall
7. Stripe payment
8. Server-side webhook marks Premium only after Stripe confirms the invoice/payment
9. Full report

## Environment variables
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- WEEKLY_PRICE_ID — recurring $30/week test price
- TRIAL_PRICE_ID — one-time $3 test price
- OPENAI_API_KEY
- OPENAI_MODEL — set to the strongest vision/web-search capable model enabled in your OpenAI account; default in this test is `gpt-5.4`

## Stripe webhook
Configure a Stripe webhook endpoint:
`https://YOUR-DOMAIN/api/webhook`

At minimum subscribe to:
- invoice.paid
- invoice.payment_failed
- customer.subscription.deleted
- customer.subscription.paused

Stripe webhooks should be signature-verified. Premium is not granted merely because the browser displays a payment success state.

## Important
This is a test MVP, not production-ready billing/legal infrastructure. Before launch, add a persistent database, authenticated accounts, rate limiting, abuse protection, source-specific parsers, country restrictions, legal pages, notification infrastructure and robust product matching.
