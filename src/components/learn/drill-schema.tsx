"use client";

// Static dictionary of the storefront tables the drills ask about, so a
// learner can check a column without leaving the drill — the exact detour
// that used to kill their in-flight session. Client-safe on purpose: no db
// imports; the shape mirrors sample-db.ts's DDL.

import { Table2 } from "lucide-react";

interface DrillCol {
  n: string;
  t: string;
  ref?: string;
}

interface DrillTable {
  name: string;
  blurb: string;
  cols: DrillCol[];
}

export const DRILL_SCHEMA: DrillTable[] = [
  {
    name: "customers",
    blurb: "people who buy",
    cols: [
      { n: "id", t: "INTEGER · pk" },
      { n: "name", t: "TEXT" },
      { n: "email", t: "TEXT" },
      { n: "city", t: "TEXT" },
      { n: "region", t: "TEXT" },
      { n: "active", t: "INTEGER · 1 = yes" },
      { n: "created_at", t: "TEXT" },
    ],
  },
  {
    name: "suppliers",
    blurb: "where products come from",
    cols: [
      { n: "id", t: "INTEGER · pk" },
      { n: "name", t: "TEXT" },
      { n: "region", t: "TEXT" },
      { n: "rating", t: "REAL" },
    ],
  },
  {
    name: "products",
    blurb: "the catalog",
    cols: [
      { n: "id", t: "INTEGER · pk" },
      { n: "name", t: "TEXT" },
      { n: "category", t: "TEXT" },
      { n: "price", t: "REAL" },
      { n: "stock", t: "INTEGER · default 0" },
      { n: "supplier_id", t: "INTEGER", ref: "suppliers.id" },
    ],
  },
  {
    name: "orders",
    blurb: "one row per checkout",
    cols: [
      { n: "id", t: "INTEGER · pk" },
      { n: "customer_id", t: "INTEGER", ref: "customers.id" },
      { n: "status", t: "TEXT" },
      { n: "total", t: "REAL" },
      { n: "created_at", t: "TEXT" },
      { n: "shipped_at", t: "TEXT · nullable" },
    ],
  },
  {
    name: "order_items",
    blurb: "the lines inside an order",
    cols: [
      { n: "id", t: "INTEGER · pk" },
      { n: "order_id", t: "INTEGER", ref: "orders.id" },
      { n: "product_id", t: "INTEGER", ref: "products.id" },
      { n: "quantity", t: "INTEGER" },
      { n: "unit_price", t: "REAL" },
    ],
  },
];

export function DrillSchemaPanel() {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {DRILL_SCHEMA.map((t) => (
        <div key={t.name} className="sheen rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-100">
            <Table2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            {t.name}
            <span className="ml-auto pl-2 text-right text-[10px] font-normal text-zinc-600">{t.blurb}</span>
          </p>
          <ul className="mt-2 space-y-1">
            {t.cols.map((c) => (
              <li key={c.n} className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] leading-snug">
                <span className="text-zinc-300">{c.n}</span>
                <span className="text-zinc-600">{c.t}</span>
                {c.ref && <span className="text-emerald-300/80">→ {c.ref}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
