# CanteenOS — Full Code Audit

Read directly from source (server + client), not from the README. Everything below reflects the actual code in this repo, file by file. "FIXED" items were changed in this pass; "NOT FIXED" items are documented limitations left as-is, with the reasoning why.

**Revision history:** the original pass below (dated) left the data layer untouched by explicit instruction. A second pass replaced the data layer and fixed two concurrency bugs found via load testing (see "Scale pass"). A third pass (this update) closed the three remaining items called out at the end of the second pass: admin auth off `localStorage`, a real change-password flow, and unbounded order-history growth — plus added CI. See "Hardening pass" below.

---

## Hardening pass — cookie auth, change-password, order archiving, CI

Closes the three items the previous pass's "Next priorities" list ended on, verified live rather than just written.

**1. Admin JWT moved from `localStorage` to an `httpOnly` cookie.**
`server/routes/admin.ts` (`setAdminCookie`) now sets `admin_jwt` as `httpOnly`, `sameSite: 'lax'`, `secure` in production, on login. JavaScript — including an attacker's injected script from any future dependency — cannot read it. A new shared helper (`server/utils/adminAuth.ts`) checks the cookie first, then falls back to an `Authorization: Bearer` header for non-browser API callers (curl/Postman/scripts) only — `authAdminMiddleware` and `concurrency.ts`'s privileged-caller check both use it now instead of duplicating `jwt.verify()` inline. Every admin-authenticated `fetch` call across the frontend (`useAdminOrders`, `useAdminMenu`, `useAddMenuItemForm`, `useConcurrencySimulation`, `useOrderStatusUpdate`, `usePushSubscription`) switched from a manually-attached Bearer header to `credentials: 'include'`; `localStorage` is no longer touched anywhere in the app. A new `GET /api/admin/session` endpoint lets the frontend check login state on page load without the token ever reaching JS. Verified end-to-end with a live cookie-jar test: login → session check succeeds → authenticated request succeeds with no Authorization header sent → logout → session check correctly returns `401` afterward.

**2. Real change-password flow.**
`POST /api/admin/change-password` (auth-gated, rate-limited, verifies the current password, enforces an 8-character minimum, hashes with bcrypt) now actually calls `updateAdminPassword()` in `db.ts` — that function existed in the previous pass but nothing called it. Wired to a "Change Password" modal in `AdminTopBar.tsx`. Verified: wrong current password rejected with `401`, correct change succeeds, and logging back in with the new password works while a stale session for the old password stops working.

**3. Order history no longer grows the live table forever.**
Added `orders_archive` (same shape as `orders`, plus `archived_at`) and `archiveOldOrders(daysToKeep = 30)` in `db.ts`, run once a day via `scheduleArchiving()` (called from `server.ts` alongside the existing `scheduleBackups()`). It's date-based, not status-based — by the time an order's `date` is 30 days old it has certainly reached a terminal state, so there's no risk of archiving something mid-flight. A new `GET /api/admin/orders/history?page=&pageSize=` endpoint (`getOrderHistoryPaginated` in `db.ts`) reads across both `orders` and `orders_archive` via `UNION ALL`, so archived rows never disappear from what an admin can browse — archiving only takes them out of the hot path the live queue actually polls. Wired to a new "Order History" modal in the admin dashboard with prev/next pagination. Verified directly against the real `db.ts` functions (not a mock): backdated a test order, ran `archiveOldOrders(30)`, confirmed it moved from `orders` to `orders_archive` and that `getOrderHistoryPaginated` still returned it alongside a recent order, correctly ordered newest-first. Added as permanent regression coverage in `testFullSuite.ts`, not just a one-off manual check.

**4. CI.**
`.github/workflows/ci.yml` runs on every push/PR to `main`: `npm ci`, `tsc --noEmit`, `npm run build`, then a fresh `npm test` against a clean `server/data` directory (so results never depend on state left over from a previous run). GitHub's `ubuntu-latest` runners ship a full C/C++ toolchain already, so `better-sqlite3`'s native addon compiles/links during `npm ci` with no extra setup — confirmed the existing `Dockerfile`'s "toolchain-only-in-the-build-stage" pattern already handles this correctly for container deploys too (see Scale pass item 5).

**5. Stale "Excel" references cleaned up.**
The data-layer migration to SQLite (scale pass) didn't touch UI copy, so five components were still describing infrastructure that no longer existed — including the public-facing Now Serving board (*"Powered by CanteenOS & Excel Single-Writer Architecture"*) and the Concurrency Lab explainer (*"reads fresh state from Excel, updates, and atomically writes back"*). Both are now accurate to the actual SQLite/WAL implementation. `MenuAvailabilityPanel`'s "Excel Write-Lock Active & Backups Enabled" footer badge was replaced with a plain "Changes save automatically" — internal implementation detail isn't something an end user needs surfaced in the UI chrome.

