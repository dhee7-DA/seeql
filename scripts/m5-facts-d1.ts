// M5 D1 FACTS PROBE — CAST & typeof receipts (db/custom.db, SQLite 3.53).
// Read-only COPY for reads; a second throwaway WRITABLE copy for the
// UPDATE/affinity probes. Every numeric claim in drills/m5/type-cast.ts
// must trace to a labeled output here.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = ".m5d1.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function q(label: string, sql: string, max = 20) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    const shown = rows.slice(0, max).map(r => Object.values(r).map(v =>
      v === null ? "NULL" : String(v)
    ).join(" | "));
    console.log(`\n[${label}]  (${rows.length} rows)`);
    shown.forEach(s => console.log("  " + s));
    if (rows.length > max) console.log(`  … +${rows.length - max} more`);
  } catch (e) {
    console.log(`\n[${label}]  ERROR: ${e instanceof Error ? e.message : e}`);
  }
}

function e(label: string, sql: string) {
  try {
    db.query(sql).all();
    console.log(`\n[ERR ${label}]  no error`);
  } catch (err) {
    console.log(`\n[ERR ${label}]  ${err instanceof Error ? err.message : err}`);
  }
}

// ===== 1. CAST truncation on products.price =====
q("C01 all products price vs cast", `SELECT id, name, price, CAST(price AS INTEGER) cut FROM products ORDER BY id`);
q("C02 products losing cents", `SELECT COUNT(*) n FROM products WHERE price != CAST(price AS INTEGER)`);
q("C03 products keeping equality", `SELECT name, price FROM products WHERE price = CAST(price AS INTEGER)`);

// ===== 2. CAST text junk / coercion =====
q("C04 text casts", `SELECT CAST('42' AS INTEGER) a, CAST('abc' AS INTEGER) b, CAST('3.9' AS INTEGER) c, CAST('' AS INTEGER) d`);
q("C05 more text casts", `SELECT CAST('34.5' AS INTEGER) a, CAST('-34.5' AS INTEGER) b, CAST('42abc' AS INTEGER) c, CAST('abc42' AS INTEGER) d`);
q("C06 whitespace + sign casts", `SELECT CAST(' 42 ' AS INTEGER) a, CAST(' 42' AS INTEGER) b, CAST('+42' AS INTEGER) c, CAST('- 42' AS INTEGER) d`);
q("C07 sci/hex casts", `SELECT CAST('1e3' AS INTEGER) a, CAST('0x1A' AS INTEGER) b, '1e3' + 0 c, typeof('1e3' + 0) d, '0x1A' + 0 e, typeof('0x1A' + 0) f`);
q("C07b order1 total", `SELECT id, total FROM orders WHERE id = 1`);
q("C50 int alias", `SELECT CAST(3.7 AS INT) a, typeof(CAST(3.7 AS INT)) b, CAST(3.7 AS INTEGER) c`);
q("C51 year prefix cast", `SELECT SUBSTR(created_at, 1, 4) ytxt, typeof(SUBSTR(created_at, 1, 4)) t, CAST(SUBSTR(created_at, 1, 4) AS INTEGER) y, typeof(CAST(SUBSTR(created_at, 1, 4) AS INTEGER)) ty FROM orders ORDER BY id LIMIT 1`);
q("C08 real truncation both signs", `SELECT CAST(-34.5 AS INTEGER) a, CAST(-3.9 AS INTEGER) b, CAST(34.5 AS INTEGER) c, CAST(3.9 AS INTEGER) d`);

// ===== 3. typeof census =====
q("C09 typeof customers", `SELECT typeof(id) a, typeof(name) b, typeof(region) c, typeof(active) d, typeof(created_at) e FROM customers LIMIT 1`);
q("C10 typeof orders", `SELECT typeof(id) a, typeof(total) b, typeof(status) c, typeof(created_at) d FROM orders LIMIT 1`);
q("C11 typeof products", `SELECT typeof(id) a, typeof(name) b, typeof(price) c, typeof(stock) d FROM products LIMIT 1`);
q("C12 typeof(NULL) and casts of NULL", `SELECT typeof(NULL) a, CAST(NULL AS INTEGER) b, typeof(CAST(NULL AS INTEGER)) c, CAST(NULL AS TEXT) d`);
q("C13 typeof five classes", `SELECT typeof(NULL) a, typeof(1) b, typeof(1.5) c, typeof('x') d, typeof(x'41') e`);

