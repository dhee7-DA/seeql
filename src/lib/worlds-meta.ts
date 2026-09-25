// Data worlds — client-safe metadata (pure data, no Prisma import).
// Five worlds share the one SQLite sandbox: the storefront (the 5 tables
// every lesson is built on), the store's finance books (Module 9), and three
// standalone packs seeded on demand: hospital, football, logistics.
// Seed data + DDL live server-side in src/lib/worlds/*-seed.ts.

import type { SchemaRelationship, SchemaTable } from "./sql-types";
import {
  SCHEMA_CANVAS,
  SCHEMA_LAYOUT,
  SCHEMA_RELATIONSHIPS,
  SCHEMA_TABLES,
  SCHEMA_TIPS,
} from "./schema-meta";

export interface WorldFacts {
  [table: string]: string;
}

export interface WorldMeta {
  id: string;
  name: string;
  tagline: string;
  story: string;
  tables: SchemaTable[];
  relationships: SchemaRelationship[];
  layout: Record<string, { x: number; y: number }>;
  canvas: { width: number; height: number };
  tips: Array<{ table: string; column: string }>;
  facts: WorldFacts;
}

/* ---------------- storefront (the lesson world) ---------------- */

const STOREFRONT_FACTS: WorldFacts = {
  customers:
    "16 customers · all 16 have ordered · regions: EU 8, APAC 5, US 2, LATAM 1 · 14 of 16 active",
  suppliers:
    "6 suppliers · regions: APAC 2, EU 2, US 1, LATAM 1 · ratings 3.9 – 4.8 (avg 4.3)",
  products:
    "16 products across 7 categories (Accessories 3, Audio 3, Electronics 3, Apparel 2, Video 2, Wearables 2, Fitness 1) · prices $14.99 – $199.99 · 2,845 units in stock",
  orders:
    "103 orders · delivered 52, shipped 30, pending 14, cancelled 7 · 21 rows with NULL shipped_at (14 pending + 7 cancelled) · totals $25.47 – $1,088.44 (avg $338.19)",
  order_items:
    "251 line items · 1–3 units per line (avg 1.98) · every order and every product appears at least once · 57 lines over $200",
};

const storefront: WorldMeta = {
  id: "storefront",
  name: "Storefront",
  tagline: "the course database",
  story:
    "Every lesson runs against this world — one real storefront. Read it as sentences: one customer places many orders; each order holds several order_items; each order_item points at one product made by one supplier.",
  tables: SCHEMA_TABLES,
  relationships: SCHEMA_RELATIONSHIPS,
  layout: SCHEMA_LAYOUT,
  canvas: SCHEMA_CANVAS,
  tips: SCHEMA_TIPS,
  facts: STOREFRONT_FACTS,
};

/* ---------------- finance (the store's own books) ---------------- */

const finance: WorldMeta = {
  id: "finance",
  name: "Finance books",
  tagline: "Module 9 · invoices & ledger",
  story:
    "The store's own accounting. One invoice bills a customer; payments settle invoices line by line; expenses and the double-entry ledger stand alone. Amounts are integer cents.",
  tables: [
    {
      name: "invoices",
      description: "One row per bill sent to a customer",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "customer_id", type: "INTEGER", fk: { table: "customers", column: "id" } },
        { name: "number", type: "TEXT" },
        { name: "issued_on", type: "TEXT" },
        { name: "due_on", type: "TEXT" },
        { name: "amount_cents", type: "INTEGER" },
        { name: "status", type: "TEXT" },
      ],
    },
    {
      name: "payments",
      description: "Money received against invoices",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "invoice_id", type: "INTEGER", fk: { table: "invoices", column: "id" } },
        { name: "paid_on", type: "TEXT" },
        { name: "amount_cents", type: "INTEGER" },
        { name: "method", type: "TEXT" },
      ],
    },
    {
      name: "expenses",
      description: "Money the store spends",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "category", type: "TEXT" },
        { name: "vendor", type: "TEXT" },
        { name: "spent_on", type: "TEXT" },
        { name: "amount_cents", type: "INTEGER" },
      ],
    },
    {
      name: "ledger_entries",
      description: "Double-entry legs — debits always equal credits",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "entry_date", type: "TEXT" },
        { name: "account", type: "TEXT" },
        { name: "debit_cents", type: "INTEGER" },
        { name: "credit_cents", type: "INTEGER" },
        { name: "memo", type: "TEXT" },
      ],
    },
  ],
  relationships: [
    {
      from: { table: "invoices", column: "id" },
      to: { table: "payments", column: "invoice_id" },
      label: "1—N",
    },
    {
      // Cross-world edge (customers lives in the storefront world) — the ERD
      // skips it (no card position) but the explorer's FK jump uses it.
      from: { table: "customers", column: "id" },
      to: { table: "invoices", column: "customer_id" },
      label: "1—N",
    },
  ],
  layout: {
    expenses: { x: 20, y: 60 },
    ledger_entries: { x: 230, y: 60 },
    invoices: { x: 440, y: 60 },
    payments: { x: 650, y: 60 },
  },
  canvas: { width: 1090, height: 330 },
  tips: [
    { table: "invoices", column: "status" },
    { table: "payments", column: "method" },
    { table: "ledger_entries", column: "account" },
  ],
  facts: {
    invoices:
      "28 invoices · status: open 6, paid 21, void 1 · amounts $873 – $6,148",
    payments:
      "27 payments · methods: card 16, wire 11 · 6 invoices never paid",
    expenses:
      "36 expenses · categories: Ads 14, Rent 14, Tools 5, Travel 3",
    ledger_entries:
      "80 legs · debit $181,080 = credit $181,080 · accounts: accounts_receivable 26, cash 27, operating_expenses 14, sales_revenue 13",
  },
};