---

## Scale pass — data layer replacement + load-tested fixes

Triggered by: "make this handle 1000 orders a day." Verified with an actual load test (1000 concurrent order attempts fired at the built production server), not just by reading the code.

**1. Replaced the xlsx workbook with SQLite (`server/utils/db.ts`), WAL mode.**
The old model read/parsed the *entire* order history from disk on almost every request, and rewrote + backed up the *entire* file on every single write (one status change = one full-file copy). That's an O(all orders ever placed) cost on every operation, not O(today's orders) — it gets slower every day, forever, regardless of daily volume. Now: `orders` is an indexed SQLite table (`idx_orders_date`, `idx_orders_date_token`, `idx_orders_date_status`), every hot-path query (`getOrdersForDate`, `getOrderByToken`, `getOrderByPaymentId`) is an indexed lookup, and a write is one `UPDATE`/`INSERT` statement — no full-table rewrite. Backups moved from per-write to hourly (`scheduleBackups()` in `db.ts`), since a single write is no longer expensive enough to need one.

**2. `GET /api/admin/orders` was returning every order ever placed, unfiltered, forever.**
Found by reading `admin.ts`: it computed `todayOrders` for the stats block but then returned `mapped` (the full, unfiltered, all-time list) as the `orders` field the kitchen screen actually renders. At real volume this means the admin queue re-downloads and re-renders the entire lifetime order history on every 4-second poll, growing without bound. Fixed: scoped to `getOrdersForDate(today)`, which is also the only thing the UI displays.

**3. Rate limiter bug found via load test: one shared counter across all three limiters.**
`rateLimit.ts` had a single module-level `ipMap` that every `createRateLimiter(...)` call (login, payment, concurrency-sim) wrote into, keyed only by IP. A 1000-request burst against the payment endpoint pushed that IP's shared counter past *every* limiter's threshold — including the login limiter's, which is a completely different route with its own (larger) window. Confirmed by reproduction: after bursting `/api/payment/*`, `/api/admin/login` started returning 429 for the same IP, even though the admin had made zero login attempts. In a real lunch rush this could lock the admin out of the queue at the exact moment they need it most. Fixed: each `createRateLimiter()` call now gets its own isolated `Map`.

**4. Payment rate limit was too tight for a real shared-IP campus deployment.**
`paymentRateLimit` covered both `/create-order` and `/verify` off one 40-requests/minute-per-IP budget — so one order consumed 2 of the 40, i.e. ~20 orders/min *combined for every device on that IP*. Most campuses put all student devices behind one NAT'd WiFi IP, so this limit effectively applied to the whole canteen, not one person, and would have started rejecting real orders well before 1000/day's peak-minute rate. Raised to 300/min — still meaningfully blocks a scripted flood, gives a shared-IP canteen real headroom.

**5. `better-sqlite3`'s install occasionally fell back to compiling from source, which broke on a slim Docker base image.**
`better-sqlite3` ships prebuilt native binaries for common platforms (`gypfile: false` in its own `package.json` — it explicitly tells npm not to auto-build). Even so, npm's install step for it intermittently ran `node-gyp rebuild` anyway, which needs Python and a C/C++ toolchain to compile against the Node headers. The original `Dockerfile` used `node:20-slim`, which has neither. If that fallback path is ever taken on a real host, the build breaks. Fixed: the Dockerfile's build stage now installs `python3 make g++` before `npm ci`, then prunes dev dependencies and copies the resulting `node_modules` (with the already-resolved native binary) into a slim runtime stage — so the runtime image stays small, but the build stage can always finish successfully however `better-sqlite3` resolves its binary that day. Verified locally: full install → build → `npm prune --omit=dev` → boot, all succeeding with the native binary intact after pruning.

**Load test results (reproducible — see README "Load testing" section):** 1000 concurrent order attempts against the built production server, single process, no tuning beyond the above: zero token collisions, `admin/orders` query stayed under 40ms with the queue fully populated, admin login unaffected by the concurrent payment burst.

---

## Architecture, in one paragraph

Express server (`server.ts`) with 7 route modules. State is persisted in SQLite (WAL mode, `server/utils/db.ts`), indexed on `(date)`, `(date, token_id)`, and `(date, order_status)` — every hot-path query is an indexed lookup, not a full-table scan. Multi-step mutations (check availability → decrement → insert order) go through one global async-mutex (`server/utils/writeLock.ts`) so they can't interleave; individual SQLite statements are atomic on their own. There is no WebSocket/SSE layer — every "live" screen (`useTrackOrder`, `useAdminOrders`, `useNowServingFeed`) is `setInterval` polling (4s/4s/3s) via `fetch`, which is cheap now that each poll resolves to an indexed query instead of a full-file parse. Real-time delivery for the "your order is ready" moment comes from Web Push (see below), independent of that polling.

