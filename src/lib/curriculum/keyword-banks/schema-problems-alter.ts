// M8 schema-bank problems — ALTER & DROP (kb-ad-p01..p06). DDL receipts on
// the seed's own suppliers table (sandboxed, rolled back — the storefront
// survives every run).
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const schemaProblemsAlter: Problem[] = [
  p({
    id: "kb-ad-p01", difficulty: "easy",
    title: "The city column",
    brief: "Procurement wants to track vendor cities, but no figure exists yet — add a nullable city TEXT column to suppliers. Every existing row must read NULL afterwards, and nothing else may move.",
    hints: ["ADD COLUMN without NOT NULL leaves existing rows NULL.", "ALTER TABLE suppliers ADD COLUMN city TEXT;"],
    solution: "ALTER TABLE suppliers ADD COLUMN city TEXT;",
    mutating: true,
    verify: `SELECT name, city FROM suppliers ORDER BY id LIMIT 2`,
  }),
  p({
    id: "kb-ad-p02", difficulty: "easy",
    title: "The tier default",
    brief: "The vendor program tiers every supplier — new column tier TEXT NOT NULL DEFAULT 'standard', and all six existing vendors read 'standard' the moment the column lands.",
    hints: ["NOT NULL on ADD COLUMN requires a DEFAULT.", "ALTER TABLE suppliers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';"],
    solution: `ALTER TABLE suppliers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard';`,
    mutating: true,
    verify: `SELECT COUNT(*) AS standard_n FROM suppliers WHERE tier = 'standard'`,
  }),
  p({
    id: "kb-ad-p03", difficulty: "medium",
    title: "The score rename",
    brief: "The analytics layer keeps tripping over 'rating' — rename the column to score in place. The data must survive untouched: Nordic's 4.6 should read from the new name.",
    hints: ["RENAME COLUMN old TO new — data and constraints ride along.", "ALTER TABLE suppliers RENAME COLUMN rating TO score;"],
    solution: "ALTER TABLE suppliers RENAME COLUMN rating TO score;",
    mutating: true,
    verify: `SELECT name, score FROM suppliers ORDER BY id LIMIT 1`,
  }),
  p({
    id: "kb-ad-p04", difficulty: "medium",
    title: "The rating retirement",
    brief: "The vendor score moves to a dedicated service — drop the rating column from suppliers entirely. Three columns should remain (id, name, region), and the engine must not complain: rating is no key, no index, no FK target.",
    hints: ["DROP COLUMN exists on this engine (SQLite 3.35+).", "ALTER TABLE suppliers DROP COLUMN rating;"],
    solution: "ALTER TABLE suppliers DROP COLUMN rating;",
    mutating: true,
    verify: `SELECT COUNT(*) AS cols FROM pragma_table_info('suppliers')`,
  }),
  p({
    id: "kb-ad-p05", difficulty: "medium",
    title: "The vendors rename",
    brief: "The table itself is getting rebranded: rename suppliers to vendors. All six rows must still be there under the new name — and any view built on the old name gets its definition rewritten automatically.",
    hints: ["RENAME TO changes the table's name, not its contents.", "ALTER TABLE suppliers RENAME TO vendors;"],
    solution: "ALTER TABLE suppliers RENAME TO vendors;",
    mutating: true,
    verify: `SELECT COUNT(*) AS n FROM vendors`,
  }),
  p({
    id: "kb-ad-p06", difficulty: "hard",
    title: "The partner link",
    brief: "Some vendors co-brand with products — add partner_id INTEGER REFERENCES products(id) to suppliers. The FK must be engine-enforced from birth; nullable, because most vendors have no partner. The FK receipt should count one relationship.",
    hints: ["ADD COLUMN may carry an inline REFERENCES clause.", "ALTER TABLE suppliers ADD COLUMN partner_id INTEGER REFERENCES products(id);"],
    solution: `ALTER TABLE suppliers ADD COLUMN partner_id INTEGER REFERENCES products(id);`,
    mutating: true,
    verify: `SELECT (SELECT COUNT(*) FROM pragma_foreign_key_list('suppliers')) AS fks, (SELECT COUNT(*) FROM pragma_table_info('suppliers') WHERE name = 'partner_id' AND "notnull" = 1) AS nn_partner`,
  }),
];
