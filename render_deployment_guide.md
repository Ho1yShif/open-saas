# Render Deployment Guide (Minimal)

This guide covers deploying Open SaaS on Render with a minimal feature set:
- **Keeping**: Email auth, OpenAI (AI demo), Stripe payments, admin dashboard
- **Skipping**: Google Analytics, Plausible Analytics, Google/GitHub OAuth, AWS S3 file uploads

---

## Prerequisites

- [Wasp CLI](https://wasp.sh/docs/quick-start) installed (`curl -sSL https://get.wasp.sh/installer.sh | sh`)
- [Node.js 20+](https://nodejs.org/)
- A [Render](https://render.com) account
- A [Stripe](https://stripe.com) account (test mode is fine to start)
- A [SendGrid](https://sendgrid.com) account (free tier works) for email verification
- An [OpenAI](https://platform.openai.com) API key

---

## Step 1: Pre-flight Code Changes

Before building, make a few small changes to the app.

### 1a. Copy the environment variables template

An `.env.example` file at the root of this project lists every variable you'll need. Use it as a checklist — fill in each value as you work through the steps below.

```bash
cp .env.example .env.render   # or just open .env.example and paste values into Render as you go
```

> Never commit a filled-in env file to git. `.env.example` contains only blank placeholders and is safe to commit.

### 1b. Set up SendGrid and update main.wasp

SendGrid's free tier allows 100 emails/day with no expiration — enough for an early-stage app.

**Create a SendGrid account:**
1. [Go to SendGrid](https://login.sendgrid.com/unified_login/start?screen_hint=signup) to sign up for free
2. If you have the option to set up sending, just choose **Skip to Dashboard**
3. Click **Create sender identity** on the welcome screen or go to **Settings → Sender Authentication**
2. Under **Single Sender Verification**, click **Get Started** (or **Create New Sender**)
3. Fill in the form:
   - **From Name**: Your app name (e.g., `My SaaS App`)
   - **From Email Address**: An address you own and can receive mail at (e.g., `you@gmail.com` or `noreply@yourdomain.com`)
   - **Reply To**: Same address or another you control
   - Fill in the remaining company fields (required by SendGrid)
4. Click **Create** — SendGrid sends a verification email to that address
5. Open the email and click **Verify Single Sender**

**Create a SendGrid API key:**
1. Go to **Settings → API Keys → Create API Key**
2. Name it (e.g., `open-saas-production`)
3. Select **Custom Access** and enable **Mail Send → Full Access**
4. Click **Create & View** — copy the key immediately (starts with `SG.`, shown only once)
5. Store it in your `.env` file. This is your `SENDGRID_API_KEY` for the Render env vars in Step 6

**Update `template/app/main.wasp`** — there are **two places** to change:

```wasp
auth: {
  methods: {
    email: {
      fromField: {
        name: "Your App Name",
        email: "you@yourdomain.com",  // <-- change to your verified SendGrid sender
      },
      // ...rest unchanged
    },
  },
},

// ...

emailSender: {
  provider: SendGrid,               // <-- change from Dummy to SendGrid
  defaultFrom: {
    name: "Your App Name",
    email: "you@yourdomain.com",    // <-- same verified SendGrid sender as above
  },
},
```

Both `fromField.email` (auth emails: verification, password reset) and `emailSender.defaultFrom.email` must match your verified SendGrid sender exactly, or the send will be rejected.

### 1c. Remove the Plausible script tags from main.wasp

In the same file, find the `head` array and comment out these two lines:

```wasp
"<script defer data-domain='<your-site-id>' src='https://plausible.io/js/script.js'></script>",  // for production
"<script defer data-domain='<your-site-id>' src='https://plausible.io/js/script.local.js'></script>",  // for development
```

---

## Step 2: Set Up Stripe (Free)


### 2a. Create a Stripe account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. You do **not** need to activate your account or provide banking details for test mode — just verify your email
3. You'll land on the Stripe Dashboard in **test mode** by default (look for the "Test mode" toggle in the top right — make sure it's on)

### 2b. Create the three products

You need three products: two subscription plans and one one-time credit pack.

**Hobby subscription:**
1. Go to **Product catalog → Add product** (or [direct link in test mode](https://dashboard.stripe.com/test/products/create))
2. Fill in:
   - **Name**: `Hobby`
   - **Description**: `Basic subscription` (optional)
3. Under **Pricing**, click **Add a price**:
   - **Pricing model**: Standard pricing
   - **Price**: `9.00`
   - **Currency**: USD
   - **Billing period**: Monthly
4. Click **Add product**
5. On the product page, find the price under **Pricing**, click the 3-dots/kebab menu, and copy the **Price ID** (format: `price_1AbcXyz...`)
6. Store it under the `PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID` in your .env file

**Pro subscription:**
1. Click **Add product** again
2. Fill in:
   - **Name**: `Pro`
3. Under **Pricing**, click **Add a price**:
   - **Price**: `29.00`, **Billing period**: Monthly
4. Save and copy the **Price ID**
5. Store it under the `PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID` in your .env file

**10 Credits (one-time):**
1. Click **Add product** again
2. Fill in:
   - **Name**: `10 Credits`
3. Under **Pricing**, click **Add a price**:
   - **Pricing model**: One-off
   - **Price**: `9.99`
   - **Billing period**: **One time** (not recurring)
4. Save and copy the **Price ID**
5. Store it under the `PAYMENTS_CREDITS_10_PLAN_ID` in your .env file

You should now have three price IDs in your .env file that look like:
```
price_1AbcHobby...   → PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID
price_1AbcPro...     → PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID
price_1AbcCredits... → PAYMENTS_CREDITS_10_PLAN_ID
```

### 2c. Copy your Stripe secret key

1. Click the hear to navigate to settings. Go to **Developers → API keys** (or [direct link](https://dashboard.stripe.com/test/apikeys))
2. Copy the **Secret key** — it starts with `sk_test_...`
3. Save it in your .env under `STRIPE_API_KEY`

> The **Publishable key** (`pk_test_...`) is for client-side use only. Open SaaS does not need it in your env vars.

---

## Step 2d: Get Your OpenAI API Key

The AI demo feature in Open SaaS calls the OpenAI API. **You need a key** — the server will fail to start without `OPENAI_API_KEY` in its environment.

> **Does it cost money?** New accounts get $5 in free credits (enough for thousands of demo calls). After that, usage is billed per token — typically fractions of a cent per request.

1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup) and create an account (or log in)
2. Verify your email if prompted
3. Go to **API Keys** (top-right menu → **API keys**, or [direct link](https://platform.openai.com/api-keys))
4. Click **Create new secret key**
   - **Name**: `open-saas-production` (optional)
   - Leave permissions at default
5. Click **Create secret key** — copy the key immediately (starts with `sk-...`, shown only once)
6. Store it in your `.env` file under `OPENAI_API_KEY`

> **Optional but recommended:** Set a monthly **spend limit** under **Settings → Limits** to avoid surprise charges. $5–10 is plenty for testing.

---

## Step 3: Build the Wasp App

```bash
cd template/app
wasp build
```

This generates compiled artifacts in `template/app/.wasp/build/`:
- `server/` — Node.js server with a `Dockerfile`
- `web-app/` — React/Vite static client

---

## Step 4: Push Build Artifacts to GitHub

`.wasp/` is gitignored, so the build output can't ride along with your normal commits. In this fork, the simplest approach is to push the built artifacts to two dedicated **deployment branches** in that same fork — no new repos needed.

```bash
# Server — push to the render-server branch in your fork
cd template/app/.wasp/build/server    # ← must be inside build/server, not template/app
git init && git add -A
git commit -m "server build"
git push https://github.com/Ho1yShif/open-saas.git HEAD:render-server --force

# Client — push to the render-client branch in your fork
cd ../web-app                          # ← must be inside build/web-app
git init && git add -A
git commit -m "client build"
git push https://github.com/Ho1yShif/open-saas.git HEAD:render-client --force
```

> **Common mistake:** Running `git push` from `template/app` instead of `template/app/.wasp/build/server` pushes the Wasp source files instead of the compiled artifacts. Render will then fail with `open Dockerfile: no such file or directory` because the source tree has no Dockerfile at its root. Always `cd` into the build subdirectory first.

**Verify before moving on** — confirm both branches contain the right files:

```bash
# Should print "Dockerfile" — if it doesn't, you pushed from the wrong directory
git ls-tree --name-only origin/render-server | grep Dockerfile

# Should print "index.html" (or similar) — the compiled React output
git ls-tree --name-only origin/render-client
```

When connecting services in Render (Step 5), select `Ho1yShif/open-saas` and set:
- Web Service → branch: `render-server`
- Static Site → branch: `render-client`

> **Why `--force`?** Each `wasp build` creates a fresh `git init` with no shared history, so force is required. These are throw-away deployment branches — your `main` branch is untouched.

### Redeploying after code changes

```bash
cd template/app
wasp build

cd .wasp/build/server                 # ← cd into build/server first
git init && git add -A && git commit -m "update"
git push https://github.com/Ho1yShif/open-saas.git HEAD:render-server --force

cd ../web-app                         # ← then into build/web-app
git init && git add -A && git commit -m "update"
git push https://github.com/Ho1yShif/open-saas.git HEAD:render-client --force
```

Render auto-deploys when it detects a new commit on the watched branch.

---

## Step 4b: Deploy via Blueprint (Alternative to Manual Step 5)

A `render.yaml` Blueprint at the root of this repo defines all three services — database, server, and client — as Infrastructure-as-Code. You can use it to recreate the entire stack in one click instead of following Step 5 manually.

### What the Blueprint does

- **`myapp-db`** — PostgreSQL 16, free tier, Oregon
- **`myapp-server`** — Docker web service from the `render-server` branch; auto-links `DATABASE_URL`, `WASP_SERVER_URL`, and `CLIENT_URL` from other services; prompts for secrets
- **`myapp-client`** — Static site from the `render-client` branch; auto-links `REACT_APP_API_URL` from the server

### Deploy via Blueprint Dashboard link

First, push the `render.yaml` to your fork's `main` branch so Render can find it:

```bash
git add render.yaml
git commit -m "Add Render Blueprint"
git push origin main
```

Then open this link to launch the Blueprint wizard:

```
https://dashboard.render.com/blueprint/new?repo=https://github.com/Ho1yShif/open-saas
```

Fill in the secret environment variables when prompted (same values from Steps 1b–2d):
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENTS_*_PLAN_ID`
- `ADMIN_EMAILS`
- `SENDGRID_API_KEY`
- `OPENAI_API_KEY`

Click **Apply** — Render creates all three resources and starts deploying.

> If you used the Blueprint, skip Step 5. Continue from Step 6 only to verify variables and add `STRIPE_WEBHOOK_SECRET` after deploying.

---

## Step 5: Create Render Services

You'll create three things in Render: a **PostgreSQL database**, a **Web Service** (the Node.js server), and a **Static Site** (the React client). Create them in this order.

### 5a. Create the Render PostgreSQL Database
> Use `render-deploy` Claude skill to speed this up
> Render PostgreSQL free tier expires after 90 days. For a permanent free database, use the **Starter** plan ($7/mo) or connect an external Postgres service. For initial testing, free works fine.

1. In Render Dashboard, click **New → PostgreSQL**
2. Fill in the form:
   - **Name**: `myapp-db`
   - **Database**: `myapp` (the actual DB name — can be anything)
   - **User**: `myapp` (the DB user — can be anything)
   - **Region**: Choose the region closest to you (e.g., `Oregon (US West)`)
   - **PostgreSQL Version**: `16`
   - **Plan**: `Free` (or Starter for production)
3. Click **Create Database** and wait for it to provision (~1 min)
4. Once it's running, click into the database and go to the **Info** tab
5. Find the **Connections** section — you'll see two URLs:
   - **Internal Database URL** — for services running inside Render (use this for `DATABASE_URL`)
   - **External Database URL** — for connecting from your local machine
6. Copy the **Internal Database URL** — it looks like:
   ```
   postgresql://myapp:PASSWORD@dpg-xxxxx-a/myapp
   ```
   Save this — you'll use it as `DATABASE_URL` in Step 6.

> **Why internal URL?** Render services communicate with each other over a private network, which is faster and avoids bandwidth charges. Always use the internal URL for `DATABASE_URL` on the server.

### 5b. Create the Server (Web Service)

1. In Render Dashboard, click **New → Web Service**
2. Choose **Build and deploy from a Git repository**, then connect `Ho1yShif/open-saas`
3. Fill in the settings:
   - **Name**: `myapp-server`
   - **Region**: **Same region as your database** (critical — otherwise internal URL won't work)
   - **Branch**: `render-server`
   - **Runtime**: `Docker` — Render will auto-detect the `Dockerfile` in the repo root
   - **Instance Type**: `Free` (spins down after 15min inactivity) or `Starter` ($7/mo, always-on)
4. Scroll down to **Environment Variables** — add all the server env vars from Step 6 now
5. Do **not** click Deploy yet — you need the server URL first, which Render shows before you deploy:
   - Look at the top of the Web Service page for the URL (e.g., `https://myapp-server.onrender.com`)
   - Note it down — you need it for `WASP_SERVER_URL` and for the client's `REACT_APP_API_URL`

### 5c. Create the Client (Static Site)

1. In Render Dashboard, click **New → Static Site**
2. Connect `Ho1yShif/open-saas`
3. Fill in the settings:
   - **Name**: `myapp-client`
   - **Branch**: `render-client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://myapp-server.onrender.com` (your server URL from 5b)
5. Click **Create Static Site** — static sites are free on Render with no time limits
6. Note your client URL (e.g., `https://myapp-client.onrender.com`) — needed for `CLIENT_URL` in the server env vars

---

## Step 6: Configure Environment Variables

### Server Environment Variables

Set these in your Render Web Service (Settings → Environment):

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Internal URL from Render PostgreSQL |
| `JWT_SECRET` | `<random-64-char-string>` | Run: `openssl rand -hex 32` |
| `WASP_SERVER_URL` | `https://myapp-server.onrender.com` | Your Render server URL |
| `CLIENT_URL` | `https://myapp-client.onrender.com` | Your Render client URL |
| `STRIPE_API_KEY` | `sk_test_...` | Stripe test key to start |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Step 7 below |
| `PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID` | `price_...` | Stripe price ID for Hobby plan |
| `PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID` | `price_...` | Stripe price ID for Pro plan |
| `PAYMENTS_CREDITS_10_PLAN_ID` | `price_...` | Stripe price ID for 10 Credits |
| `ADMIN_EMAILS` | `you@example.com` | Comma-separated list of admin emails |
| `SENDGRID_API_KEY` | `SG.xxx...` | SendGrid API key |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key |

**Do not set**: `GOOGLE_ANALYTICS_*`, `PLAUSIBLE_*`, `AWS_S3_*`, `GOOGLE_CLIENT_*`, `LEMONSQUEEZY_*`, `POLAR_*`

### Client Environment Variable

Set this in your Render Static Site (Settings → Environment):

| Variable | Value | Notes |
|---|---|---|
| `REACT_APP_API_URL` | `https://myapp-server.onrender.com` | Must be set at BUILD time |

> **Important**: `REACT_APP_API_URL` is baked into the static build. After setting it, trigger a manual deploy of the static site.

---

## Step 7: Set Up Stripe Webhook

The webhook is how Stripe notifies your server when a payment completes, a subscription changes, or a payment fails. Without it, your app won't know when a user has paid.

> **Is this free?** Yes — Stripe webhooks are free. There's no cost to receive events.

1. Make sure your server is deployed and running on Render (from Step 8 — you may need to do a first deploy first, then come back here)
2. Go to **Developers → Webhooks** in the Stripe Dashboard (make sure you're in **Test mode**):
   [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
3. Click **Add endpoint**
4. Fill in the form:
   - **Endpoint URL**: `https://myapp-server.onrender.com/payments-webhook`
     (replace with your actual Render server URL)
   - **Description**: `Open SaaS payments` (optional)
5. Under **Select events to listen to**, click **+ Select events** and add:
   - `checkout.session.completed` — fires when a user completes checkout
   - `customer.subscription.updated` — fires when a subscription changes (upgrade, downgrade, cancel)
   - `customer.subscription.deleted` — fires when a subscription is fully cancelled
   - `invoice.payment_failed` — fires when a renewal charge fails
6. Click **Add endpoint** to save
7. You'll land on the webhook detail page — click **Reveal** next to **Signing secret**
8. Copy the value — it starts with `whsec_...`
9. Go back to your Render Web Service → **Settings → Environment Variables**
10. Add or update `STRIPE_WEBHOOK_SECRET` with the `whsec_...` value
11. Trigger a **Manual Deploy** of the server so it picks up the new secret

### Verifying the webhook works

After deploying:
1. In Stripe Dashboard → Webhooks, click on your endpoint
2. Click **Send test webhook** → select `checkout.session.completed` → **Send test webhook**
3. You should see a `200` response in the **Recent deliveries** section
4. If you get a `400` or `500`, check Render server logs for the error

---

## Step 8: Deploy

1. In the Render Dashboard, trigger a manual deploy for both the **Web Service** (server) and **Static Site** (client)
2. Watch the deploy logs — the server will run Prisma migrations automatically on first start
3. Once both services are green, visit `https://myapp-client.onrender.com`

---

## Step 9: Create Your Admin Account

1. Sign up at `https://myapp-client.onrender.com/signup` using one of the emails listed in `ADMIN_EMAILS`
2. Check your email (SendGrid) for the verification link
3. After verifying, go to `https://myapp-client.onrender.com/admin` to access the admin dashboard

---

## Step 10: Switching to Production (Stripe Live Mode)

> **What does live mode cost?** Stripe charges **2.9% + $0.30 per successful card transaction** (US). No monthly fee. You only pay when you earn. To activate live mode, Stripe requires you to provide your business/banking details for payouts.

When ready to accept real payments:

### 10a. Activate your Stripe account

1. In the Stripe Dashboard, click **Activate account** in the top banner
2. Follow the prompts to provide business details and a bank account for payouts
3. Once approved (usually instant for US, a few days for some countries), the **Live mode** toggle becomes available

### 10b. Recreate products in live mode

Products and price IDs in test mode do **not** carry over to live mode.

1. In Stripe Dashboard, flip the **Test mode** toggle to **Live mode** (top right)
2. Go to **Products → Add product** and recreate all three products with the same prices:
   - Hobby: $9/month recurring
   - Pro: $29/month recurring
   - 10 Credits: $9.99 one-time
3. Copy the new **Price IDs** (they'll start with `price_` again but be different values)

### 10c. Create a live mode webhook

1. Go to **Developers → Webhooks** in live mode
2. Add a new endpoint with the same URL and same four events as Step 7
3. Copy the new `whsec_...` signing secret

### 10d. Update Render environment variables

In your Render Web Service → **Settings → Environment Variables**, update:

| Variable | New value |
|---|---|
| `STRIPE_API_KEY` | `sk_live_...` (live secret key from Developers → API keys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from the new live webhook) |
| `PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID` | live mode price ID |
| `PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID` | live mode price ID |
| `PAYMENTS_CREDITS_10_PLAN_ID` | live mode price ID |

Trigger a **Manual Deploy** after updating. Your app now accepts real payments.

---

## Features Not Included (Minimal Setup)

| Feature | What to do to enable it |
|---|---|
| Google Analytics | Set `REACT_APP_GOOGLE_ANALYTICS_ID` in client env |
| Plausible Analytics | Set `PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID`, `PLAUSIBLE_BASE_URL` in server env |
| Google OAuth | Uncomment `google:` in `main.wasp`, set `GOOGLE_CLIENT_ID/SECRET` |
| File Uploads (S3) | Set `AWS_S3_*` env vars, create S3 bucket with CORS policy |
| LemonSqueezy payments | Change `paymentProcessor` in `src/payment/paymentProcessor.ts`, set `LEMONSQUEEZY_*` env vars |
