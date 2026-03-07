# Render deployment guide (minimal)

This guide covers deploying Open SaaS on Render with a minimal feature set:
- **Keeping**: core auth + admin dashboard
- **Skipping**: payments, email provider setup, AI features, analytics, OAuth, S3

---

## Prerequisites

- [Wasp CLI](https://wasp.sh/docs/quick-start) installed (`npm install -g @wasp.sh/wasp-cli`)
- [Node.js 20+](https://nodejs.org/)
- A [Render](https://render.com) account
- Docker (optional — only needed for `wasp db migrate-dev` in Step 2; see the no-Docker alternative there)

---

## Step 1: Pre-flight code changes

Before building, make a few small changes to the app.

### 1a. Copy the environment variables template

An `.env.example` file at the root of this project lists every variable you'll need. Use it as a checklist — fill in each value as you work through the steps below.

```bash
cp .env.example .env
```

> Never commit a filled-in env file to git. `.env.example` contains only blank placeholders and is safe to commit.

### 1b. Remove the Plausible script tags from main.wasp

In `template/app/main.wasp`, find the `head` array and comment out these two lines:

```wasp
"<script defer data-domain='<your-site-id>' src='https://plausible.io/js/script.js'></script>",  // for production
"<script defer data-domain='<your-site-id>' src='https://plausible.io/js/script.local.js'></script>",  // for development
```

---

## Step 2: Generate database migrations

Render runs `wasp build` for you during the build phase, but you still need to generate migration files locally and commit them to `main`. The migration files in `template/app/migrations/` are what Prisma uses to create your database tables on first startup — without them, `prisma migrate deploy` will have nothing to apply and signup will return a 500 error.

`wasp db migrate-dev` requires a running local database. If you have Docker installed, use Wasp's managed dev database:

```bash
cd template/app
wasp start db       # leave this running in one terminal
```

In a new terminal:

```bash
cd template/app
wasp db migrate-dev
```

> If prompted for a migration name, enter anything (e.g. `init`).

> **No local database?** If you have a Render PostgreSQL resource, use `prisma db push` against your Render external database URL to sync the schema directly — see the [Troubleshooting](#troubleshooting) section.

Commit the generated migration files to `main`:

```bash
git add template/app/migrations/
git commit -m "add initial migrations"
git push origin main
```

---

## Step 3: Create Render services

You'll create three things in Render: a **PostgreSQL database**, a **Web Service** (the Node.js server), and a **Static Site** (the React client). Create them in this order.

> **Tip:** A `render.yaml` Blueprint at the repo root defines all three resources. You can use **New → Blueprint** in the Render dashboard to create everything in one step instead of manually following 3a–3c. You'll still need to fill in the `sync: false` env vars (like `ADMIN_EMAILS` and `REACT_APP_API_URL`) after the Blueprint applies.

### 3a. Create the Render PostgreSQL database
> Use the `render-deploy` Claude/Codex skill to speed this up so you don't have to create resources manually
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
   Save this — you'll use it as `DATABASE_URL` in Step 4.

> **Why internal URL?** Render services communicate with each other over a private network, which is faster and avoids bandwidth charges. Always use the internal URL for `DATABASE_URL` on the server.

### 3b. Create the server (web service)

1. In Render Dashboard, click **New → Web Service**
2. Choose **Build and deploy from a Git repository**, then connect your project repo
3. Fill in the settings:
   - **Name**: `myapp-server`
   - **Region**: **Same region as your database** (critical — otherwise internal URL won't work)
   - **Branch**: `main`
   - **Runtime**: `Node` — the Wasp-generated server is a standard Express/Node.js app
   - **Build Command**: (paste the full command from `render.yaml` → `buildCommand`, or let the Blueprint set it)
   - **Start Command**: `cd template/app/.wasp/out/server && npm run start-production`
   - **Instance Type**: `Free` (spins down after 15min inactivity) or `Starter` ($7/mo, always-on)
4. Scroll down to **Environment Variables** — add all the server env vars from Step 4 now
5. Do **not** click Deploy yet — you need the server URL first, which Render shows before you deploy:
   - Look at the top of the Web Service page for the URL (e.g., `https://<YOUR_SERVER_SUBDOMAIN>.onrender.com`)
   - Note it down — you need it for `WASP_SERVER_URL` and for the client's `REACT_APP_API_URL`

> **Build time note:** The build command installs the Wasp CLI and compiles the app from source. On Render's free tier, this can take 10–15 minutes. If builds time out, upgrade to the Starter plan.

### 3c. Create the client (static site)

1. In Render Dashboard, click **New → Static Site**
2. Connect your project repo
3. Fill in the settings:
   - **Name**: `myapp-client`
   - **Branch**: `main`
   - **Build Command**: (paste the full command from `render.yaml` → `buildCommand` for the client service)
   - **Publish Directory**: `template/app/.wasp/out/web-app/build`
4. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = `https://<YOUR_SERVER_SUBDOMAIN>.onrender.com` (your server URL from 3b)

   > `REACT_APP_API_URL` must be set **before** the first deploy — Vite bakes it into the client bundle at build time. If you need to change the server URL later, update this env var and trigger a redeploy.
5. Click **Create Static Site** — static sites are free on Render with no time limits
6. Note your client URL (e.g., `https://<YOUR_CLIENT_SUBDOMAIN>.onrender.com`) — needed for `CLIENT_URL` in the server env vars

### 3d. Record your URLs and update env vars

At this point you have both service URLs. Write them down:

| Variable | Your value |
|---|---|
| `WASP_SERVER_URL` | `https://<YOUR_SERVER_SUBDOMAIN>.onrender.com` |
| `CLIENT_URL` | `https://<YOUR_CLIENT_SUBDOMAIN>.onrender.com` |

Update `WASP_SERVER_URL` and `WASP_WEB_CLIENT_URL` in your Render Web Service environment variables (Settings → Environment). These two must always stay in sync — `WASP_SERVER_URL` tells the server its own public address, and `WASP_WEB_CLIENT_URL` is used for CORS.

### Redeploying after code changes

```bash
git push origin main
```

Render auto-deploys when it detects a new commit on `main`. If you add a new database migration, run `wasp db migrate-dev` locally first, then commit the generated `template/app/migrations/` files along with your code changes.

---

## Step 4: Configure environment variables

### Recommended: Use a Render Environment Group

Rather than entering each variable directly into each service, we recommend creating a **Render Environment Group** and linking it to both your Web Service (server) and Static Site (client). This lets you update a shared variable (e.g. `WASP_SERVER_URL`) in one place and have it apply to every linked service automatically.

1. In the Render Dashboard, go to **Environment Groups → New Environment Group**
2. Name it something like `myapp-shared`
3. Add all the variables listed below
4. When creating (or editing) your Web Service and Static Site, scroll to **Environment** and click **Link Environment Group** — select `myapp-shared`

Any variable you add to the group will be available in every linked service. You can still add service-specific overrides directly on a service if needed.

---

### Server environment variables

Set these in your Render Web Service (Settings → Environment), or add them to your Environment Group:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Internal URL from Render PostgreSQL |
| `JWT_SECRET` | `<random-64-char-string>` | Run: `openssl rand -hex 32` |
| `WASP_SERVER_URL` | `https://<YOUR_SERVER_SUBDOMAIN>.onrender.com` | Your Render server URL |
| `CLIENT_URL` | `https://<YOUR_CLIENT_SUBDOMAIN>.onrender.com` | Your Render client URL |
| `ADMIN_EMAILS` | `you@example.com` | Comma-separated list of admin emails |

> **Stripe, SendGrid, and OpenAI are optional** and skipped in this guide. The app will start and run without them — payments, transactional email, and AI features simply won't work until you add those keys later.

**Do not set**: `GOOGLE_ANALYTICS_*`, `PLAUSIBLE_*`, `AWS_S3_*`, `GOOGLE_CLIENT_*`, `LEMONSQUEEZY_*`, `POLAR_*`

> For local dev, make sure to use the external URLs for Render services, not the internal URLs

### Client environment variable

Set `REACT_APP_API_URL` on the Static Site to the full server URL before the first deploy:

```
REACT_APP_API_URL = https://<YOUR_SERVER_SUBDOMAIN>.onrender.com
```

Vite bakes this value into the client bundle at build time. To change it later, update the env var in Render and trigger a redeploy.

---

## Step 5: Deploy

1. In the Render Dashboard, trigger a manual deploy for both the **Web Service** (server) and **Static Site** (client)
2. Watch the deploy logs — the server will install the Wasp CLI, build the app, and run Prisma migrations automatically on first start
3. Once both services are green, visit `https://<YOUR_CLIENT_SUBDOMAIN>.onrender.com`


## Features not included (minimal setup)

| Feature | What to do to enable it |
|---|---|
| Stripe payments | Create Stripe products, set `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, and the three `PAYMENTS_*_PLAN_ID` vars |
| SendGrid email | Set up a SendGrid sender, update `emailSender` in `main.wasp`, set `SENDGRID_API_KEY` |
| OpenAI / AI features | Set `OPENAI_API_KEY` |
| Google Analytics | Set `REACT_APP_GOOGLE_ANALYTICS_ID` in client env |
| Plausible Analytics | Set `PLAUSIBLE_API_KEY`, `PLAUSIBLE_SITE_ID`, `PLAUSIBLE_BASE_URL` in server env |
| Google OAuth | Uncomment `google:` in `main.wasp`, set `GOOGLE_CLIENT_ID/SECRET` |
| File Uploads (S3) | Set `AWS_S3_*` env vars, create S3 bucket with CORS policy |

---

## Troubleshooting

### Signup returns 500 — "table does not exist"

**Symptom:** `POST /auth/email/signup 500` with log error:
```
The table `public.AuthIdentity` does not exist in the current database.
No migration found in prisma/migrations
```

**Cause:** `wasp db migrate-dev` was not run before `wasp build`, so no migration files were included in the deployment. `prisma migrate deploy` ran but had nothing to apply, leaving the database empty.

**Fix:**
```bash
cd template/app
wasp db migrate-dev   # generates migrations/
git add migrations/
git commit -m "fix: add migrations"
git push origin main
```

Render will auto-deploy and `prisma migrate deploy` will now create all tables.

**Alternative (if you can't run wasp locally):** Use `prisma db push` against the Render external database URL to sync the schema directly:
```bash
cd template/app
DATABASE_URL="<your-render-external-db-url>" \
  npx prisma db push --schema=.wasp/out/db/schema.prisma
```
Then redeploy normally.

---

## How this deployment process works

Both services deploy directly from `main`. Render clones the repo, installs the Wasp CLI, and runs `wasp build` as part of the service's build command — no pre-built branches needed.

**Server:** The Wasp-generated server (`template/app/.wasp/out/server/`) is a standard Express/Node.js app. After `wasp build`, the build command runs `npm install`, generates the Prisma client, and bundles the TypeScript source. Render's Node.js runtime then starts the server with `npm run start-production`, which runs `prisma migrate deploy` before starting Express — so database migrations are applied automatically on every deploy.

**Client:** After `wasp build`, Vite builds the React app from `template/app/` with the server URL baked in via `REACT_APP_API_URL`. The compiled output lands in `template/app/.wasp/out/web-app/build/`, which Render serves as a static site.

**Migration files** (`template/app/migrations/`) are committed to `main` and always present in the repo. This is why `wasp db migrate-dev` must be run locally before the first deploy — the migration files it generates need to exist in git for `prisma migrate deploy` to create your database tables.

To redeploy after any code change, just `git push origin main`. Render auto-deploys both services on every new commit.