/* ---------------- hospital ---------------- */

const med: WorldMeta = {
  id: "med",
  name: "St. Ada General",
  tagline: "hospital pack",
  story:
    "A teaching hospital. One patient is admitted; a visit pairs the patient with one doctor; visits accrue treatments and prescriptions. A NULL discharged_at means the patient is still on the ward.",
  tables: [
    {
      name: "doctors",
      description: "Physicians on staff",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "specialty", type: "TEXT" },
        { name: "ward", type: "TEXT" },
        { name: "rating", type: "REAL" },
      ],
    },
    {
      name: "patients",
      description: "Admissions — NULL discharged_at = still admitted",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "birth_year", type: "INTEGER" },
        { name: "blood_type", type: "TEXT" },
        { name: "admitted_at", type: "TEXT" },
        { name: "discharged_at", type: "TEXT" },
        { name: "ward", type: "TEXT" },
      ],
    },
    {
      name: "visits",
      description: "One row per patient–doctor encounter",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "patient_id", type: "INTEGER", fk: { table: "patients", column: "id" } },
        { name: "doctor_id", type: "INTEGER", fk: { table: "doctors", column: "id" } },
        { name: "visited_at", type: "TEXT" },
        { name: "severity", type: "TEXT" },
        { name: "diagnosis", type: "TEXT" },
        { name: "cost_cents", type: "INTEGER" },
      ],
    },
    {
      name: "treatments",
      description: "Procedures carried out on a visit",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "visit_id", type: "INTEGER", fk: { table: "visits", column: "id" } },
        { name: "name", type: "TEXT" },
        { name: "days", type: "INTEGER" },
        { name: "outcome", type: "TEXT" },
      ],
    },
    {
      name: "prescriptions",
      description: "Drugs prescribed on a visit",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "visit_id", type: "INTEGER", fk: { table: "visits", column: "id" } },
        { name: "drug", type: "TEXT" },
        { name: "dose", type: "TEXT" },
        { name: "days", type: "INTEGER" },
        { name: "refills", type: "INTEGER" },
      ],
    },
  ],
  relationships: [
    { from: { table: "patients", column: "id" }, to: { table: "visits", column: "patient_id" }, label: "1—N" },
    { from: { table: "doctors", column: "id" }, to: { table: "visits", column: "doctor_id" }, label: "1—N" },
    { from: { table: "visits", column: "id" }, to: { table: "treatments", column: "visit_id" }, label: "1—N" },
    { from: { table: "visits", column: "id" }, to: { table: "prescriptions", column: "visit_id" }, label: "1—N" },
  ],
  layout: {
    doctors: { x: 20, y: 60 },
    patients: { x: 230, y: 60 },
    visits: { x: 440, y: 60 },
    treatments: { x: 650, y: 60 },
    prescriptions: { x: 860, y: 60 },
  },
  canvas: { width: 1090, height: 330 },
  tips: [
    { table: "visits", column: "severity" },
    { table: "patients", column: "blood_type" },
    { table: "prescriptions", column: "drug" },
  ],
  facts: {
    doctors:
      "8 doctors · specialties: Cardiology 2, General 1, Neurology 1, Orthopedics 2, Pediatrics 2 · ratings 4.1 – 4.9 (avg 4.5)",
    patients:
      "16 patients · 4 still admitted (NULL discharged_at) · wards: A 4, B 3, C 4, ER 3, ICU 2 · born 1948 – 2011",
    visits:
      "36 visits · severity: mild 22, serious 11, critical 3 · 15 patients came twice or more · costs $34 – $1,250 (avg $318.81)",
    treatments:
      "14 treatments · outcomes: ongoing 10, recovered 4 · stays 2 – 11 days",
    prescriptions:
      "36 prescriptions — one per visit · top drugs: Amoxicillin 8, Atorvastatin 6, Salbutamol 6 · 12 with zero refills",
  },
};

