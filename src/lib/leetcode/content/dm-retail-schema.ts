// Domain Mastery — pilot pack "Retail & RFM" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these six tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Data & Finance track.
//
// The seed plants deliberate edge cases (every one probe-verified before
// content referenced it):
//   - customer 11 signs up but NEVER orders (anti-join bait)
//   - product "USB-C Hub" never sells (zero-sale product)
//   - order_items.unit_price_cents drifts from products.price_cents on a few
//     rows (historic snapshot pricing — join-back trap)
//   - discount_cents is NULL on most rows (NULL-arithmetic traps)
//   - exact ties on daily revenue and on RFM scores (RANK vs DENSE baits)
//   - an exactly-at-threshold spend day (inclusive-boundary bait)
//   - events cluster into sessions seconds apart, with one 40-minute gap
//     (sessionization bait) and a burst of 4 cart events in 3 minutes
//     (velocity bait)
//   - customer 3 returns five items (return-abuse flag bait)
//   - LATAM region has exactly 2 customers (honest-zero / small-cut bait)
//   - cancelled + pending orders exist (status-filter traps)

export const DM_RETAIL_SCHEMA = {
  ddl: `CREATE TABLE customers (
  customer_id  INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  region       TEXT NOT NULL,       -- 'US' | 'EU' | 'APAC' | 'LATAM'
  signup_date  TEXT NOT NULL,       -- 'YYYY-MM-DD'
  segment      TEXT NOT NULL        -- 'new' | 'regular' | 'vip'
);

CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,       -- 'Audio' | 'Video' | 'Wearables' | 'Accessories' | 'Smart Home'
  price_cents  INTEGER NOT NULL,
  cost_cents   INTEGER NOT NULL
);

CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,    -- no FK enforced (house convention)
  order_date   TEXT NOT NULL,       -- 'YYYY-MM-DD', 2026-03 .. 2026-08
  status       TEXT NOT NULL        -- 'delivered' | 'shipped' | 'cancelled' | 'pending'
);

CREATE TABLE order_items (
  order_item_id    INTEGER PRIMARY KEY,
  order_id         INTEGER NOT NULL,
  product_id       INTEGER NOT NULL,
  quantity         INTEGER NOT NULL,   -- 1..3
  unit_price_cents INTEGER NOT NULL,   -- snapshot at sale time (may drift from products)
  discount_cents   INTEGER             -- NULL = no discount
);

CREATE TABLE events (
  event_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  event_ts     INTEGER NOT NULL,    -- epoch seconds
  event_type   TEXT NOT NULL,       -- 'view' | 'cart' | 'checkout'
  page         TEXT NOT NULL
);

CREATE TABLE returns (
  return_id    INTEGER PRIMARY KEY,
  order_item_id INTEGER NOT NULL,   -- references order_items
  return_date  TEXT NOT NULL,       -- 'YYYY-MM-DD'
  reason       TEXT NOT NULL        -- 'damaged' | 'wrong-item' | 'buyer-remorse'
);`,
  tables: [
    { name: "customers", note: "12 shoppers across 4 regions — customer 11 signs up and never orders; LATAM holds exactly 2" },
    { name: "products", note: "14 items in 5 categories — the USB-C Hub never sells" },
    { name: "orders", note: "56 orders, 2026-03 .. 2026-08, four statuses with deliberate ties and boundary dates" },
    { name: "order_items", note: "108 lines — unit_price_cents drifts from catalog price on 3 rows, discount_cents set on 11" },
    { name: "events", note: "72 funnel events in epoch seconds — one 40-minute session gap, one 4-cart burst" },
    { name: "returns", note: "12 returns — customer 3 accounts for 5 of them" },
  ],
};
