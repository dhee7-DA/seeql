// Domain Mastery — pack #6 "Logistics & Freight" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these eight tables. Money is INTEGER cents (_cents suffix),
// dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch seconds — the
// same house conventions as the Retail, Finance, Fraud, SaaS and Healthcare
// packs.
//
// The world is a parcel + freight network: twelve shipper customers tender
// packages from six hubs, drivers run delivery routes on duty shifts, every
// shipment generates a scan stream (picked_up -> arrived_hub -> departed_hub
// -> out_for_delivery -> delivered, with exception scans on the broken rows),
// and finance bills each shipper an invoice that can drift from the quoted
// freight. Damage and loss spawn claims with their own lifecycle. Four
// vocabularies matter:
//   - THE SLA LADDER: promised_date = ship_date + service days (economy 7 /
//     standard 4 / express 2). A delivered row is on-time when
//     delivered_date <= promised_date — and exactly ONE delivered shipment
//     sits EXACTLY on its promised date, so <= and < give different counts.
//   - THE BILLING LADDER: freight_cents is the quoted linehaul snapshot on
//     the shipment; the invoice carries base_cents (billed), fuel_cents
//     (always ROUND(base * 0.12)) and accessorial_cents (residential,
//     address-correction, oversize, liftgate). Billed weight is
//     MAX(weight_g, dim_weight_g) — light bulky boxes pay the "air tax".
//   - THE SCAN CLOCK: events exist only inside the trailing-60-day retention
//     window (2026-05-04 .. 2026-06-29) — earlier shipments have delivered
//     outcomes but NO scans. Hub dwell = departed_hub.ts - arrived_hub.ts;
//     per-driver scans support velocity self-joins (300s line) and
//     sessionization (1800s gap cutoff), both planted EXACTLY on the lines.
//   - THE DUTY CLOCK: driver_shifts measures end_ts - start_ts against the
//     14-hour HOS line of 50400 seconds — one shift lands EXACTLY on it and
//     one runs over.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r14-freight-probe.ts before content referenced it):
//   - the SLA wall: s01 (express) is delivered EXACTLY on its promised date —
//     on-time inclusive (<=) counts 38 of 44 delivered, strict (<) counts 37
//   - the dim-weight wall: exactly 5 shipments are lighter than their dim
//     weight (the air-tax rows) and exactly ONE ties weight == dim weight
//   - the whale: customer 10 (Junipero Outdoors) books 279000 of the 797400
//     delivered freight cents (35.0%); NA leads on his book alone, and
//     excluding him drops NA from 1st to 2nd behind EMEA (the flip)
//   - the 18000 tie: customers 3 and 6 tie at exactly 18000 delivered freight
//     on completely different shapes — RANK skips 9, DENSE_RANK doesn't, and
//     GROUP_CONCAT builds the '3,6' registry
//   - the dwell walls: s48 (customs) sits 259200s on the dock, cross-border
//     s41 holds 172800s, and s42 is EXACTLY 86400s (a full dock day) — dwell
//     >= 86400 catches 3 lanes, > catches 2
//   - the scan clocks: driver 3's 06-23 route makes 12 velocity pairs <= 300s
//     (11 strict — one pair sits EXACTLY on the 300s line) and 2 sessions;
//     driver 5's 06-20 pair is EXACTLY 1800s apart — ON the session cutoff
//     (11 sessions strict, 12 inclusive)
//   - the HOS wall: driver 2 runs one 52200s shift (OVER the 50400 line) and
//     driver 3 lands EXACTLY 50400 on 06-23; drivers 2 and 4 tie at exactly
//     58 shift deliveries while driver 1 owns 3000 km
//   - the aging board: 6 in_transit shipments aged 3/9/15/22/30/45 days as of
//     2026-07-01 — one sits EXACTLY on the 30-day line and it is the overdue
//     express that never scanned after departing its origin hub
//   - the drift trio: exactly 3 invoices bill a base that differs from the
//     shipment's quoted freight (s27 +1200, s41 +1300, s36 +1100 repriced)
//   - the claims book: 12 claims, 11 damaged + 1 lost; the lost one claims
//     EXACTLY 200000 (the insurance line — >= catches it, > catches nothing);
//     two claims tie at exactly 48000 (the twins)
//   - honest zeros: customer 11's entire book is ONE cancelled shipment
//     (freight 0, no scans, no invoice, no claim); warehouse 5 (São Paulo)
//     is the dark gateway — zero origin shipments and zero scans; 4 of the 6
//     in_transit rows are unbilled (billed on delivery); 26 delivered
//     shipments predate the event retention window and have no scans

