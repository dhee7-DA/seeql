// M8 facts part 2 — verbatim SQLite error messages (bun:sqlite, raw engine
// strings for MCQ honesty) + numeric seed facts for Views/Constraints banks.
// Run: bun scripts/m8-facts2.ts
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m8-facts2.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY);
db.exec("PRAGMA foreign_keys = ON");

function probe(label: string, sqls: string[]): void {
  for (const sql of sqls) {
    try {
      const res = db.query(sql).all() as Record<string, unknown>[];
      const shown = res.length <= 8 ? res : res.slice(0, 8);
      console.log(`[${label}] ${sql.slice(0, 95).replace(/\s+/g, " ")}`);
      if (shown.length > 0) console.log("  ->", JSON.stringify(shown));
    } catch (e) {
      console.log(`[${label}] ${sql.slice(0, 95).replace(/\s+/g, " ")}`);
      console.log("  -> ERROR:", e instanceof Error ? e.message : String(e));
    }
  }
}

probe("msg", [
  // verbatim constraint messages
  `CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL)`,
  `CREATE TABLE tags (id INTEGER)`,
  `CREATE TABLE c1 (email TEXT UNIQUE, rating REAL CHECK (rating >= 0 AND rating <= 5))`,
  `INSERT INTO c1 (email) VALUES ('a@x.com'), ('a@x.com')`,
  `INSERT INTO c1 (rating) VALUES (7.5)`,
  `INSERT INTO c1 (email, rating) VALUES ('b@x.com', -0.5)`,
  `CREATE TABLE c2 (name TEXT NOT NULL)`,
  `INSERT INTO c2 VALUES (NULL)`,
  `CREATE TABLE c3 (pid INTEGER REFERENCES products(id))`,
  `INSERT INTO c3 VALUES (9999)`,
  `CREATE VIEW v1 AS SELECT id FROM customers`,
  `INSERT INTO v1 (id) VALUES (99)`,
  `DROP VIEW v1`,
  `DROP VIEW v1`,
  `DROP TABLE nosuch`,
  `ALTER TABLE nosuch ADD COLUMN x INTEGER`,
  `ALTER TABLE customers DROP COLUMN id`,
  `ALTER TABLE order_items DROP COLUMN order_id`,
  `ALTER TABLE customers DROP COLUMN created_at`,
  // STRICT + generated columns (3.46 supports both)
  `CREATE STRICT TABLE st (id INTEGER PRIMARY KEY, name TEXT)`,
  `INSERT INTO st (name) VALUES (42)`,
  `CREATE TABLE gen (price REAL, tax REAL GENERATED ALWAYS AS (price * 0.2) VIRTUAL)`,
  `INSERT INTO gen (price) VALUES (100) RETURNING price, tax`,
  // ALTER cannot add a constraint / FK to existing column
  `ALTER TABLE suppliers ADD CONSTRAINT ck CHECK (rating > 0)`,
  // temp tables
  `CREATE TEMP TABLE scratch (n INTEGER)`,
  `INSERT INTO scratch VALUES (1) RETURNING *`,
  `SELECT name, type FROM sqlite_temp_master`,
  // view updatable? (simple view SELECT id FROM customers) — SQLite: no
  `CREATE VIEW simple AS SELECT id, name FROM customers WHERE region = 'EU'`,
  `UPDATE simple SET name = 'x' WHERE id = 1`,
  `DELETE FROM simple`,
  // cascade-less FK delete behavior
  `DELETE FROM suppliers WHERE id = 1`,
]);

console.log("\n== numeric seed facts (pristine) ==");
probe("facts", [
  `SELECT (SELECT COUNT(*) FROM customers WHERE active = 1) active_c, (SELECT COUNT(*) FROM customers) all_c`,
  `SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`,
  `SELECT status, COUNT(*) n FROM orders GROUP BY status ORDER BY n DESC`,
  `SELECT COUNT(*) cancelled FROM orders WHERE status = 'cancelled'`,
  `SELECT (SELECT COUNT(*) FROM invoices) inv, (SELECT COUNT(*) FROM payments) pay, (SELECT COUNT(*) FROM expenses) exp, (SELECT COUNT(*) FROM ledger_entries) led`,
  `SELECT status, COUNT(*) n FROM invoices GROUP BY status`,
  `SELECT method, COUNT(*) n, SUM(amount_cents) cents FROM payments GROUP BY method ORDER BY n DESC`,
  `SELECT category, COUNT(*) n FROM expenses GROUP BY category ORDER BY n DESC`,
  `SELECT account, COUNT(*) n FROM ledger_entries GROUP BY account ORDER BY n DESC LIMIT 6`,
  `SELECT SUM(debit_cents) dr, SUM(credit_cents) cr FROM ledger_entries`,
  `SELECT MAX(id) mx FROM customers`,
  `SELECT COUNT(DISTINCT region) regions FROM suppliers`,
  `SELECT region, COUNT(*) n FROM suppliers GROUP BY region ORDER BY n DESC`,
]);

rmSync(COPY);
console.log("\nscratch removed");