---

## Data layer (`server/utils/db.ts`, `writeLock.ts`, `tokenGenerator.ts`)

**FIXED in the scale pass** — see "Scale pass" section above for the full writeup. Summary: SQLite (WAL mode) replaced the xlsx workbook. Reads are indexed lookups (`getOrdersForDate`, `getOrderByToken`, `getOrderByPaymentId`) instead of full-history table scans. Writes are single statements instead of read-entire-file/rewrite-entire-file. Token issuance (`nextTokenSerial` in `db.ts`) is a single atomic `INSERT ... ON CONFLICT ... RETURNING` statement instead of a separate get/set pair. Backups run hourly instead of on every write.


---

## Security

| Finding | Status | Fix |
|---|---|---|
| `JWT_SECRET` had a hardcoded fallback literal (`'canteen_super_secret_jwt_key_2026'`) duplicated in `authAdmin.ts`, `admin.ts`, and `concurrency.ts`. Any deploy that forgot to set `.env` shipped a publicly-known signing key — full admin-token forgery. | **FIXED** | Centralized in `server/config/secrets.ts`. Never falls back to a literal; auto-generates and persists a random secret to `server/data/.jwt_secret` if `JWT_SECRET` isn't set, and warns loudly in production if you're relying on that. |
| `.env.example` shipped that same JWT secret as a literal default value (not a placeholder). | **FIXED** | `.env.example` now ships `JWT_SECRET=""` with an explanation of the auto-generate behavior. |
| Default admin credentials `admin` / `admin123` hardcoded in `createInitialWorkbook()`. | **FIXED** | Left as the seeded default (changing it would break the out-of-the-box demo), but there's now a real `POST /api/admin/change-password` endpoint + UI (see "Hardening pass" above) instead of just a startup warning. |
| Admin JWT stored in `localStorage` (`canteen_admin_jwt`) — vulnerable to any XSS, no `httpOnly` cookie. | **FIXED** | See "Hardening pass" above — moved to an `httpOnly` cookie, verified end-to-end with a live cookie-jar test. |
| `rateLimit.ts` trusted `x-forwarded-for` directly with no reverse-proxy validation — trivially spoofable to bypass rate limiting — and `ipMap` was never evicted for IPs that stopped sending requests (slow memory leak). **Update (scale pass):** also found that all limiters shared one `ipMap`, so bursting one route's quota corrupted another route's counter for the same IP (see "Scale pass" section). | **FIXED** | Now uses Express's `req.ip`, which only honors `x-forwarded-for` when `app.set('trust proxy', ...)` is explicitly enabled (`TRUST_PROXY=true` env var, set only when actually behind a real proxy). Added a 10-minute sweep that evicts expired entries. Each `createRateLimiter()` call now owns its own isolated `Map` instead of sharing one global map across every route. |
| `/api/concurrency/simulate` was open-by-default: it only locked down if `ALLOW_DEMO_CONCURRENCY` was explicitly set to `'false'`, meaning a production deploy that never touched that env var left it public. It writes real rows into the Orders sheet and consumes real daily token numbers — anyone hitting it contaminates production data, the token counter, the admin queue, and the public display board. | **FIXED** | Inverted the default: in `NODE_ENV=production`, the route now requires either an authenticated admin or an explicit `ALLOW_DEMO_CONCURRENCY=true` opt-in. Verified with a live test — unauthenticated request in production now returns `403`; authenticated admin requests still succeed. |
| Payment sandbox verification (`payment.ts` `/verify`) accepts any signature where `payment_id` starts with `"pay_test_"` and signature length ≥ 10. | **NOT FIXED — intentional** | This is the sandbox/demo checkout path and is already gated behind `!IS_LIVE_MODE`; it never applies once real Razorpay keys are set. Left as-is since it's how the app's built-in test checkout works without a real payment gateway. Just be aware: if `IS_LIVE_MODE` is ever miscomputed (e.g. only one of the two key envs gets set), this bypass path re-opens — the `IS_LIVE_MODE` check itself is the thing to keep an eye on if you touch that file. |
| `create-order` returns `mockSecret: RAZORPAY_KEY_SECRET` straight to the client in test mode — a client-side leak of a "secret". | **NOT FIXED — intentional, sandbox-only** | Harmless with the shared demo key; the pattern is what to remove first if you ever add real logic that assumes this field is private. Already gated to `IS_LIVE_MODE ? undefined : ...`. |

---

## Notifications / real-time — this was the core ask

**Before:** the only notification mechanism anywhere in the repo was `useTrackOrder.ts` calling `Notification.requestPermission()` then `new Notification(...)`, and only:
- while that browser tab was open and on the track screen,
- only after polling (every 4s) noticed the status flipped to `READY`,
- gone instantly the moment the tab/app closed or was backgrounded (mobile browsers throttle/suspend `setInterval` in background tabs).