/* ---------------- football ---------------- */

const sport: WorldMeta = {
  id: "sport",
  name: "Northland League",
  tagline: "football pack",
  story:
    "Ten clubs, one August. A match pairs two teams through TWO foreign keys into the same table (home vs away — the self-join lesson); goals point at a match and the scorer. Some players never score.",
  tables: [
    {
      name: "teams",
      description: "The ten clubs of the league",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "city", type: "TEXT" },
        { name: "founded", type: "INTEGER" },
        { name: "stadium", type: "TEXT" },
      ],
    },
    {
      name: "players",
      description: "Squads — four slots per club",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "team_id", type: "INTEGER", fk: { table: "teams", column: "id" } },
        { name: "name", type: "TEXT" },
        { name: "position", type: "TEXT" },
        { name: "squad_number", type: "INTEGER" },
        { name: "signed_on", type: "TEXT" },
      ],
    },
    {
      name: "matches",
      description: "Fixtures — home and away both reference teams",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "played_on", type: "TEXT" },
        { name: "stage", type: "TEXT" },
        { name: "home_team_id", type: "INTEGER", fk: { table: "teams", column: "id" } },
        { name: "away_team_id", type: "INTEGER", fk: { table: "teams", column: "id" } },
        { name: "home_goals", type: "INTEGER" },
        { name: "away_goals", type: "INTEGER" },
      ],
    },
    {
      name: "goals",
      description: "One row per goal scored",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "match_id", type: "INTEGER", fk: { table: "matches", column: "id" } },
        { name: "player_id", type: "INTEGER", fk: { table: "players", column: "id" } },
        { name: "minute", type: "INTEGER" },
        { name: "penalty", type: "INTEGER" },
      ],
    },
  ],
  relationships: [
    { from: { table: "teams", column: "id" }, to: { table: "players", column: "team_id" }, label: "1—N" },
    { from: { table: "teams", column: "id" }, to: { table: "matches", column: "home_team_id" }, label: "home" },
    { from: { table: "teams", column: "id" }, to: { table: "matches", column: "away_team_id" }, label: "away" },
    { from: { table: "matches", column: "id" }, to: { table: "goals", column: "match_id" }, label: "1—N" },
    { from: { table: "players", column: "id" }, to: { table: "goals", column: "player_id" }, label: "1—N" },
  ],
  layout: {
    teams: { x: 20, y: 60 },
    players: { x: 300, y: 60 },
    matches: { x: 580, y: 60 },
    goals: { x: 860, y: 60 },
  },
  canvas: { width: 1090, height: 330 },
  tips: [
    { table: "matches", column: "stage" },
    { table: "players", column: "position" },
    { table: "goals", column: "penalty" },
  ],
  facts: {
    teams:
      "10 clubs · founded 1869 – 1921 · one stadium each",
    players:
      "40 players · positions: DF 10, FW 10, GK 10, MF 10 · 4 per club (GK, DF, MF, FW)",
    matches:
      "24 matches · stage: league 20, cup 4 · 6 draws · biggest winning margin 4 goals",
    goals:
      "59 goals · 8 from the penalty spot · minutes 1 – 89 · top scorer Diego Ashcroft (7) · 15 players never scored",
  },
};

/* ---------------- logistics ---------------- */

