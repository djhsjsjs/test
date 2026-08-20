# DEALCHECK — Vercel test deployment

## What this build is for
Test version of DEALCHECK with:
- product URL input
- screenshot/manual product fallback
- free analysis flow
- Premium paywall
- Stripe test subscription flow: $3 now, 7-day trial/transition, then $30/week according to the supplied test Stripe project
- server-side subscription confirmation architecture
- fresh-source analysis architecture

## 1. GitHub
Create a new repository and upload the contents of this folder (not the ZIP file itself).

## 2. Vercel
1. Open https://vercel.com/new
2. Import the GitHub repository.
3. Leave Framework/Build settings on auto-detect unless Vercel shows an error.
4. Deploy.

Vercel supports importing a Git repository and automatically detecting the framework/build settings.

## 3. Environment variables
Open:
Vercel Project -> Settings -> Environment Variables

Add every variable from `.env.example` with your real TEST values.

IMPORTANT:
- Never commit `.env`, `.env.local`, Stripe secret keys, webhook secrets, or AI API keys to GitHub.
- `pk_test_...` may be used by the browser; `sk_test_...` and `whsec_...` must remain server-side.
- Use Stripe TEST mode while testing.

## 4. Stripe test mode
Create/configure the test product and recurring price in Stripe TEST mode, then put its Price ID into:
STRIPE_PRICE_ID

After the Vercel deployment has a stable URL, configure the Stripe TEST webhook endpoint to the webhook route implemented by this project.

The exact webhook URL depends on the project's route. If the project exposes `/api/stripe/webhook`, use:
https://YOUR-DOMAIN.vercel.app/api/stripe/webhook

Use the Stripe webhook signing secret as:
STRIPE_WEBHOOK_SECRET

Do not unlock Premium only from a client-side success screen. Premium access should be granted after the server verifies the Stripe event.

## 5. AI
Add the chosen AI provider key to the server-side environment variable.
Do not put private API keys into variables prefixed with NEXT_PUBLIC_.

## 6. Test checklist
1. Open the Vercel URL.
2. Submit a product URL.
3. Test screenshot upload.
4. Test manual product fallback when identification fails.
5. Confirm free result.
6. Open Premium paywall.
7. Test Stripe in TEST mode.
8. Confirm the subscription event reaches the webhook.
9. Confirm Premium unlock happens only after server confirmation.
10. Test cancellation/failed-payment states.

## Important
This is a TEST deployment package, not a final production release. The pricing model is intentionally the supplied test model and can be replaced later with the final DEALCHECK pricing.
