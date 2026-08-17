# CanteenOS — Canteen Order & Token System
*BuildX Skill Showcase — Full-Stack Web Development Track*

A full-stack canteen digital ordering and token management system designed to eliminate physical queue congestion in college canteens handling 500–1,000 orders/day.

---

## 🚀 Local Setup (Run This First)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Start the dev server (frontend + backend on one port)
npm run dev
```

Then open **http://localhost:3000**.

- A fresh `canteen_data.xlsx` (9 default menu items, empty order queue, empty token counter) is generated automatically on first boot — no manual setup needed.
- Admin login: `admin` / `admin123` (see Security Notice below).
- Payments run in built-in Test/Sandbox mode by default — no real money moves, no external account needed. See **Environment Variables** below to go live with real Razorpay credentials.

---

## 🏛️ System Architecture

- **Frontend**: React 18 + Tailwind CSS (Clean Minimalism design theme, mobile-first responsive)
- **Backend**: Node.js + Express REST API (Hand-written routes, single-writer async mutex)
- **Data Store**: Excel Workbook (`canteen_data.xlsx`) managed via the `xlsx` library with write-ahead timestamped backup recovery.
- **Payment Gateway**: Razorpay (Test/Sandbox Mode) with HMAC-SHA256 server-side signature re-verification.
- **Admin Auth**: Short-lived JWT with bcrypt password hashing stored in the Excel `Admin` sheet.

---

## 🔒 The Two Core Technical Pillars

### 1. In-Process Single-Writer Async Mutex (`withWriteLock`)
Because an Excel workbook cannot handle simultaneous file writes without data corruption or race conditions:
1. Every write operation (order creation, status update, counter increment, menu toggle) acquires an exclusive in-process mutex lock (`async-mutex`).
2. Inside the lock, the backend reads fresh workbook state from disk.
3. The mutation is applied and written atomically with write-ahead snapshot backup safety.
4. The mutex lock is released for the next queued request.
5. **Result**: 100% deterministic, sequentially unique 4-digit tokens (`1001`, `1002`, ...) with zero duplicate collisions and zero overselling of last-unit inventory.

### 2. Server-Side Payment Verification & Idempotency
- The client NEVER creates a token or writes to the database directly.
- The backend independently re-verifies the Razorpay HMAC signature with `RAZORPAY_KEY_SECRET`.
- An idempotency check on `payment_id` prevents duplicate callbacks or network retries from double-minting tokens.

---

## 📋 Excel Workbook Structure (`canteen_data.xlsx`)

| Sheet Name | Columns | Description |
| :--- | :--- | :--- |
| **`Menu`** | `item_id`, `name`, `category`, `price`, `available` | Live catalog of dishes and instant stock toggles |
| **`Orders`** | `token_id`, `date`, `items`, `total_amount`, `payment_id`, `payment_status`, `order_status`, `timestamp` | Full transaction ledger and order status |
| **`Counter`** | `date`, `last_serial` | Daily sequential counter resetting to 1001 every midnight |
| **`Admin`** | `username`, `password_hash` | Bcrypt-hashed staff credentials |

---

## 🔑 Demo Credentials & Security Notice

## 🔑 Environment Variables & Demo Configuration

To run with custom Razorpay or JWT keys, configure in `.env`:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=supersecret_canteen_jwt_key_2026
RAZORPAY_KEY_ID=rzp_test_demo12345
RAZORPAY_KEY_SECRET=demo_razorpay_secret_key_67890
```

- **Demo Admin Login**:
  - Username: `admin`
  - Password: `admin123`
  - *(Production Security Note: These seeded credentials are provided solely for hackathon evaluation and demo testing. In a live production deployment, default credentials must be replaced via environment variables or a first-boot credential rotation process before canteen go-live).*
- **Razorpay Sandbox Payment**:
  - Test Card: `4111 1111 1111 1111` (Any future MM/YY, CVV `123`)
  - Test UPI: `success@razorpay`

---

## ⚡ Architectural Tradeoff & Scale Analysis (Judge FAQ)