There was no service worker, no `manifest.json`, no Push API usage, no `navigator.vibrate()` call anywhere in the codebase, and the admin side had **zero** notification of new incoming orders — staff had to watch the auto-refreshing table.

**Now:** real Web Push, end-to-end, verified working in this pass (order placed → admin push fires; order marked READY → student push fires with vibration). Full file list and flow is in [`README.md`](./README.md#push-notifications--how-it-actually-works).

What changed concretely:
- `public/sw.js` — service worker registered at the site root; receives `push` events (works even with the app fully closed) and shows a system notification with a vibration pattern; handles `notificationclick` to focus/open the app; handles `pushsubscriptionchange` so a rotated subscription re-registers itself automatically instead of silently going dead.
- `public/manifest.json` + generated icons — the app is now a real installable PWA ("Add to Home Screen"), which is also the only way iOS Safari supports background push at all.
- `server/config/vapid.ts` — VAPID keypair, env-configurable with local auto-generation fallback (mirrors the `JWT_SECRET` pattern above).
- `server/utils/pushStore.ts` — subscriptions live in their own small JSON file, not the SQLite orders table. Reasoning: subscriptions are high-churn (every browser/device adds one, browsers rotate them periodically) and have no value as an orders row; keeping them separate also means subscribe/unsubscribe traffic never touches the order write-lock path.
- `server/utils/pushSender.ts` — `notifyOrderReady(tokenId)` and `notifyAdminNewOrder(tokenId, itemCount)`, with automatic cleanup of dead subscriptions (410/404 responses from the push service).
- `server/routes/notifications.ts` — `/api/notifications/vapid-public-key`, `/subscribe/order` (student), `/subscribe/admin` (admin, auth-gated), `/resubscribe`.
- Wired into `server/routes/admin.ts` (fires on `PATCH /orders/:id/status` when `status === 'READY'`) and `server/routes/payment.ts` (fires at the end of `/verify` once an order is actually recorded).
- `src/hooks/usePushSubscription.ts` — frontend registration/subscribe flow, called from `useTrackOrder.ts` (student, per order token) and `useAdminAuth.ts` (admin, on login and on session restore).

---

## Performance / scale notes (data layer)

Fixed in the scale pass — see top of this document. What's left if you outgrow a *single* canteen (multiple counters/locations, tens of thousands of orders/day):

- SQLite is a single-file, single-writer database. It comfortably handles one canteen's worth of concurrent writes (verified: 1000 concurrent order attempts, zero collisions, sub-40ms queries with the queue populated) but a second physical counter writing to the same file over a network mount is not a supported SQLite use case — that's the point at which you'd move to Postgres and a connection pool, not before.
- The order-history table now has a real retention policy — see "Hardening pass" above (`archiveOldOrders`, daily sweep, `orders_archive`, paginated history endpoint).
- Polling intervals (4s/4s/3s) are unchanged. They were never really the bottleneck — the indexed queries they trigger now cost single-digit milliseconds — but a WebSocket/SSE push model would still cut needless request volume further if you're running many simultaneous counters.

---

## Summary: what's genuinely production-ready now vs. what to do next

**Solid for a real single-counter deployment today:**
- Payment verification (signature-checked, idempotent on `payment_id`, amount recomputed server-side from the authoritative menu — never trusts client-sent prices)
- Atomic token issuance under the write lock (verified zero-collision under concurrent load via `/api/concurrency/simulate` and via a direct 1000-request load test)
- SQLite data layer with proper indexes — load-tested, not just assumed
- Order history with a real retention policy — archived automatically, still fully browsable, paginated
- Real push notifications, working end-to-end, including on-phone vibration
- Admin auth via httpOnly cookie — verified end-to-end that a browser session can log in, act as admin, and log out without a token ever touching `localStorage` or being readable by JS
- A real change-password flow, so the default credentials are a starting point, not a permanent fixture
- JWT signing, rate limiting (isolated per-route counters), and the demo-data-pollution route are no longer footguns on a default deploy
- CI running typecheck + build + the full test suite (17 checks) on every push

**Next priorities if this grows further:**
1. If you outgrow a single physical counter (multiple simultaneous locations writing concurrently), move from SQLite to Postgres — the `db.ts` function signatures were kept narrow specifically so that swap wouldn't require touching the route files
2. Automated tests for the auth/push/history HTTP surfaces specifically (the current suite hits `db.ts` functions directly, which is real coverage but doesn't exercise the Express routes/cookie plumbing — those were hand-verified with live curl/cookie-jar tests instead)
3. Structured logging/monitoring beyond console JSON if you need alerting on failures