export const DM_FREIGHT_SCHEMA = {
  ddl: `CREATE TABLE customers (
  customer_id    INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  region         TEXT NOT NULL,     -- 'NA' | 'EMEA' | 'APAC' | 'LATAM'
  segment        TEXT NOT NULL,     -- 'enterprise' | 'smb' | 'startup'
  onboarded_date TEXT NOT NULL
);

CREATE TABLE warehouses (
  warehouse_id INTEGER PRIMARY KEY,
  city         TEXT NOT NULL,
  region       TEXT NOT NULL,       -- 'NA' | 'EMEA' | 'APAC' | 'LATAM'
  hub_type     TEXT NOT NULL        -- 'gateway' | 'sort_center' | 'last_mile'
);

CREATE TABLE drivers (
  driver_id INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  region    TEXT NOT NULL,
  vehicle   TEXT NOT NULL          -- 'van' | 'truck' | 'semi'
);

CREATE TABLE shipments (
  shipment_id    INTEGER PRIMARY KEY,
  customer_id    INTEGER NOT NULL,
  origin_wh      INTEGER NOT NULL, -- pickup hub; no FK enforced (house convention)
  service        TEXT NOT NULL,    -- 'economy' | 'standard' | 'express'
  status         TEXT NOT NULL,    -- 'delivered' | 'in_transit' | 'exception' | 'returned' | 'cancelled'
  ship_date      TEXT NOT NULL,    -- 'YYYY-MM-DD', 2026-01 .. 2026-06
  promised_date  TEXT NOT NULL,    -- ship_date + SLA days: economy 7 / standard 4 / express 2
  delivered_date TEXT,             -- NULL unless status = 'delivered'
  weight_g       INTEGER NOT NULL,
  dim_weight_g   INTEGER NOT NULL, -- dimensional weight; billed weight = MAX(weight_g, dim_weight_g)
  distance_km    INTEGER NOT NULL,
  freight_cents  INTEGER NOT NULL  -- quoted linehaul snapshot; 0 on cancelled rows
);

CREATE TABLE shipment_events (
  event_id     INTEGER PRIMARY KEY,
  shipment_id  INTEGER NOT NULL,
  event_type   TEXT NOT NULL,      -- 'picked_up' | 'arrived_hub' | 'departed_hub' | 'out_for_delivery' | 'delivered' | 'exception'
  warehouse_id INTEGER,            -- origin hub on pickup/hub scans; NULL on last-mile/exception scans
  driver_id    INTEGER,            -- NULL on hub scans (arrived_hub / departed_hub)
  event_ts     INTEGER NOT NULL    -- epoch seconds; retention window 2026-05-04 .. 2026-06-28
);

CREATE TABLE driver_shifts (
  shift_id        INTEGER PRIMARY KEY,
  driver_id       INTEGER NOT NULL,
  duty_date       TEXT NOT NULL,
  start_ts        INTEGER NOT NULL, -- epoch seconds
  end_ts          INTEGER NOT NULL, -- duty length = end_ts - start_ts; HOS line = 50400s (14h)
  deliveries_made INTEGER NOT NULL, -- stop count from the dispatch system (independent of scan events)
  distance_km     INTEGER NOT NULL
);

CREATE TABLE invoices (
  invoice_id        INTEGER PRIMARY KEY,
  customer_id       INTEGER NOT NULL,
  shipment_id       INTEGER NOT NULL,
  issue_date        TEXT NOT NULL,  -- ship_date + 1 day
  base_cents        INTEGER NOT NULL, -- linehaul actually billed; drifts from freight_cents on exactly 3 rows
  fuel_cents        INTEGER NOT NULL, -- ROUND(base_cents * 0.12) on every row
  accessorial_cents INTEGER NOT NULL, -- residential / address / oversize / liftgate fees; 0 on most rows
  status            TEXT NOT NULL    -- 'paid' | 'pending' | 'disputed'
);

CREATE TABLE freight_claims (
  claim_id      INTEGER PRIMARY KEY,
  shipment_id   INTEGER NOT NULL,
  claim_type    TEXT NOT NULL,     -- 'lost' | 'damaged'
  claimed_cents INTEGER NOT NULL,
  filed_date    TEXT NOT NULL,
  status        TEXT NOT NULL,     -- 'open' | 'approved' | 'denied'
  decided_date  TEXT               -- NULL while open
);`,
  tables: [
    { name: "customers", note: "12 shippers across 4 regions — customer 10 is the whale (35.0% of delivered freight), customer 3 and 6 tie at 18000, customer 11's entire book is one cancelled shipment" },
    { name: "warehouses", note: "6 hubs — warehouse 5 (São Paulo) is the dark gateway with zero origin shipments and zero scans" },
    { name: "drivers", note: "8 drivers across 3 vehicle classes — driver 3 owns the 06-23 velocity burst, driver 5 the 1800s boundary pair, driver 1 the 3000 km crown" },
    { name: "shipments", note: "58 shipments, 2026-01 .. 2026-06 — 44 delivered / 6 in_transit / 4 exception / 2 returned / 2 cancelled; SLA = economy 7d, standard 4d, express 2d; one delivered row sits EXACTLY on its promised date" },
    { name: "shipment_events", note: "125 scan events inside the 2026-05-04 .. 2026-06-29 retention window — dwell walls at 259200 / 172800 / 86400s, 12 velocity pairs <= 300s (one EXACTLY 300), a 1800s pair ON the session cutoff" },
    { name: "driver_shifts", note: "28 duty shifts — one EXACTLY 50400s (the 14h HOS line), one 52200s over it; drivers 2 and 4 tie at 58 deliveries, driver 1 runs 3000 km" },
    { name: "invoices", note: "52 invoices (44 delivered + 4 exception + 2 returned + 2 prepaid in_transit) — fuel = ROUND(base * 0.12) everywhere, 3 drift rows reprice the quoted freight, 5 rows carry accessorials" },
    { name: "freight_claims", note: "12 claims (11 damaged / 1 lost) — the lost one claims EXACTLY 200000 (the insurance line), two twins at 48000; open 5 / approved 4 / denied 3" },
  ],
};
