// M8 facts part 3 — disambiguate ALTER ADD CONSTRAINT, STRICT tables and
// generated columns on the PRISMA engine (the one the grader actually uses).
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

class SandboxRollback extends Error {
  constructor() { super("__sb__"); }
}

async function sandbox(label: string, sqls: string[]): Promise<void> {
  try {
    await db.$transaction(
      async (tx) => {
        for (const sql of sqls) {
          try {
            const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
            const norm = res.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v])));
            console.log(`[${label}] ${sql.slice(0, 95).replace(/\s+/g, " ")}`);
            console.log("  ->", JSON.stringify(norm.length <= 8 ? norm : norm.slice(0, 8)), `(${norm.length} rows)`);
          } catch (e) {
            console.log(`[${label}] ${sql.slice(0, 95).replace(/\s+/g, " ")}`);
            console.log("  -> ERROR:", e instanceof Error ? e.message.split("\n")[0] : String(e));
          }
        }
        throw new SandboxRollback();
      },
      { maxWait: 5000, timeout: 10_000 },
    );
  } catch (err) {
    if (!(err instanceof SandboxRollback)) throw err;
  }
}

async function main() {
  await resetDatabase();
  console.log("== ALTER ADD CONSTRAINT (unsupported syntax?) ==");
  await sandbox("ac", [
    `ALTER TABLE suppliers ADD CONSTRAINT ck CHECK (rating > 0)`,
    `SELECT COUNT(*) AS n FROM suppliers`,
    // canonical ALTER ADD COLUMN with UNIQUE? (SQLite: UNIQUE via CREATE INDEX only)
    `ALTER TABLE suppliers ADD COLUMN email TEXT UNIQUE`,
    // rename table updates FK references? probe view survival
    `CREATE VIEW sup_v AS SELECT id, name FROM suppliers`,
    `ALTER TABLE suppliers RENAME TO vendors2`,
    `SELECT COUNT(*) AS n FROM sup_v`,
    `SELECT sql FROM sqlite_master WHERE name = 'sup_v'`,
  ]);

  console.log("\n== STRICT + generated on prisma engine ==");
  await sandbox("sg", [
    `CREATE STRICT TABLE st (id INTEGER PRIMARY KEY, name TEXT)`,
    `INSERT INTO st (name) VALUES (42)`,
    `CREATE TABLE gen (price REAL, tax REAL GENERATED ALWAYS AS (price * 0.2) VIRTUAL)`,
    `INSERT INTO gen (price) VALUES (100) RETURNING price, tax`,
    `SELECT COUNT(*) AS gencols FROM pragma_table_info('gen') WHERE hidden > 0`,
  ]);

  console.log("\n== view column facts for problems ==");
  await sandbox("vf", [
    `CREATE VIEW paid_invoice_totals AS SELECT customer_id, SUM(amount_cents) AS cents FROM invoices WHERE status = 'paid' GROUP BY customer_id`,
    `SELECT * FROM paid_invoice_totals ORDER BY cents DESC LIMIT 5`,
    `CREATE VIEW wire_payments AS SELECT paid_on, amount_cents FROM payments WHERE method = 'wire'`,
    `SELECT COUNT(*) AS n FROM wire_payments`,
  ]);
}

main().catch((e) => { console.error(e); process.exit(1); });