- **Fresh Disk Read on Locked Write**: `readWorkbook()` reads and parses the Excel file fresh inside `withWriteLock` before every write. 
  - **Why this was chosen**: Guarantees 100% ACID-like consistency, zero stale in-memory state, and complete recovery from file changes.
  - **Performance at Target Volume**: At the canteen's target volume of 500–1,000 orders/day with peak bursts of 40+ orders in a 10-minute rush window (~0.07 orders/sec peak), disk I/O latency (~3–8ms per write) is well within performance limits and introduces zero bottleneck.
  - **Scale Path**: For larger scale (10,000+ orders/min), this can transition to an in-memory cached state with debounced write-back buffers or append-only transactional logging.
- **In-Memory Pending Orders Registry**: Server-authorized pending order amounts and items are tracked in memory during the checkout intent phase to prevent amount/item tampering between create-order and verify. If the dev server is restarted during an active checkout window, students simply re-initiate checkout.
- **Date-Scoped Token Queries**: Because numeric tokens reset to `1001` daily at midnight while the `Orders` sheet retains all historic records, all order tracking, display queues, and status mutations are strictly scoped by `date: YYYY-MM-DD` to guarantee day-to-day data isolation without clearing the audit log.

---

## ⏱️ Live Dynamic Queue & Wait Estimation (PRD 5.1)

- The queue depth displayed to students is dynamically calculated from the live count of active orders (`PLACED` and `PREPARING`) directly in the `Orders` sheet of the Excel data layer.
- Estimated wait time uses real queue depth: `Wait = Max(5 min, (Queue Depth × 3.5 min) + 5 min base prep time)`.
- Updates dynamically in real-time as kitchen staff advances orders through the queue lifecycle.

---

## 🧪 Live Demo Rehearsal Script (Judge Presentation Flow)

### Script 1: The Two-Tab Last-Unit Race (TDD Section 12 — Core Live Proof)
1. **Setup**: Open two browser tabs side-by-side on the **Student Menu** (`Tab A` and `Tab B`).
2. **Admin Setup**: In a third tab, log into **Admin Dashboard** (`admin` / `admin123`) and verify that a target dish (e.g. *Masala Dosa*) is available.
3. **Cart Staging**: In both `Tab A` and `Tab B`, add 1 *Masala Dosa* to the cart and open the Checkout modal.
4. **The Trigger**: Simultaneously click **"Authorize ₹60 Test Payment"** in both tabs within the same second.
5. **The Outcome to Point Out to Judges**:
   - **Tab A (First millisecond to acquire write lock)**: Payment verifies, item passes atomic availability check, sequential token (e.g. `#1003`) is generated, order is persisted to Excel.
   - **Tab B (Second in mutex queue)**: Acquires lock, detects the dish was claimed/sold-out inside the locked transaction, **rejects the order cleanly** with an explicit error alert (*"Item Masala Dosa was sold out while checking out"*), and leaves zero orphaned rows in Excel.
   - Point out that **only 1 student gets a token and no over-selling ever occurs**.

### Script 2: Automated 10-Thread Concurrency Simulation
1. Click the **"Concurrency Lab"** tab in the header.
2. Select **"Last-Unit Race"** mode with **10 Simultaneous Orders**.
3. Click **"Launch Live Concurrency Test"**.
4. Show the live verdict card: **10 attempted, Exactly 1 Won with a token, 9 Cleanly Rejected**, total test duration < 80ms.
5. Switch to **"Standard Rush"** mode with **20 Simultaneous Orders**: show **100% Unique Tokens** generated in perfect sequential order (`#1004`, `#1005`, ..., `#1023`) with zero collisions.

### Script 3: End-to-End Kitchen Lifecycle Sync
1. Place a student order and note the token (e.g. `#1024`).
2. Open **Track Token** tab in one window, and **Now Serving Display** (TV view) in another window.
3. In **Admin Dashboard**, click **"Begin Prep"** ➔ Watch status on Student Tracker turn blue (*"Kitchen Preparing"*), and token move to the Amber column on the TV screen.
4. Click **"Mark Ready"** ➔ Watch Student Tracker play a notification pulse and turn green (*"Ready at Counter"*), and TV screen chime token into the Emerald column.
5. Click **"Mark Served"** ➔ Order completes and moves to today's completed ledger.
#   B u i l d X  
 