// Fill drills for Module 11 — Query Performance & Index Design (lesson 64).
// Read-only fills (SELECT/WITH/EXPLAIN only) — the lesson's CREATE INDEX
// work lives in its mutating problems; here we drill reading the plan and
// the index-hostile rewrites.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 64 — Query Performance: designing for the plan
  64: [
    {
      id: "l64-f1",
      prompt:
        "Prove the PK is a free index: fill the WHERE clause whose plan is a SEARCH through the rowid b-tree — the only column that gets a free descent in this schema.",
      template:
        "EXPLAIN QUERY PLAN\nSELECT * FROM orders\nWHERE {1};",
      chips: [
        "id = 42",
        "status = 'shipped'",
        "customer_id = 1",
        "total > 100",
        "id != 42",
      ],
      answers: ["id = 42"],
      why: "orders.id is the INTEGER PRIMARY KEY — the rowid itself — so equality on it descends the b-tree (SEARCH). Every other column is unindexed in the seed schema: equality or range, the planner sweeps (SCAN).",
      notes: [
        { slot: 1, why: "status = 'shipped' is a real filter, but with no index on status the plan is a full SCAN — the b-tree exists only for the rowid." },
      ],
    },
    {
      id: "l64-f2",
      prompt:
        "Before adding any index, read the truth: fill the read-only prefix that shows HOW the engine will execute a query — the plan, not the rows.",
      template: "{1}\nSELECT * FROM orders WHERE status = 'shipped';",
      chips: [
        "EXPLAIN QUERY PLAN",
        "EXPLAIN ANALYZE",
        "DESCRIBE",
        "EXPLAIN QUERY",
        "PRAGMA PLAN",
      ],
      answers: ["EXPLAIN QUERY PLAN"],
      why: "EXPLAIN QUERY PLAN returns the planner's step list (SCAN vs SEARCH, temp b-trees) without running the query. It's the contract this whole module reads.",
      notes: [
        { slot: 1, why: "EXPLAIN ANALYZE actually EXECUTES the query to measure it — useful elsewhere, but here you want the plan only, cheaply and side-effect-free: EXPLAIN QUERY PLAN." },
      ],
    },
    {
      id: "l64-f3",
      prompt:
        "The June report scans the whole table because the WHERE hides the column behind a function. Fill the range rewrite the planner can act on (June = the whole month).",
      template:
        "SELECT id, created_at, total\nFROM orders\nWHERE {1};",
      chips: [
        "created_at >= '2024-06-01' AND created_at < '2024-07-01'",
        "SUBSTR(created_at, 1, 7) = '2024-06'",
        "strftime('%Y-%m', created_at) = '2024-06'",
        "created_at LIKE '2024-06%'",
        "CAST(created_at AS TEXT) LIKE '2024-06%'",
      ],
      answers: ["created_at >= '2024-06-01' AND created_at < '2024-07-01'"],
      why: "A bare-column range test can use an index on created_at; wrapping the column in SUBSTR/strftime/LIKE-with-wildcard is index-hostile — the planner must evaluate the function per row and sweeps instead.",
      notes: [
        { slot: 1, why: "SUBSTR(created_at, 1, 7) computes a value PER ROW before comparing — even a perfect index on created_at can't help. Move the function to the constants: a half-open range [Jun 1, Jul 1)." },
      ],
    },
  ],
};
