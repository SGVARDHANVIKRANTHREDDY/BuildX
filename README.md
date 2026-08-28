# CanteenOS — Digital Canteen Order & Token System

A full-stack canteen ordering system: students place orders and pay online, the kitchen
manages a live order queue, and a public display board shows order status — all backed
by a single Excel (`.xlsx`) file instead of a traditional database.

Built with **React + Vite** (frontend) and **Express + TypeScript** (backend), served
from a single Node process.

---

## How it works, at a glance

- **Menu & Order** — students browse the menu, add items to a cart, and pay (via
  Razorpay, sandbox mode by default — no real money moves unless you add live keys).
- **Track Token** — after paying, a 4-digit Kitchen Order Token (KOT) is issued.
  Students can look up their token to see live status: Placed → Preparing → Ready → Served.
- **Now Serving** — a public, TV-friendly display board showing what's ready for
  pickup and what's currently being prepared.
- **Admin Queue** — kitchen staff log in to see all incoming orders, advance them
  through their lifecycle, and toggle menu item availability.
- **Concurrency Lab** — a live demo panel showing the app's single-writer mutex
  correctly preventing duplicate tokens under simultaneous order load.

### Why Excel instead of a database?

All state (menu, orders, token counter, admin login) lives in one `.xlsx` file. Every
write goes through an in-process **async mutex** (`server/utils/writeLock.ts`), so
only one write happens at a time, and a timestamped backup snapshot is taken before
each write for crash recovery. This keeps the project dependency-free and easy to run
anywhere — the tradeoff is that **the app must run as a single instance**; it cannot be
horizontally scaled across multiple server processes (see [Limitations](#limitations)).

---

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer (tested on Node 22)
- npm (comes with Node)

---

## Getting started

```bash
# 1. Clone the repo
git clone https://github.com/SGVARDHANVIKRANTHREDDY/BuildX.git
cd BuildX

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Open `.env` and check the values — for local development you can leave everything as
the defaults:

```env
JWT_SECRET="your_own_random_string"

# Leave these two exactly as-is to run in sandbox/test payment mode.
# Replace both with real Razorpay Dashboard keys to go live.
RAZORPAY_KEY_ID="rzp_test_sampleKey123"
RAZORPAY_KEY_SECRET="sampleSecretKey123456"
```

```bash
# 4. Run it
npm run dev
```

Open **http://localhost:3000** — the app serves both the API and the frontend from
the same port.

On first boot, if `server/data/canteen_data.xlsx` doesn't exist yet, the app
automatically creates one with a starter menu and a default admin account. Check the
**Staff Login** screen in the app for the current demo credentials.

---

## Everyday workflows

### Placing an order (student side)
1. Go to **Menu & Order**, add items to your cart.
2. Open the cart and check out. In sandbox mode, no real payment gateway is called —
   the app simulates a successful payment.
3. You'll receive a 4-digit token (e.g. `#1001`).
4. Go to **Track Token**, enter your token, and watch its status update live.

### Managing orders (kitchen/admin side)
1. Go to **Admin Queue** → log in with the staff credentials shown on the login screen.
2. Incoming orders appear sorted by payment time. Use **Begin Prep** → **Mark Ready** →
   **Mark Served** to move each order through its lifecycle.
3. Toggle any menu item's availability from the **Menu Availability** panel — this
   instantly hides/shows it on the student-facing menu.

### Public display board
Open **Now Serving** on any screen (e.g. a TV near the counter) — it auto-refreshes
to show what's ready for pickup and what's currently in the kitchen, with no login
required.

### Running the test suite
```bash
npm test
```
Runs `server/testFullSuite.ts` — 15 checks covering the data layer, admin auth,
token generation, payment signature verification, concurrent-write safety, and the
full order lifecycle.

---

## Production build

```bash
npm run build   # builds the frontend (Vite) and bundles the server (esbuild)
npm start       # runs the production build from dist/
```

The server reads the port from `process.env.PORT` (falling back to `3000` locally),
so it works out of the box on platforms like Render or Railway that assign a
dynamic port.

---

## Deployment

This app needs **persistent local disk** (for the Excel data file) and must run as
**exactly one instance** — that rules out serverless platforms and auto-scaling
multi-replica setups.

Good fits: [Render](https://render.com), [Railway](https://railway.app), or
[Fly.io](https://fly.io), or any VPS/Docker host.

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment variables:** set `JWT_SECRET`, `RAZORPAY_KEY_ID`,
  `RAZORPAY_KEY_SECRET`, and `NODE_ENV=production`

A `Dockerfile` is included for container-based deployment. Mount `server/data` as a
persistent volume if you want order history to survive restarts.

> **Free-tier note:** on platforms without a persistent disk (e.g. Render's free
> tier), the data file resets to a clean starter state every time the service
> restarts or spins down from inactivity. Fine for demos; for real production use
> you'll need a plan with persistent storage.

---

## Project structure

```
server/               Express API
  routes/              menu, order, payment, admin, display, concurrency
  utils/                excelHandler (data access), writeLock (mutex), tokenGenerator
  middleware/          auth, rate limiting, validation
  data/                canteen_data.xlsx (generated at runtime, git-ignored)
src/                   React frontend
  components/           organized by area: student, admin, track, display, concurrency
  hooks/                data-fetching and state logic
  lib/                  small shared utilities
server.ts              app entry point
```

---

## Limitations

- **Single instance only** — the write-lock mutex only coordinates writes within one
  Node process. Running multiple replicas will corrupt the data file.
- **Not a durable database** — suitable for a small canteen counter's order volume,
  not high-traffic or multi-location use.
- Default admin credentials are meant for demos — change them (and ideally move them
  to an environment variable) before any real-world use.