// ===== 4. booleans (customers.active) =====
q("C14 active census", `SELECT active, COUNT(*) n FROM customers GROUP BY active ORDER BY active`);
q("C15 inactive customers", `SELECT name, region FROM customers WHERE active = 0`);
q("C16 sum/count/avg active", `SELECT SUM(active) s, COUNT(active) c, AVG(active) a, COUNT(*) total FROM customers`);
q("C17 active = 'true' vs 1", `SELECT COUNT(*) a FROM customers WHERE active = 'true'`);
q("C18 active = 1", `SELECT COUNT(*) n FROM customers WHERE active = 1`);
q("C19 typeof comparison result", `SELECT typeof(total > 100) t, typeof(active = 1) u FROM orders, customers LIMIT 1`);

// ===== 5. money aggregates =====
q("C20 orders money", `SELECT COUNT(*) n, SUM(total) s, AVG(total) a, MIN(total) lo, MAX(total) hi FROM orders`);
q("C21 casts of aggregates", `SELECT CAST(SUM(total) AS INTEGER) a, CAST(AVG(total) AS INTEGER) b, CAST(MIN(total) AS INTEGER) c, CAST(MAX(total) AS INTEGER) d FROM orders`);
q("C22 whole-dollar totals", `SELECT COUNT(*) n FROM orders WHERE CAST(total AS INTEGER) = total`);
q("C23 chloe raw sum", `SELECT c.name, COUNT(*) n, SUM(o.total) raw FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.name = 'Chloe Dubois' GROUP BY c.id`);
q("C24 all raw sums w/ artifacts", `SELECT c.name, SUM(o.total) raw FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id ORDER BY raw DESC LIMIT 8`);

// ===== 6. arithmetic coercion on text =====
q("C25 plus on text", `SELECT '42' + 8 a, typeof('42' + 8) b, '3.9' + 0 c, typeof('3.9' + 0) d`);
q("C26 alpha plus", `SELECT 'abc' + 0 a, 'Alice Chen' + 'Berlin' b, typeof('Alice Chen' + 'Berlin') c, '42abc' + 0 d, typeof('42abc' + 0) e, 'abc42' + 0 f`);
q("C27 '' and spaces plus", `SELECT '' + 0 a, ' ' + 0 b, typeof('' + 0) c`);
q("C28 cast vs plus on 3.9", `SELECT CAST('3.9' AS INTEGER) a, '3.9' + 0 b`);

// ===== 7. CAST AS TEXT rendering =====
q("C29 int/real to text", `SELECT CAST(89 AS TEXT) a, CAST(89.0 AS TEXT) b, CAST(89.99 AS TEXT) c, CAST(34.5 AS TEXT) d, CAST(2.5 AS TEXT) e`);
q("C30 typeof of text casts", `SELECT typeof(CAST(89 AS TEXT)) a, typeof(CAST(89 AS REAL)) b, CAST(89 AS REAL) c, typeof(CAST('abc' AS INTEGER)) d`);
q("C31 varchar length ignored", `SELECT CAST('abcdef' AS VARCHAR(3)) a, CAST('abcdef' AS TEXT) b, typeof(CAST('abcdef' AS VARCHAR(3))) c`);
q("C32 unknown type names", `SELECT CAST(89.99 AS INGEGER) a, typeof(CAST(89.99 AS INGEGER)) b, CAST(89.99 AS BANANA) c, typeof(CAST(89.99 AS BANANA)) d, CAST(90 AS BOOLEAN) e, typeof(CAST(90 AS BOOLEAN)) f`);
q("C33 text casts of max total", `SELECT CAST(1088.44 AS TEXT) a, typeof(CAST(1088.44 AS TEXT)) b`);

// ===== 8. cross-type comparison =====
q("C34 total vs text literal", `SELECT COUNT(*) a FROM orders WHERE total > '999'`);
q("C35 total = 'abc'", `SELECT COUNT(*) a FROM orders WHERE total = 'abc'`);
q("C36 total = numeric text", `SELECT COUNT(*) a FROM orders WHERE total = '1088.44'`);
q("C37 text lexical order", `SELECT '1088.44' < '25.47' lex, MAX(total) m FROM orders`);

// ===== 9. aggregate storage classes =====
q("C38 typeof aggregates", `SELECT typeof(COUNT(*)) a, typeof(AVG(total)) b, typeof(SUM(total)) c, typeof(MAX(total)) d FROM orders`);
q("C39 typeof sum active", `SELECT typeof(SUM(active)) a, typeof(SUM(total)) b FROM customers, orders`);

// ===== 10. integer division / div by zero =====
q("C40 division types", `SELECT 7 / 2 a, typeof(7 / 2) b, 7.0 / 2 c, typeof(7.0 / 2) d, 1 / 0 e, typeof(1 / 0) f, 0 / 0 g`);

