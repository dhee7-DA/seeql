// Domain Mastery — pack #9 "Energy & Grid Ops" · shared world schema + seed.
//
// ONE dataset backs the entire pack: 60 query problems, 60 MCQs and 60 case
// studies all read these nine tables. Money is INTEGER cents (_cents suffix),
// kWh is INTEGER, dates are 'YYYY-MM-DD' text, timestamps are INTEGER epoch
// seconds — the same house conventions as the Retail, Finance, Fraud, SaaS,
// Healthcare, Freight, Marketing and Insurance packs.
//
// The world is a grid operation: six utilities share an interconnection,
// fourteen plants generate across six fuels, twelve substations step the
// voltage down, 36 meters read three tariffs, interval telemetry lands per
// meter, outages walk a six-cause vocabulary with a five-minute regulatory
// wall, crews dispatch to the substantive ones, and the billing ledger
// prices every period at a snapshot rate. Five vocabularies matter:
//   - THE 5-MINUTE WALL: a regulatory momentary is duration <= 300s. Two
//     outages sit EXACTLY on 300s, so the momentary board is 7 inclusive vs
//     5 strict, and the sustained count flips with the edge.
//   - THE BILLING WHALE: meter 1 (Aurora Alloys, industrial) bills
//     14400000 = 58.1% of the 24783750-cent ledger; the moment it leaves,
//     the tariff board flips industrial -> commercial.
//   - THE TELEMETRY CLOCK: meter 1 carries EXACTLY 100 June readings with
//     ONE gap of EXACTLY 1800s — 7 sessions strict (gap > 1800 splits) vs
//     8 inclusive (>= 1800 splits).
//   - THE STORM RING: OUT-2471..OUT-2477 — seven contiguous numbers, one
//     March night, all storm, all Cascadia; five restored with crew clocks
//     averaging EXACTLY 38 min response and 230 min restore; two still burn.
//   - THE LADDER: unpaid balances hit EXACTLY 500000 on two meters (m11,
//     m16) with m14 above at 889740 — >= 500000 vs > 500000 = 3 vs 1.
//
// The seed plants deliberate edge cases (every one probe-verified by
// scripts/r23-grid-world.ts before content referenced it):
//   - the whale: Aurora Alloys' three 4800000-cent bills are 58.1% of
//     billed; ex-whale commercial (5897214) takes the tariff crown from
//     industrial (3770820)
//   - the flicker pairs: Fir's OUT-2450/2451 start 180s apart, Hawthorne's
//     OUT-2465/2466 EXACTLY 240s apart — 2 pairs inclusive, 1 strict
//   - the ceiling: Columbia Rim sits EXACTLY on 20 outages (Cascadia holds
//     30) — the utility board splits 2 vs 1 across the line
//   - the mirror tie: OUT-2462 and OUT-2479 affect EXACTLY 4200 customers
//     (the registry prints '62,79'; RANK 10,10 vs DENSE 10,11)
//   - the response SLA: dispatch 28 arrives EXACTLY 3600s after dispatch —
//     >= 3600 catches 1, > 3600 catches 0
//   - crew 1 (Mara Quinn) cleared EXACTLY 20; crew 8 never dispatched
//   - the leak: outage 44 still burns since 2026-05-28 with NO dispatch —
//     9800 customers in the dark with nobody assigned
//   - the rate drift trio: bills 35/59/81 priced at a stale rate; bill 35
//     PAID anyway at the old 10-cent rate
//   - the capacity tie: plants 2 and 3 EXACTLY 850 MW (registry '2,3')
//   - the storm king: OUT-2405 alone is 30.61% of the 202533
//     affected-customer moments; ex-king the cause board flips to equipment
//   - honest zeros: Cedar never went dark (0 outages), crew 8 dark, the
//     idle and disconnected meters carry 0 readings, Bluewater has never
//     issued a delinquent bill, and February 2026 holds zero outages

