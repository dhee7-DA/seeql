// M8 Schema-pass fact probe — play-faithful DDL receipts for authoring the
// CREATE TABLE / ALTER & DROP / Views / Constraints banks. Every probe runs
// through the SAME sandbox the grader uses (Prisma $transaction + rollback),
// so receipts are exactly what learners see at play time.
// Run: npx tsx scripts/m8-facts.ts
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";

class SandboxRollback extends Error {
  constructor() { super("__sandbox_rollback__"); }
}

/** Run statements inside a rolled-back transaction; capture last result. */
async function sandbox(label: string, sqls: string[]): Promise<void> {
  try {
    await db.$transaction(
      async (tx) => {
        for (const sql of sqls) {
          try {
            const res = (await tx.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
            const shown = res.length <= 8 ? res : res.slice(0, 8);
            console.log(`  [${label}] ${sql.slice(0, 90).replace(/\s+/g, " ")}`);
            if (sql.trim().toUpperCase().startsWith("SELECT") || shown.length > 0) {
              console.log("    ->", JSON.stringify(shown));
            } else {
              console.log("    -> (no rows, ok)");
            }
          } catch (e) {
            console.log(`  [${label}] ${sql.slice(0, 90).replace(/\s+/g, " ")}`);
            console.log("    -> ERROR:", e instanceof Error ? e.message.split("\n")[0] : String(e));
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
  const counts = await resetDatabase();
  console.log("seeded:", counts);

  console.log("\n== sqlite version (play-faithful, prisma engine) ==");
  await sandbox("ver", [`SELECT sqlite_version() AS v`]);

  console.log("\n== pristine sqlite_master: tables & the real runtime DDL ==");
  const master = (await db.$queryRawUnsafe(
    `SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY type, name`,
  )) as Array<Record<string, unknown>>;
  for (const row of master) console.log(`--- ${row.type} ${row.name}\n${row.sql}`);

  console.log("\n== pragma receipts for the five tables ==");
  for (const t of ["customers", "suppliers", "products", "orders", "order_items"]) {
    await sandbox(`pi:${t}`, [`SELECT cid, name, type, \"notnull\", dflt_value, pk FROM pragma_table_info('${t}')`]);
  }

  console.log("\n== FK graph ==");
  for (const t of ["products", "orders", "order_items"]) {
    await sandbox(`fk:${t}`, [`SELECT * FROM pragma_foreign_key_list('${t}')`]);
  }

  console.log("\n== sqlite_sequence / watermark receipts ==");
  await sandbox("seq", [
    `SELECT name, seq FROM sqlite_sequence ORDER BY name`,
    `SELECT MAX(id) AS maxCust FROM customers`,
    `SELECT MAX(id) AS maxProd FROM products`,
  ]);

  console.log("\n== CREATE TABLE receipts ==");
  await sandbox("create", [
    // plain create + insert + verify by pragma
    `CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL)`,
    `INSERT INTO tags (label) VALUES ('sale') RETURNING id, label`,
    `SELECT COUNT(*) AS cols FROM pragma_table_info('tags')`,
    // duplicate name error verbatim
    `CREATE TABLE tags (id INTEGER)`,
    `CREATE TABLE IF NOT EXISTS tags (id INTEGER)`,
    // INTEGER PRIMARY KEY = rowid alias; deleted-max id reuse
    `CREATE TABLE t2 (id INTEGER PRIMARY KEY, v TEXT)`,
    `INSERT INTO t2 (v) VALUES ('a') RETURNING id`,
    `INSERT INTO t2 (id, v) VALUES (9, 'b') RETURNING id`,
    `INSERT INTO t2 (v) VALUES ('c') RETURNING id`,
    `DELETE FROM t2 WHERE id = 10`,
    `INSERT INTO t2 (v) VALUES ('d') RETURNING id`,
    // without-rowid tables NOT probed (rare); TEXT pk
    `CREATE TABLE region_stats (region TEXT PRIMARY KEY, customers INTEGER)`,
    `INSERT INTO region_stats (region, customers) VALUES ('EU', 8), ('APAC', 5) RETURNING rowid, region, customers`,
    // multi-column PK
    `CREATE TABLE pairings (a INTEGER, b INTEGER, PRIMARY KEY (a, b))`,
    `INSERT INTO pairings VALUES (1, 2) RETURNING rowid, a, b`,
    `INSERT INTO pairings VALUES (1, 2)`,
    // bare column list + types
    `CREATE TABLE types_probe (a INTEGER, b TEXT, c REAL, d BLOB, e NUMERIC)`,
    `SELECT COUNT(*) AS cols FROM pragma_table_info('types_probe')`,
  ]);

  console.log("\n== type affinity (SQLite is loosely typed!) ==");
  await sandbox("affinity", [
    `CREATE TABLE aff (a INTEGER, b TEXT, c REAL)`,
    `INSERT INTO aff (a, b, c) VALUES ('abc', 42, 'x') RETURNING a, b, c, typeof(a) ta, typeof(b) tb`,
    `INSERT INTO aff (a) VALUES (3.7) RETURNING a, typeof(a)`,
    `INSERT INTO aff (a) VALUES ('7') RETURNING a, typeof(a)`,
  ]);

  console.log("\n== constraint violations (verbatim messages) ==");
  await sandbox("viol", [
    `CREATE TABLE c1 (id INTEGER PRIMARY KEY, email TEXT UNIQUE, rating REAL CHECK (rating >= 0 AND rating <= 5))`,
    `INSERT INTO c1 (email) VALUES ('a@x.com') RETURNING id`,
    `INSERT INTO c1 (email) VALUES ('a@x.com')`,
    `INSERT INTO c1 (email, rating) VALUES ('b@x.com', 7.5)`,
    `INSERT INTO c1 (id, email) VALUES (NULL, 'c@x.com')`,
    // UNIQUE permits multiple NULLs
    `INSERT INTO c1 (email) VALUES (NULL) RETURNING id`,
    `INSERT INTO c1 (email) VALUES (NULL) RETURNING id`,
    // NOT NULL
    `CREATE TABLE c2 (name TEXT NOT NULL, qty INTEGER DEFAULT 5)`,
    `INSERT INTO c2 (name) VALUES (NULL)`,
    // DEFAULT receipt
    `INSERT INTO c2 (name) VALUES ('probe') RETURNING name, qty`,
    // FK violation play-faithful (prisma: foreign_keys ON)
    `CREATE TABLE c3 (pid INTEGER REFERENCES products(id))`,
    `INSERT INTO c3 (pid) VALUES (9999)`,
    `INSERT INTO c3 (pid) VALUES (1) RETURNING pid`,
    // named constraint + column-level mix
    `CREATE TABLE c4 (price REAL, CHECK (price > 0))`,
    `INSERT INTO c4 VALUES (-1)`,
  ]);

  console.log("\n== ALTER receipts ==");
  await sandbox("alter", [
    `ALTER TABLE suppliers ADD COLUMN city TEXT`,
    `SELECT name, city FROM suppliers ORDER BY id LIMIT 3`,
    `ALTER TABLE suppliers ADD COLUMN tier TEXT NOT NULL DEFAULT 'standard'`,
    `SELECT id, tier FROM suppliers ORDER BY id LIMIT 3`,
    `ALTER TABLE suppliers ADD COLUMN must INTEGER NOT NULL`,
    `ALTER TABLE suppliers RENAME COLUMN rating TO score`,
    `SELECT score FROM suppliers ORDER BY id LIMIT 2`,
    `ALTER TABLE suppliers RENAME TO vendors`,
    `SELECT COUNT(*) AS n FROM vendors`,
    `ALTER TABLE vendors ADD COLUMN pid INTEGER REFERENCES products(id)`,
    `ALTER TABLE vendors DROP COLUMN city`,
    `SELECT cid, name FROM pragma_table_info('vendors')`,
    `ALTER TABLE vendors DROP COLUMN score`,
  ]);

  console.log("\n== VIEW receipts ==");
  await sandbox("views", [
    `CREATE VIEW active_customers AS SELECT id, name, region FROM customers WHERE active = 1`,
    `SELECT COUNT(*) AS n FROM active_customers`,
    `SELECT name FROM sqlite_master WHERE type = 'view'`,
    `CREATE VIEW region_counts (region, n) AS SELECT region, COUNT(*) FROM customers GROUP BY region`,
    `SELECT * FROM region_counts ORDER BY region`,
    `CREATE VIEW eu AS SELECT * FROM active_customers WHERE region = 'EU'`,
    `SELECT COUNT(*) AS n FROM eu`,
    `INSERT INTO active_customers (id, name) VALUES (99, 'x')`,
    `DROP VIEW eu`,
    `SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'view' AND name = 'eu'`,
    `DROP VIEW eu`,
    `DROP VIEW IF EXISTS eu`,
    `CREATE VIEW dup AS SELECT 1 AS x`,
    `CREATE VIEW dup AS SELECT 2 AS x`,
  ]);

  console.log("\n== CREATE TABLE ... AS SELECT ==");
  await sandbox("ctas", [
    `CREATE TABLE cancelled_backup AS SELECT id, customer_id, total FROM orders WHERE status = 'cancelled'`,
    `SELECT COUNT(*) AS n FROM cancelled_backup`,
    `SELECT sql FROM sqlite_master WHERE name = 'cancelled_backup'`,
    `SELECT COUNT(*) AS pk_cols FROM pragma_table_info('cancelled_backup') WHERE pk > 0`,
  ]);

  console.log("\n== done (all rolled back) ==");
  const after = (await db.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM sqlite_master WHERE type IN ('table','view')`)) as Array<Record<string, unknown>>;
  console.log("master objects after rollback:", after);
}

main().catch((e) => { console.error(e); process.exit(1); });