// ===== 11. ROUND semantics =====
q("C41 round vs cast", `SELECT ROUND(89.99) a, CAST(89.99 AS INTEGER) b, ROUND(338.19, 1) c, typeof(ROUND(338.19, 1)) d`);
q("C42 round halves", `SELECT ROUND(2.5) a, ROUND(3.5) b, ROUND(-2.5) c, ROUND(-34.5) d, ROUND(34.5) e, ROUND(25.47, 1) f`);
q("C43 round returns real typeof", `SELECT typeof(ROUND(2.5)) a, typeof(CAST(2.5 AS INTEGER)) b, CAST(2.5 AS INTEGER) c, CAST(3.5 AS INTEGER) d`);

// ===== 12. printf =====
q("C44 printf types", `SELECT PRINTF('%.2f', 1088.44) a, typeof(PRINTF('%.2f', 1088.44)) b, PRINTF('%04d', 1) c, typeof(PRINTF('%04d', 1)) d`);

// ===== 13. null propagation =====
q("C45 null poisons", `SELECT LENGTH(NULL) a, UPPER(NULL) b, CAST(NULL AS INTEGER) c, 'x' || NULL d`);

// ===== 14. GROUP BY cast buckets (syntax receipt) =====
q("C46 group by cast", `SELECT CAST(total AS INTEGER) b, COUNT(*) n FROM orders GROUP BY b ORDER BY n DESC, b LIMIT 4`);
q("C47 cast in where", `SELECT COUNT(*) n FROM orders WHERE CAST(total AS INTEGER) >= 1000`);
q("C48 cast in order by", `SELECT name, price FROM products ORDER BY CAST(price AS INTEGER) DESC, price DESC LIMIT 3`);

// ===== 15. case-insensitive spelling =====
q("C49 lowercase cast / TYPEOF", `SELECT cast('42' as integer) a, TYPEOF(total) b FROM orders LIMIT 1`);

// ===== 16. verbatim errors =====
e("E01 cast missing AS", `SELECT CAST(price) FROM products`);
e("E02 cast missing type", `SELECT CAST(price AS) FROM products`);
e("E03 typeof zero args", `SELECT typeof() FROM orders`);
e("E04 typeof two args", `SELECT typeof(total, status) FROM orders`);
e("E05 postgres :: cast", `SELECT price::INTEGER FROM products`);
e("E06 C-style cast", `SELECT INTEGER(price) FROM products`);
e("E07 typo'd function", `SELECT typeif(total) FROM orders`);
e("E08 unknown type name (no error?)", `SELECT CAST(price AS INGEGER) FROM products LIMIT 1`);

db.close();
rmSync(COPY, { force: true });

// ===== 17. WRITABLE-copy probes: affinity vs UPDATE-cast =====
const W = ".m5d1w.db";
copyFileSync("db/custom.db", W);
const w = new Database(W);

try {
  w.exec(`UPDATE orders SET total = CAST(total AS TEXT)`);
  const t1 = w.query(`SELECT typeof(total) t, total v FROM orders LIMIT 1`).all();
  console.log(`\n[W01 after UPDATE total = CAST(total AS TEXT)]  ${JSON.stringify(t1)}`);
  const t2 = w.query(`SELECT COUNT(*) n FROM orders WHERE typeof(total) = 'text'`).get();
  console.log(`[W02 text-typed total rows]  ${JSON.stringify(t2)}`);
  const t3 = w.query(`SELECT SUM(total) s, COUNT(*) n FROM orders WHERE total > 500`).get();
  console.log(`[W03 total > 500 after text-update]  ${JSON.stringify(t3)}`);
} catch (err) {
  console.log(`\n[W01]  ERROR: ${err instanceof Error ? err.message : err}`);
}

try {
  w.exec(`UPDATE customers SET region = CAST(region AS INTEGER)`);
  const r1 = w.query(`SELECT typeof(region) t, region v, COUNT(*) n FROM customers GROUP BY t, v`).all();
  console.log(`\n[W04 after UPDATE region = CAST(region AS INTEGER)]  ${JSON.stringify(r1)}`);
} catch (err) {
  console.log(`\n[W04]  ERROR: ${err instanceof Error ? err.message : err}`);
}

try {
  const z = w.query(`SELECT CAST('EU' AS INTEGER) a, CAST(APAC AS INTEGER) b FROM (SELECT 'APAC' AS APAC)`).all();
  console.log(`\n[W05 cast region literals]  ${JSON.stringify(z)}`);
} catch (err) {
  console.log(`\n[W05]  ERROR: ${err instanceof Error ? err.message : err}`);
}

w.close();
rmSync(W, { force: true });
console.log("\nDONE m5-facts-d1");