export const DM_GRID_SCHEMA = {
  ddl: `CREATE TABLE utilities (
  utility_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  hq_city    TEXT NOT NULL,
  founded    INTEGER NOT NULL
);

CREATE TABLE plants (
  plant_id     INTEGER PRIMARY KEY,
  utility_id   INTEGER NOT NULL REFERENCES utilities(utility_id),
  name         TEXT NOT NULL,
  fuel         TEXT NOT NULL,     -- 'hydro' | 'gas' | 'wind' | 'solar' | 'nuclear' | 'coal'
  capacity_mw  INTEGER NOT NULL,
  region       TEXT NOT NULL,     -- 'metro' | 'north' | 'south' | 'east' | 'coast'
  commissioned INTEGER NOT NULL
);

CREATE TABLE substations (
  substation_id    INTEGER PRIMARY KEY,
  utility_id       INTEGER NOT NULL REFERENCES utilities(utility_id),
  name             TEXT NOT NULL,
  region           TEXT NOT NULL,
  voltage_kv       INTEGER NOT NULL,
  customers_served INTEGER NOT NULL
);

CREATE TABLE meters (
  meter_id      INTEGER PRIMARY KEY,
  substation_id INTEGER NOT NULL REFERENCES substations(substation_id),
  customer_name TEXT NOT NULL,
  tariff        TEXT NOT NULL,    -- 'residential' | 'commercial' | 'industrial'
  rate_cents    INTEGER NOT NULL, -- current price per kWh in cents (the drift reference)
  status        TEXT NOT NULL     -- 'active' | 'idle' | 'disconnected'
);

CREATE TABLE readings (
  reading_id INTEGER PRIMARY KEY,
  meter_id   INTEGER NOT NULL REFERENCES meters(meter_id),
  read_ts    INTEGER NOT NULL,  -- epoch seconds; the sessionization anchor
  kwh        INTEGER NOT NULL
);

CREATE TABLE outages (
  outage_id          INTEGER PRIMARY KEY,
  outage_number      TEXT NOT NULL, -- 'OUT-2401' .. 'OUT-2495'
  utility_id         INTEGER NOT NULL REFERENCES utilities(utility_id),
  substation_id      INTEGER NOT NULL REFERENCES substations(substation_id),
  cause              TEXT NOT NULL, -- 'storm' | 'equipment' | 'vegetation' | 'animal' | 'operator' | 'traffic'
  status             TEXT NOT NULL, -- 'restored' | 'active'
  started_ts         INTEGER NOT NULL,
  restored_ts        INTEGER,       -- NULL while active
  customers_affected INTEGER NOT NULL
);

CREATE TABLE crews (
  crew_id    INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  utility_id INTEGER NOT NULL REFERENCES utilities(utility_id),
  depot      TEXT NOT NULL,
  specialty  TEXT NOT NULL     -- 'line' | 'vegetation' | 'substation' | 'trouble'
);

CREATE TABLE dispatches (
  dispatch_id   INTEGER PRIMARY KEY,
  outage_id     INTEGER NOT NULL REFERENCES outages(outage_id),
  crew_id       INTEGER NOT NULL REFERENCES crews(crew_id),
  dispatched_ts INTEGER NOT NULL,
  arrived_ts    INTEGER,         -- NULL while en route
  status        TEXT NOT NULL    -- 'cleared' | 'onsite' | 'enroute'
);

CREATE TABLE bills (
  bill_id      INTEGER PRIMARY KEY,
  meter_id     INTEGER NOT NULL REFERENCES meters(meter_id),
  period       TEXT NOT NULL,    -- '2026-04' | '2026-05' | '2026-06'
  kwh_billed   INTEGER NOT NULL,
  rate_cents   INTEGER NOT NULL, -- snapshot price per kWh at issuance
  amount_cents INTEGER NOT NULL,
  status       TEXT NOT NULL,    -- 'paid' | 'issued' | 'delinquent'
  issued_on    TEXT NOT NULL,
  paid_on      TEXT              -- NULL while unpaid
);`,
  tables: [
    { name: "utilities", note: "6 utilities on one interconnection — Cascadia Power carries 30 outages, Columbia Rim sits EXACTLY on 20 (the ceiling), Bluewater is the delinquent-free newcomer" },
    { name: "plants", note: "14 plants across 6 fuels — Spokane Basin Nuclear leads at 2400 MW; the 850 MW tie (Gorge Pass Wind / Nisqually Falls Hydro) prints registry '2,3'" },
    { name: "substations", note: "12 substations — Cedar is the dark one (0 outages); Icicle hosts the storm ring; meter utility always derives through the substation (the 2-hop join)" },
    { name: "meters", note: "36 meters across 3 tariffs — meter 1 is Aurora Alloys, the 58.1% billing whale; m35 idle and m36 disconnected carry zero readings; rate_cents is the current price for drift audits" },
    { name: "readings", note: "182 interval rows — meter 1 holds EXACTLY 100 June readings with ONE gap of EXACTLY 1800s (7 sessions strict vs 8 inclusive)" },
    { name: "outages", note: "95 outages, OUT-2401..OUT-2495 — two restorations EXACTLY on the 300s line (momentary 7 vs 5), the flicker pairs (180s/240s), the storm ring OUT-2471..2477, and outage 44 still burning with no crew" },
    { name: "crews", note: "8 crews — Mara Quinn cleared EXACTLY 20; Simeon Okoye (crew 8) never dispatched; seven restorations landed by auto-reclose with no crew at all" },
    { name: "dispatches", note: "86 dispatches — one arrival EXACTLY on the 3600s SLA line (dispatch 28); 84 cleared plus one onsite and one enroute; the clock is arrived_ts - dispatched_ts" },
    { name: "bills", note: "104 bills across 3 periods — ledger EXACTLY 24783750 cents billed; the 500000 ladder (3 vs 1), the stale-rate drift trio with bill 35 PAID, and Aurora's 14400000 whale" },
  ],
};
