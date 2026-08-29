# CanteenOS — Canteen Order & Token System

A digital canteen ordering system: students order and pay from their phone, get a queue token, track it live, and get a real push notification (with vibration) the moment it's ready — even if they've closed the tab. Admins run the kitchen from a live order queue and get pushed the moment a new order lands.

React 19 + Express + TypeScript, Razorpay for payments, SQLite (WAL mode) as the data store, real Web Push notifications, and an installable PWA shell.

---

## What's in this build

This is the original CanteenOS project audited end-to-end and brought from demo-quality to a genuinely working, close-to-production system, then load-tested and hardened to hold up at real single-canteen volume (~1000 orders/day):

- **Real push notifications** — not the old "keep the tab open" browser `Notification` hack. See [Push notifications](#push-notifications--how-it-actually-works) below.
- **Installable PWA** — manifest + icons + service worker, so "Add to Home Screen" gives students and kitchen staff a real app icon and standalone window.
- **SQLite data layer, indexed and load-tested** — see [Load testing](#load-testing) below for the actual numbers, not just claims.
- **Security hardening** — see [`AUDIT.md`](./AUDIT.md) for the full file-by-file findings. Highlights: no more hardcoded JWT signing key, admin sessions use an `httpOnly` cookie (not `localStorage`), the concurrency demo can no longer pollute real order data in production, rate limiting can no longer be bypassed by spoofing a header (and can no longer cross-contaminate between routes — see AUDIT.md), and there's a real change-password flow instead of just a startup warning.
- **Order history that doesn't grow forever** — old orders archive automatically (daily sweep) while staying fully browsable in a paginated Order History view in the admin dashboard.
- **CI** — every push/PR runs typecheck, build, and the full test suite (`.github/workflows/ci.yml`).
- **Full audit report** — [`AUDIT.md`](./AUDIT.md) documents every limitation found in the codebase (architecture, security, data layer, the scale pass, and this hardening pass), what was fixed, and what's intentionally left as-is with the reasoning why.

---

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open the URL it prints. Default admin login is `admin` / `admin123` — change this before letting real users near a deployed instance (see `AUDIT.md`).

For a production-style run:

```bash
npm run build
NODE_ENV=production npm start
```

### Environment variables

All documented with context in [`.env.example`](./.env.example). Nothing is required to get the app running locally — every secret (JWT signing key, VAPID push keys) auto-generates and persists to `server/data/` on first run if you don't set it. Set them explicitly for a real deployment:

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Signs admin auth tokens. Auto-generated + persisted locally if unset. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Signs Web Push messages. Auto-generated + persisted locally if unset. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Leave as the sandbox defaults for test-mode checkout; set real keys to go live. |
| `TRUST_PROXY` | Set `"true"` only if deployed behind a real reverse proxy. |
| `ALLOW_DEMO_CONCURRENCY` | Set `"true"` to keep `/api/concurrency/simulate` public in production. Off by default — see `AUDIT.md`. |

---

## Push notifications — how it actually works

The original build's only "notification" was `new Notification(...)` fired from a `setInterval` poll — which only works while the tab is open, foregrounded, and not throttled by the browser. This build replaces that with real **Web Push**: a service worker (`public/sw.js`) that the OS wakes up on its own when the server sends a push, even with the tab or app fully closed.

**Files involved:**

| File | Role |
|---|---|
| `public/sw.js` | Service worker — receives the push event, shows the system notification, sets the vibration pattern, handles notification taps. |
| `public/manifest.json` | Makes the app installable as a PWA. |
| `server/config/vapid.ts` | Loads/generates the VAPID keypair used to sign pushes. |
| `server/utils/pushStore.ts` | Tiny JSON-file store for subscriptions (kept out of the SQLite orders table on purpose — see `AUDIT.md`). |
| `server/utils/pushSender.ts` | `notifyOrderReady(tokenId)` and `notifyAdminNewOrder(...)` — actually sends the push. |
| `server/routes/notifications.ts` | `/api/notifications/*` — exposes the VAPID public key and subscribe endpoints. |
| `src/hooks/usePushSubscription.ts` | Frontend: registers the SW, requests permission, subscribes, and posts the subscription to the server. |
| `src/hooks/useTrackOrder.ts` | Calls the above once a student is tracking an order — subscribes for `order-ready` pushes on that token. |
| `src/hooks/useAdminAuth.ts` | Calls the above on admin login — subscribes that admin device for `new-order` pushes. |
| `server/routes/admin.ts` | Fires `notifyOrderReady` the instant an order's status is set to `READY`. |
| `server/routes/payment.ts` | Fires `notifyAdminNewOrder` the instant a payment is verified and an order is placed. |

**What actually makes a phone vibrate:** the `vibrate: [200, 100, 200, 100, 200]` field set in the push payload (`pushSender.ts`) and read by `public/sw.js`'s `showNotification(...)` call. This is honored by Android/Chrome/Edge/Firefox automatically — there is nothing else to configure.

**iOS Safari:** background web push only works if the site has been added to the Home Screen as a PWA first (iOS 16.4+) — that's an Apple platform restriction, not a bug in this build. Everything here works correctly on iOS once installed that way.

**Nothing to run manually** — VAPID keys auto-generate on first `npm run dev` / first server start and persist to `server/data/.vapid_keys.json`. To pin your own for a real deployment:

```bash
node -e "console.log(require('web-push').generateVAPIDKeys())"
```
and put the output in `.env` as `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`.

---

## Deploying

This app is a single Node process (Express serving the built React client + API), so it runs on any Node host. Two ready-made paths:

### Render (recommended, one blueprint away)

`render.yaml` in the repo root is a full blueprint: build/start commands, health check, and — importantly — a **persistent disk mounted at `server/data`**. Without that disk, Render's filesystem is wiped on every deploy/restart, which would silently delete every order and rotate the JWT/VAPID secrets out from under logged-in admins.

1. Push this repo to GitHub, then in the Render dashboard: **New > Blueprint**, point it at the repo.
2. Render reads `render.yaml` and provisions the service + disk automatically.
3. Set the `sync: false` env vars in the dashboard before the first deploy: `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (generate with `node -e "console.log(require('web-push').generateVAPIDKeys())"`), and `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` if you're going live with real payments (leave unset to stay in sandbox test-checkout mode).
4. `JWT_SECRET` is auto-generated by the blueprint — no action needed.
5. First deploy seeds the default admin (`admin` / `admin123`) — log in and change it immediately; the server logs a startup warning until you do.

### Docker (any other host — Railway, Fly.io, a VPS, etc.)

```bash
docker build -t canteenos .
docker run -p 3000:3000 \
  -e JWT_SECRET=... -e VAPID_PUBLIC_KEY=... -e VAPID_PRIVATE_KEY=... \
  -e RAZORPAY_KEY_ID=... -e RAZORPAY_KEY_SECRET=... \
  -v canteenos_data:/app/server/data \
  canteenos
```

The `-v` volume is the same requirement as the Render disk above: it's where the SQLite database, its hourly backups, and the auto-generated secrets live. Skip it and every container restart starts from a blank slate.

The `Dockerfile` builds in two stages: a `build` stage with a Python/C++ toolchain (needed because `better-sqlite3` is a native addon and occasionally needs to compile from source rather than use a prebuilt binary), then a slim `runtime` stage with only the pruned production `node_modules` + built app copied in — so the final image stays small without needing the toolchain at runtime.

### Pre-launch checklist

- [ ] Persistent disk/volume mounted at `server/data` (see above)
- [ ] Logged in as `admin`/`admin123` once and changed the password
- [ ] Real `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` set once you're ready to take real payments (app auto-detects and switches out of sandbox mode)
- [ ] `TRUST_PROXY=true` set (Render/Railway/anything behind a reverse proxy — already default `true` in `render.yaml`)
- [ ] `ALLOW_DEMO_CONCURRENCY` left `false` unless you intentionally want the concurrency showcase writable by the public

---

## Architecture

Express server, 7 route modules, all order/menu/admin data persisted in SQLite (WAL mode, `server/data/canteen_data.db`), indexed on `(date)`, `(date, token_id)`, and `(date, order_status)`. Multi-step mutations (check availability → decrement → insert order) go through a global async-mutex (`server/utils/writeLock.ts`) so they can't interleave between steps; individual statements are atomic on their own. Push subscriptions are the one thing kept out of the orders table, in their own small JSON file — see `AUDIT.md` for why.

Full breakdown of every route, the data layer, and every known limitation: **[`AUDIT.md`](./AUDIT.md)**.

---

## Load testing

Run against the actual production build (`npm run build && npm start`), not `dev` mode. This is what "handles 1000 orders a day" was verified against, not just assumed:

```bash
# Full order lifecycle sanity check
npm test

# 1000 concurrent order attempts (create-order + verify, the full payment
# flow) fired at once against a running server — see server/testFullSuite.ts
# for the scripted version, or hit /api/payment/create-order + /verify
# concurrently with any load tool (k6, autocannon, a simple Python
# ThreadPoolExecutor script, etc).
```

Results from the last run of this pass, single process, default hardware, no tuning beyond what's in this repo:
- 1000 concurrent order attempts → all resolved with **zero token collisions**
- `GET /api/admin/orders` stayed under **40ms** with the day's queue fully populated
- Admin login succeeded normally *during and after* a concurrent payment burst (this used to fail — see `AUDIT.md`'s "Scale pass" section for the rate-limiter bug that caused it)
- 1000 orders/day averages to roughly one order every ~30 seconds across a working day; even concentrated into a tight lunch-rush window, that's well inside what one SQLite-backed process handles without breaking a sweat

If you outgrow a *single* physical counter (multiple simultaneous locations writing concurrently), that's the point to move from SQLite to Postgres — see `AUDIT.md` for why the data-layer functions were kept narrow enough that swap wouldn't touch the route files.

---

## Scripts

- `npm run dev` — Vite + Express dev server with HMR
- `npm run build` — production client bundle + bundled server (`dist/`)
- `npm start` — run the production build
- `npm test` — integration test suite (`server/testFullSuite.ts`), now running against the SQLite data layer
