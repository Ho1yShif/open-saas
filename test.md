# Local Development & Testing

Commands to run the app on localhost and verify everything works before deploying.

---

## Prerequisites

- [Wasp CLI](https://wasp.sh/docs/quick-start): `curl -sSL https://get.wasp.sh/installer.sh | sh`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the local Postgres DB)
- [Node.js 20+](https://nodejs.org/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for webhook testing)

---

## 1. Set Up Environment Files

```bash
cd template/app

# Copy server env example
cp .env.server.example .env.server

# Copy client env example
cp .env.client.example .env.client
```

Edit `.env.server` with your real values at minimum:

```env
# Required for core functionality
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...          # filled in Step 4
PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID=price_...
PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID=price_...
PAYMENTS_CREDITS_10_PLAN_ID=price_...
ADMIN_EMAILS=you@example.com
OPENAI_API_KEY=sk-...                    # required for AI demo

# Leave these blank/default for local dev (email sends to console):
# SENDGRID_API_KEY — not needed locally (Dummy provider logs to console)
```

Edit `.env.client` — you can leave it empty for local dev (skip Google Analytics):

```env
# Leave this empty to skip Google Analytics locally
# REACT_APP_GOOGLE_ANALYTICS_ID=G-...
```

---

## 2. Start the Local Database

In a dedicated terminal window:

```bash
cd template/app
wasp start db
```

Keep this running. Wasp spins up a Postgres container via Docker.

---

## 3. Run Database Migrations

In a new terminal window:

```bash
cd template/app
wasp db migrate-dev
```

This applies all Prisma migrations to your local database. Run this whenever `schema.prisma` changes.

---

## 4. (Optional) Seed the Database with Mock Data

```bash
cd template/app
wasp db seed
```

This creates fake users (defined in `src/server/scripts/dbSeeds.ts`) for testing the admin dashboard and user list.

---

## 5. Start the Dev Server

```bash
cd template/app
wasp start
```

This starts both services concurrently:
- **Client** → http://localhost:3000
- **Server** → http://localhost:3001

The terminal will show both client and server logs. Hot reload is enabled for both.

---

## 6. Verify Core Pages

| URL | What to check |
|---|---|
| http://localhost:3000 | Landing page loads |
| http://localhost:3000/signup | Can sign up with email |
| http://localhost:3000/login | Can log in |
| http://localhost:3000/pricing | Pricing plans display |
| http://localhost:3000/demo-app | AI task scheduler (requires login) |
| http://localhost:3000/account | Account/subscription management |
| http://localhost:3000/admin | Admin dashboard (requires admin email) |
| http://localhost:3000/admin/users | User management |

---

## 7. Check Email Verification (Dummy Provider)

When you sign up locally, Wasp uses the `Dummy` email provider — it does **not** send a real email. Instead, the verification link is printed to the **server console**.

Look for output like:

```
[server] Sending email to: you@example.com
[server] Email verification URL: http://localhost:3000/email-verification?token=...
```

Copy and open that URL to verify your account.

---

## 8. Test Stripe Payments Locally

You need the Stripe CLI to forward webhooks to your local server.

### Start Stripe webhook forwarding

In a separate terminal:

```bash
stripe listen --forward-to localhost:3001/payments-webhook
```

This outputs your local webhook secret:
```
> Ready! Your webhook signing secret is whsec_... (^C to quit)
```

Copy the `whsec_...` value and add it to `.env.server`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart `wasp start` after updating env vars.

### Test a payment flow

1. Go to http://localhost:3000/pricing
2. Click a plan to start checkout
3. Use Stripe test cards:
   - **Success**: `4242 4242 4242 4242` (any future expiry, any CVC)
   - **Requires auth**: `4000 0025 0000 3155`
   - **Decline**: `4000 0000 0000 9995`
4. After completing checkout, check http://localhost:3000/account — subscription status should update

---

## 9. Test the AI Demo (OpenAI)

1. Log in and go to http://localhost:3000/demo-app
2. Create a task (e.g., "Learn React")
3. Click **Generate Schedule** — calls OpenAI to create a daily task schedule
4. Response streams in and saves to the database
5. Verify credits deduct for non-subscribers in http://localhost:3000/account

> Requires `OPENAI_API_KEY` in `.env.server`.

---

## 10. Test Admin Dashboard

1. Sign up using an email listed in `ADMIN_EMAILS` in `.env.server`
2. Verify email (see Step 7)
3. Visit http://localhost:3000/admin
4. Should see the analytics dashboard (page views will be 0 without Plausible configured — that's fine)
5. Visit http://localhost:3000/admin/users to see the user list (seed first for more data — see Step 4)

---

## 11. Run End-to-End Tests (Playwright)

The E2E tests require the app to already be running (Steps 2-5 done) and Stripe forwarding active (Step 8).

```bash
# From a new terminal
cd template/e2e-tests

# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests with UI
SKIP_EMAIL_VERIFICATION_IN_DEV=true npx playwright test --ui

# Or run headless
SKIP_EMAIL_VERIFICATION_IN_DEV=true npx playwright test
```

---

## 12. Check the Server API Directly

Verify the server is healthy:

```bash
# Health check
curl http://localhost:3001/

# Should return 200 or a Wasp response
```

---

## Common Issues

**`wasp start db` fails** — Make sure Docker Desktop is running.

**`wasp db migrate-dev` fails** — Make sure `wasp start db` is running in another terminal first.

**Payment webhook not triggering** — Make sure `stripe listen --forward-to localhost:3001/payments-webhook` is running and `STRIPE_WEBHOOK_SECRET` in `.env.server` matches the one output by the Stripe CLI.

**OpenAI call fails** — Check that `OPENAI_API_KEY` is set in `.env.server` and the key is valid/has credits.

**Admin dashboard shows no analytics data** — Expected. Plausible is not configured locally. The `dailyStatsJob` will log an error but won't crash the app.

**Port already in use** — Kill existing processes:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```
