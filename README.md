# DEALCHECK — full Vercel-ready version

This version implements the product direction agreed for DEALCHECK:
- English-only premium cream/white design
- Product link, screenshot or manual product input
- First analysis free in the UI
- AI product/price/value/risk analysis
- Live market research through OpenAI Web Search
- Fair-price range and overpayment estimate
- Best places to buy with source links
- Alternatives, pros/cons and sources
- Email-only lightweight profile flow
- Dashboard, history, profile and subscription pages
- Stripe subscription Checkout
- Stripe webhook foundation
- Mobile responsive design

## Important
The browser profile/history in this version uses localStorage so you can test the complete UX immediately. It is NOT a secure multi-device authentication/database system. Before public launch, connect a real auth + database provider (for example Supabase/Neon/Postgres) and move history/profile/subscription state server-side.

## Environment variables
Copy `.env.example` to `.env.local` for local development or add the same variables in Vercel.

Required:
OPENAI_API_KEY
OPENAI_MODEL=gpt-5.6
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID

`SEARCH_API_KEY` is retained only for compatibility with the older project. This version uses OpenAI's built-in Web Search, so it is not required by the new analyzer.

## Run
npm install
npm run dev

## Deploy
Push the folder to GitHub and connect it to Vercel. Add environment variables in Vercel and redeploy after changing them.

## Stripe
Create a recurring Stripe Price and put its `price_...` ID in STRIPE_PRICE_ID. Configure a Stripe webhook pointing to:
https://YOUR-DOMAIN/api/stripe/webhook
and copy its `whsec_...` signing secret into STRIPE_WEBHOOK_SECRET.

The Stripe customer portal can be enabled later for self-service billing management.

## OpenAI
Use a model ID that is actually available to your API project. `gpt-5.6` is the default in this template. `gpt-5.6-luna` should NOT be used unless your API account explicitly exposes that exact model ID.

## Security
Never commit `.env`, `.env.local`, Stripe secret keys, webhook secrets or OpenAI API keys to GitHub.