const logi: WorldMeta = {
  id: "logi",
  name: "Meridian Freight",
  tagline: "logistics pack",
  story:
    "A freight network. Every shipment leaves one warehouse for another (two FKs into warehouses — alias them to join twice), rides with one carrier, logs intermediate stops, and may draw claims. A NULL delivered_at means it is still moving.",
  tables: [
    {
      name: "warehouses",
      description: "Origin and destination hubs",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "code", type: "TEXT" },
        { name: "city", type: "TEXT" },
        { name: "region", type: "TEXT" },
        { name: "capacity_kg", type: "INTEGER" },
      ],
    },
    {
      name: "carriers",
      description: "Transport companies by mode",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "mode", type: "TEXT" },
        { name: "reliability", type: "REAL" },
      ],
    },
    {
      name: "shipments",
      description: "Freight jobs — origin and dest are both warehouse FKs",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "ref", type: "TEXT" },
        { name: "origin_id", type: "INTEGER", fk: { table: "warehouses", column: "id" } },
        { name: "dest_id", type: "INTEGER", fk: { table: "warehouses", column: "id" } },
        { name: "carrier_id", type: "INTEGER", fk: { table: "carriers", column: "id" } },
        { name: "status", type: "TEXT" },
        { name: "weight_kg", type: "INTEGER" },
        { name: "dispatched_at", type: "TEXT" },
        { name: "delivered_at", type: "TEXT" },
      ],
    },
    {
      name: "stops",
      description: "Intermediate checkpoints in order",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "shipment_id", type: "INTEGER", fk: { table: "shipments", column: "id" } },
        { name: "seq", type: "INTEGER" },
        { name: "location", type: "TEXT" },
        { name: "arrived_at", type: "TEXT" },
      ],
    },
    {
      name: "claims",
      description: "Damage / delay / loss claims",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "shipment_id", type: "INTEGER", fk: { table: "shipments", column: "id" } },
        { name: "filed_on", type: "TEXT" },
        { name: "amount_cents", type: "INTEGER" },
        { name: "reason", type: "TEXT" },
        { name: "status", type: "TEXT" },
        { name: "settled_on", type: "TEXT" },
      ],
    },
  ],
  relationships: [
    { from: { table: "warehouses", column: "id" }, to: { table: "shipments", column: "origin_id" }, label: "origin" },
    { from: { table: "warehouses", column: "id" }, to: { table: "shipments", column: "dest_id" }, label: "dest" },
    { from: { table: "carriers", column: "id" }, to: { table: "shipments", column: "carrier_id" }, label: "1—N" },
    { from: { table: "shipments", column: "id" }, to: { table: "stops", column: "shipment_id" }, label: "1—N" },
    { from: { table: "shipments", column: "id" }, to: { table: "claims", column: "shipment_id" }, label: "1—N" },
  ],
  layout: {
    warehouses: { x: 20, y: 60 },
    carriers: { x: 230, y: 60 },
    shipments: { x: 440, y: 60 },
    stops: { x: 650, y: 60 },
    claims: { x: 860, y: 60 },
  },
  canvas: { width: 1090, height: 330 },
  tips: [
    { table: "shipments", column: "status" },
    { table: "carriers", column: "mode" },
    { table: "claims", column: "reason" },
  ],
  facts: {
    warehouses:
      "6 hubs · regions: EU 3, APAC 1, LATAM 1, US 1",
    carriers:
      "6 carriers · modes: air 2, rail 1, road 2, sea 1 · reliability 0.85 – 0.96",
    shipments:
      "40 shipments · status: delivered 22, in_transit 9, held 5, planned 4 · 18 still in flight (NULL delivered_at) · weights 177 – 5,520 kg",
    stops:
      "56 stops · 14 not yet reached (NULL arrived_at)",
    claims:
      "7 claims worth $3,369 · reasons: damage 3, delay 2, lost 2 · status: open 3, settled 3, rejected 1 · 1 shipment claimed twice",
  },
};

/* ---------------- registry ---------------- */

export const WORLDS: WorldMeta[] = [storefront, finance, med, sport, logi];

export function getWorld(id: string): WorldMeta {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}

/** table name → world id (first world that declares the table wins). */
export const WORLD_FOR_TABLE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const w of WORLDS) for (const t of w.tables) map[t.name] = w.id;
  return map;
})();

/** Every table's schema across all worlds (for explorer lookups + FK jumps). */
export const ALL_SCHEMAS: SchemaTable[] = WORLDS.flatMap((w) => w.tables);

export function schemaFor(table: string): SchemaTable {
  return ALL_SCHEMAS.find((t) => t.name === table) ?? ALL_SCHEMAS[0];
}
