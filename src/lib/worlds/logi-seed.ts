// Meridian Freight — a "data world" for the Data explorer.
// Pure deterministic seed data + DDL. Highlights: two foreign keys into the
// same table (shipments.origin_id / dest_id → warehouses — the ALIAS lesson),
// NULL delivered_at meaning "still in flight", and a claims ledger.

export const LOGI_TABLES = ["claims", "stops", "shipments", "carriers", "warehouses"] as const;

export const LOGI_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    capacity_kg INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS carriers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    mode TEXT NOT NULL,
    reliability REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY,
    ref TEXT NOT NULL,
    origin_id INTEGER NOT NULL REFERENCES warehouses(id),
    dest_id INTEGER NOT NULL REFERENCES warehouses(id),
    carrier_id INTEGER NOT NULL REFERENCES carriers(id),
    status TEXT NOT NULL,
    weight_kg INTEGER NOT NULL,
    dispatched_at TEXT NOT NULL,
    delivered_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS stops (
    id INTEGER PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(id),
    seq INTEGER NOT NULL,
    location TEXT NOT NULL,
    arrived_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(id),
    filed_on TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    settled_on TEXT
  )`,
];

export const LOGI_COLUMNS: Record<string, string[]> = {
  warehouses: ["id", "code", "city", "region", "capacity_kg"],
  carriers: ["id", "name", "mode", "reliability"],
  shipments: ["id", "ref", "origin_id", "dest_id", "carrier_id", "status", "weight_kg", "dispatched_at", "delivered_at"],
  stops: ["id", "shipment_id", "seq", "location", "arrived_at"],
  claims: ["id", "shipment_id", "filed_on", "amount_cents", "reason", "status", "settled_on"],
};

type WRow = [number, string, string, string, number];
const WAREHOUSES: WRow[] = [
  [1, "M-BER", "Berlin", "EU", 120000],
  [2, "M-PRG", "Prague", "EU", 80000],
  [3, "M-LIS", "Lisbon", "EU", 65000],
  [4, "M-ORD", "Chicago", "US", 150000],
  [5, "M-SIN", "Singapore", "APAC", 95000],
  [6, "M-GRU", "São Paulo", "LATAM", 70000],
];

type CRow = [number, string, string, number];
const CARRIERS: CRow[] = [
  [1, "TransEuro Line", "road", 0.96],
  [2, "BlueRail Freight", "rail", 0.93],
  [3, "Skybridge Cargo", "air", 0.89],
  [4, "OceanMeridian", "sea", 0.9],
  [5, "RapidWing", "air", 0.85],
  [6, "RoadHaul One", "road", 0.91],
];

// Hub cities for intermediate stops (never an origin/dest itself in most cases).
const STOP_CITIES = ["Dresden", "Nuremberg", "Lyon", "Bordeaux", "Cleveland", "Denver", "Colombo", "Rotterdam", "Salvador", "Brno"] as const;

// 40 shipments. status: delivered 22, in_transit 9, held 5, planned 4 —
// only delivered rows carry delivered_at (dispatch + 2..9 days).
// Deterministic generator: routes cycle a fixed table, weights/statuses from
// the id, with the exact status split enforced by a lookup list.
const ROUTES: Array<[number, number, number]> = [
  // [origin, dest, carrier]
  [1, 2, 1], [1, 4, 3], [2, 3, 1], [3, 1, 2], [4, 1, 3], [1, 5, 3], [5, 1, 4],
  [1, 6, 3], [6, 1, 4], [2, 4, 2], [4, 2, 5], [3, 5, 4], [5, 3, 6], [2, 6, 2],
  [6, 2, 1], [3, 4, 2], [4, 3, 3], [1, 3, 6], [3, 2, 6], [4, 5, 5], [5, 4, 3],
  [2, 5, 4], [5, 2, 3], [6, 4, 4], [4, 6, 4], [1, 2, 2], [2, 1, 1], [3, 6, 4],
  [6, 3, 2], [4, 1, 5], [5, 6, 6], [6, 5, 1], [2, 3, 6], [3, 4, 1], [4, 2, 2],
  [1, 5, 5], [5, 1, 6], [2, 6, 3], [6, 2, 2], [1, 4, 4],
];

const STATUSES: string[] = [
  // ids 1-40 → exactly 22 delivered, 9 in_transit, 5 held, 4 planned
  ...Array.from({ length: 22 }, () => "delivered"),
  ...Array.from({ length: 9 }, () => "in_transit"),
  ...Array.from({ length: 5 }, () => "held"),
  ...Array.from({ length: 4 }, () => "planned"),
];

export function buildLogiSeed() {
  const rows: Array<{ table: string; values: Array<string | number | null> }> = [];
  for (const w of WAREHOUSES) rows.push({ table: "warehouses", values: w });
  for (const c of CARRIERS) rows.push({ table: "carriers", values: c });

  const addDays = (iso: string, days: number): string => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const delivered: Array<[number, string]> = []; // [shipmentId, delivered_at]
  const transit: number[] = [];
  const held: number[] = [];
  const planned: number[] = [];

  for (let i = 0; i < 40; i++) {
    const id = i + 1;
    const [origin, dest, carrier] = ROUTES[i];
    const status = STATUSES[i];
    const weight = 40 + ((id * 137) % 9160); // 40 – 9,199 kg
    const month = 6 + (id % 4); // 06 – 09 (2025)
    const day = 1 + ((id * 11) % 28);
    const dispatched = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const deliveredAt =
      status === "delivered" ? addDays(dispatched, 2 + (id % 8)) : null;
    rows.push({
      table: "shipments",
      values: [id, `SH-2025-${String(id).padStart(3, "0")}`, origin, dest, carrier, status, weight, dispatched, deliveredAt],
    });
    if (status === "delivered") delivered.push([id, deliveredAt as string]);
    else if (status === "in_transit") transit.push(id);
    else if (status === "held") held.push(id);
    else planned.push(id);
  }

  // Stops: delivered shipments get 1-2 completed stops; in_transit get 1 done
  // + 1 pending (arrived_at NULL); held get 1 pending; planned get none.
  let sid = 0;
  for (const [id, deliveredAt] of delivered) {
    const n = id % 2 === 0 ? 2 : 1;
    for (let k = 1; k <= n; k++) {
      rows.push({
        table: "stops",
        values: [++sid, id, k, STOP_CITIES[(id * 3 + k) % STOP_CITIES.length], addDays(deliveredAt, -n + k - 1)],
      });
    }
  }
  for (const id of transit) {
    rows.push({ table: "stops", values: [++sid, id, 1, STOP_CITIES[(id * 3) % STOP_CITIES.length], `2025-09-1${id % 9}`] });
    rows.push({ table: "stops", values: [++sid, id, 2, STOP_CITIES[(id * 5 + 1) % STOP_CITIES.length], null] });
  }
  for (const id of held) {
    rows.push({ table: "stops", values: [++sid, id, 1, STOP_CITIES[(id * 7 + 2) % STOP_CITIES.length], null] });
  }

  // Claims: 7 claims over 6 shipments (shipment 3 has two). Open claims have
  // settled_on NULL.
  const CLAIMS: Array<[number, string, number, string, string, string | null]> = [
    [3, "2025-07-12", 41200, "damage", "settled", "2025-07-30"],
    [3, "2025-07-21", 15800, "delay", "settled", "2025-08-02"],
    [7, "2025-07-18", 125000, "lost", "open", null],
    [12, "2025-08-04", 23400, "damage", "rejected", null],
    [18, "2025-08-11", 87000, "lost", "open", null],
    [22, "2025-08-19", 9900, "delay", "settled", "2025-09-01"],
    [27, "2025-08-27", 34600, "damage", "open", null],
  ];
  let cid = 0;
  for (const c of CLAIMS) {
    rows.push({ table: "claims", values: [++cid, ...c] });
  }

  const counts: Record<string, number> = {
    warehouses: WAREHOUSES.length,
    carriers: CARRIERS.length,
    shipments: 40,
    stops: 0,
    claims: CLAIMS.length,
  };
  for (const r of rows) if (r.table === "stops") counts.stops += 1;
  return { rows, counts };
}
